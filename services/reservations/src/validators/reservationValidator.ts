import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";

export const validateReservation: RequestHandler[] = [
  body("startDate")
    .trim()
    .notEmpty()
    .withMessage("Start date is required.")
    .custom((value) => {
      if (isNaN(Date.parse(value))) {
        throw new Error("Start date must be a valid date.");
      }
      if (new Date(value) <= new Date()) {
        throw new Error("Start date must be in the future.");
      }
      return true;
    }),

  body("endDate")
    .trim()
    .notEmpty()
    .withMessage("End date is required.")
    .custom((value, { req }) => {
      if (!req.body.startDate) {
        throw new Error("Start date is required before validating end date.");
      }
      if (isNaN(Date.parse(value))) {
        throw new Error("End date must be a valid date.");
      }
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after the start date.");
      }
      return true;
    }),

  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["booked", "cancelled", "completed"])
    .withMessage("Status must be 'booked', 'cancelled', or 'completed'."),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  },
];
