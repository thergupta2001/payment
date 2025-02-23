import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, validationResult } from "express-validator";
import mongoose from "mongoose";

export const validateUserId: RequestHandler[] = [
  param("id").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid ObjectId");
    }
    return true;
  }),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  },
];
