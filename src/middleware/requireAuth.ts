import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};