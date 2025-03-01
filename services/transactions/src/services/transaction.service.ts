import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import RedisClient from "@app/common/utils/redis";
import RabbitMQ from "@app/common/utils/rabbitmq";
import { CrudService } from "@app/common";
import Transaction, { ITransaction } from "../models/transactions.schema";

const redis = RedisClient.getInstance();
const transactionService = new CrudService<ITransaction>(Transaction);

export const processTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { senderId, receiverId, amount } = req.body;

    if (senderId === receiverId) {
      throw new Error("Sender and receiver cannot be the same");
    }

    const senderData = await redis.get(`user:${senderId}:balance`);
    const receiverData = await redis.get(`user:${receiverId}:balance`);

    if(!senderData || !receiverData) {
      throw new Error("Balance information is missing for one of the users");
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const transaction = await transactionService.create(
      {
        senderId: senderObjectId,
        receiverId: receiverObjectId,
        amount,
        status: "pending",
      },
      { session }
    );

    const rabbitmq = await RabbitMQ.getInstance();
    await rabbitmq.publish("transaction_created", {
      transactionId: transaction._id,
      senderId: senderObjectId,
      receiverId: receiverObjectId,
      amount,
      status: "pending",
    });

    await rabbitmq.consume("transaction_updated", async (data) => {
      const { transactionId, status } = data;

      try {
        const transaction = await transactionService.findOneById(transactionId);
        if (!transaction) {
          console.error(`Transaction not found: ${transactionId}`);
          return;
        }

        await transactionService.updateOne({ _id: transactionId }, { status });

        console.log(
          `Transaction ${transactionId} updated to status: ${status}`
        );
      } catch (error) {
        console.error("Failed to update transaction status:", error);
      }
    });

    await session.commitTransaction();
    session.endSession();

    res.status(202).json({
      success: true,
      message: "Transaction is being processed",
      transactionId: transaction._id,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
