import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const processTransaction = async(req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { senderId, receiverId, amount, currency } = req.body;

        if(senderId === receiverId) {
            throw new Error("Sender and receiver cannot be the same");
        }


    } catch (error) {
        
    }
}