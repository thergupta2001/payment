import { CrudService } from "@app/common";
import Balance from "../models/balance.schema";
import RedisClient from "@app/common/utils/redis";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

const BalanceService = new CrudService(Balance);
const redis = RedisClient.getInstance();

export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const cachedBalance = await redis.get(`balance:${id}`);

  const objectId = new mongoose.Types.ObjectId(id);

  if (cachedBalance) {
    res.status(200).json({ balance: Number(cachedBalance) });
    return;
  }

  try {
    const balance = await BalanceService.findOne({ userId: objectId });
    if (!balance) {
      res.status(404).json({ message: "Balance not found" });
      return;
    }

    await redis.set(`balance:${id}`, balance.balance, "EX", 3600);

    res.status(200).json({ balance: balance.balance });
  } catch (error) {
    next(error);
  }

  return;
};
