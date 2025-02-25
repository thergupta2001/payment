import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import RedisClient from "@app/common/utils/redis";
import RabbitMQ from "@app/common/utils/rabbitmq";
import { CrudService } from "@app/common";
import Transaction, { ITransaction } from "../models/transactions.schema";

const transactionRedis = RedisClient.getInstance(1);
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

    const senderExists = await transactionRedis.exists(`user:${senderId}`);
    const receiverExists = await transactionRedis.exists(`user:${receiverId}`);

    if (!senderExists || !receiverExists) {
      throw new Error("Sender or receiver does not exist");
    }

    const senderBalance = await transactionRedis.get(
      `user:${senderId}:balance`
    );
    const receiverBalance = await transactionRedis.get(
      `user:${receiverId}:balance`
    );

    if (!senderBalance || !receiverBalance) {
      throw new Error("Balance information is missing for one of the users");
    }

    const senderBalanceNum = parseFloat(senderBalance);
    const receiverBalanceNum = parseFloat(receiverBalance);

    if (senderBalanceNum < amount) {
      throw new Error("Insufficient funds");
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

    const newSenderBalance = senderBalanceNum - amount;
    await transactionRedis.set(
      `user:${senderId}:balance`,
      JSON.stringify({ balance: newSenderBalance })
    );

    const newReceiverBalance = receiverBalanceNum + amount;
    await transactionRedis.set(
      `user:${receiverId}:balance`,
      JSON.stringify({ balance: newReceiverBalance })
    );

    const rabbitmq = await RabbitMQ.getInstance();
    await rabbitmq.publish(
      "transactions",
      {
        transactionId: transaction._id,
        senderId: senderObjectId.toString(),
        receiverId: receiverObjectId.toString(),
        amount,
        status: "pending",
      }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
