import { NextFunction, Request, Response } from "express";
import { CrudService } from "@app/common";
import User, { IUser } from "../models/user.schema";
import bcrypt from "bcryptjs";
import RedisClient from "@app/common/utils/redis";
import mongoose from "mongoose";
import RabbitMQ from "@app/common/utils/rabbitmq";

const UserService = new CrudService<IUser>(User);
const redis = RedisClient.getInstance();

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const user = await UserService.create(req.body, { session });

    const userId = user._id.toString();
    const balance = 2000;

    const redisPipeline = redis.multi();
    redisPipeline.set(`user:${userId}:balance`, JSON.stringify({ userId, balance }));

    await redisPipeline.exec();

    const rabbitmq = await RabbitMQ.getInstance();
    await rabbitmq.publish("user_created", { userId });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(user);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
