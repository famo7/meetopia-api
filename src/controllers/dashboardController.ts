import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { DashboardService } from '../services/dashboardService';

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await DashboardService.getDashboardStats(req.user!.userId);
    res.json({ dashboard: stats });
  } catch (err) {
    next(err);
  }
};
