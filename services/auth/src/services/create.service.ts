import { Request, Response } from "express";
import { CrudService } from "@app/common";
import User from "../models/user.schema";
import bcrypt from "bcryptjs";
import RedisClient from "@app/common/utils/redis";
import mongoose from "mongoose";

const UserService = new CrudService(User);

const transactionRedis = RedisClient.getInstance(1);

export const createUser = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const user = await UserService.create(req.body, { session });

    const userId = user._id;
    const email = user.email;

    const redisPipeline = transactionRedis.multi();
    redisPipeline.set(`user:${user._id}`, JSON.stringify({ userId, email }));

    await redisPipeline.exec();

    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json(user);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: "Failed to create user", error: err });
  }
};
