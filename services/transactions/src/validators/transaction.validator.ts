import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

export const validateTransaction = [
  body("senderId")
    .trim()
    .notEmpty()
    .withMessage("Sender ID is required")
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Sender ID must be a valid MongoDB ObjectId");
      }
      return true;
    }),

  body("receiverId")
    .trim()
    .notEmpty()
    .withMessage("Receiver ID is required")
    .custom((value, { req }) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Receiver ID must be a valid MongoDB ObjectId");
      }
      if (value === req.body.senderId) {
        throw new Error("Sender and receiver cannot be the same");
      }
      return true;
    }),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  },
];
