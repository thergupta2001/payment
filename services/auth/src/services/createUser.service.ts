import { Request, Response } from "express";
import { CrudService } from "@app/common";
import User from "../models/user.schema";
import bcrypt from "bcryptjs";

const UserService = new CrudService(User);

export const createUser = async (req: Request, res: Response) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);

    const user = await UserService.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to create reservation", error: err });
  }
};
