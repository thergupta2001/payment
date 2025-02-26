import RabbitMQ from "@app/common/utils/rabbitmq";
import Balance, { IBalance } from "../models/balance.schema";
import { CrudService } from "@app/common";
import mongoose from "mongoose";

const UserBalanceService = new CrudService<IBalance>(Balance);

const consumeBalance = async () => {
  const rabbitmq = await RabbitMQ.getInstance();

  await rabbitmq.consume("user_created", async (data) => {
    const { userId, balance } = data;
    try {
      await UserBalanceService.create({ userId, balance });
    } catch (error) {
      console.error("Failed to initialize user balance:", error);
    }
  });

  await rabbitmq.consume("transaction_created", async (data) => {
    const { transactionId, senderId, receiverId, amount, status } = data;

    if (status !== "pending") return;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const senderBalance = await UserBalanceService.findOne(
        { userId: senderId },
        session
      );
      const receiverBalance = await UserBalanceService.findOne(
        { userId: receiverId },
        session
      );

      if (!senderBalance || !receiverBalance) {
        throw new Error("Balance records not found");
      }

      if (senderBalance.balance < amount) {
        throw new Error("Insufficient funds");
      }

      await UserBalanceService.updateOne(
        { userId: senderId },
        { balance: senderBalance.balance - Number(amount) },
        session
      );

      await UserBalanceService.updateOne(
        { userId: receiverId },
        { balance: receiverBalance.balance + Number(amount) },
        session
      );

      await session.commitTransaction();
      session.endSession();

      await rabbitmq.publish("transaction_updated", {
        transactionId,
        status: "success",
      });
    } catch (error) {
      console.error("Failed to process transaction:", error);

      await session.abortTransaction();
      session.endSession();

      await rabbitmq.publish("transaction_updated", {
        transactionId,
        status: "failed",
      });
    }
  });
};

export default consumeBalance;
