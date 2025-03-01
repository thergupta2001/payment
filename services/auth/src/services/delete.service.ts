import User from "../models/user.schema";
import { CrudService } from "@app/common";
import RedisClient from "@app/common/utils/redis";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

const UserService = new CrudService(User);

const redis = RedisClient.getInstance();

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params; 
    const objectId = new mongoose.Types.ObjectId(id);

    const user = await UserService.findOne({ _id: objectId });
    if (!user) {
      throw new Error("User not found");
    }

    await UserService.deleteOneById(objectId, session);

    const exists = await redis.exists(`auth:${id}`);
    if (exists) {
      const redisDeleted = await redis.del(`auth:${id}`);
      if (redisDeleted === 0) {
        console.warn(`Redis key auth:${id} not found at deletion`);
      }
    } else {
      console.warn(`Skipping Redis deletion, key auth:${id} does not exist`);
    }

    const transactionExists = await redis.exists(`user:${id}:balance`);
    if (transactionExists) {
      const redisDeletedTransaction = await redis.del(`user:${id}:balance`);
      if (redisDeletedTransaction === 0) {
        console.warn(`Redis key user:${id} not found at deletion`);
      }
    } else {
      console.warn(`Skipping Redis deletion, key user:${id} does not exist`);
    }

    await session.commitTransaction();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    next(error); 
  } finally {
    session.endSession();
  }
};
