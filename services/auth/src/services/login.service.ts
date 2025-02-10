import { CrudService } from "@app/common";
import { Request, Response } from "express";
import User from "../models/user.schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserService = new CrudService(User);
const jwtSecret = process.env.JWT_SECRET;

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

    const token = jwt.sign({ userId: user._id }, jwtSecret as string, {
      expiresIn: "1h",
    });

    res.cookie("Authentication", token, {
      httpOnly: true,
      path: "/",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
};
