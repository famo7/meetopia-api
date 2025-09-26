import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { validateData } from '../middleware/validationMiddleware';
import { LoginSchema, RegisterSchema } from '../validations/User';
import { authLimiter } from '../middleware/ratelimit';
import { isAuthenticated } from '../middleware/authMiddleware';

const router = Router();


router.post('/login', authLimiter, validateData(LoginSchema), login);
router.post('/register', authLimiter, validateData(RegisterSchema), register);


router.get("/me", isAuthenticated, me)

export default router;

