import { Request, Response } from "express";

class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
) => {
  console.error("Error: ", err);
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err?.message });
    return;
  }

  res.status(500).json({ message: "Something went wrong!" });
  return;
};

export { AppError, errorHandler };
