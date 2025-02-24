import RabbitMQ from "@app/common/utils/rabbitmq";
import User from "../models/user.schema";
import { CrudService } from "@app/common";
import RedisClient from "@app/common/utils/redis";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

const UserService = new CrudService(User);

const authRedis = RedisClient.getInstance(0);

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

    const redisDeleted = await authRedis.del(`auth:${id}`);
    if (redisDeleted === 0) {
      throw new Error("Redis deletion failed");
    }

    const mq = await RabbitMQ.getInstance();
    await mq.publish("deleteUser", { userId: id });

    await session.commitTransaction();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    next(error); 
  } finally {
    session.endSession();
  }
};
