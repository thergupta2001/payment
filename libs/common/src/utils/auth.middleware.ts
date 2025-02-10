import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET!;

interface AuthenticatedRequest extends Request {
  user?: any;
}

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
