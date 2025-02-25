import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import RedisClient from "@app/common/utils/redis";

const transactionRedis = RedisClient.getInstance(1);

export const processTransaction = async(req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { senderId, receiverId, amount, currency } = req.body;

        if(senderId === receiverId) {
            throw new Error("Sender and receiver cannot be the same");
        }

        const senderExists = await transactionRedis.exists(`user:${senderId}`);
        const receiverExists = await transactionRedis.exists(`user:${receiverId}`);

        if (!senderExists || !receiverExists) {
            throw new Error("Sender or receiver does not exist");
        }
    } catch (error) {
        
    }
}