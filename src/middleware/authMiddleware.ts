import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { userId: number; email: string };
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const jwtSecret = process.env.SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in env");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: number; email: string };
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};
