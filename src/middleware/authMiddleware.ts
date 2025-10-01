import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const jwtSecret = process.env.SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: number; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
