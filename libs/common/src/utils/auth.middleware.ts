import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "./authenticate.types";

const jwtSecret = process.env.JWT_SECRET!;

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      res.status(401).send("Unauthorized");
      return;
    }

    let token: string | null = null;
    const match = cookieHeader.match(/Authentication=([^;]+)/);
    if (match) {
      token = match[1];
    }

    if (!token) {
      res.status(401).send("Unauthorized");
      return;
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}
