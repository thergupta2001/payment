import { CrudService } from "@app/common";
import { Request, Response } from "express";
import User from "../models/user.schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import RedisClient from "@app/common/utils/redis";

const UserService = new CrudService(User);
const jwtSecret = process.env.JWT_SECRET;

const authRedis = RedisClient.getInstance(0);
const transactionRedis = RedisClient.getInstance(1);

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await UserService.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = user?.password
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    await authRedis.del(`auth:${user._id}`);

    const token = jwt.sign({ userId: user._id }, jwtSecret as string, {
      expiresIn: "1h",
    });

    await authRedis.set(`auth:${user._id}`, token, "EX", 3600);

    const exists = await transactionRedis.exists(`user:${user._id}`);

    const userId = user._id;

    if (!exists) {
      console.log(`Creating new Redis entry for user: ${user._id}`);
      await transactionRedis.set(
        `user:${user._id}`,
        JSON.stringify({ userId, email }),
      );
    }

    res.cookie("Authentication", token, {
      httpOnly: true,
      path: "/",
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};
