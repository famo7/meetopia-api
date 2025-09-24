import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { validateData } from '../middleware/validationMiddleware';
import { LoginSchema, RegisterSchema } from '../validations/User';
import { authLimiter } from '../middleware/ratelimit';

const router = Router();


router.post('/login', authLimiter, validateData(LoginSchema), login);
router.post('/register', authLimiter, validateData(RegisterSchema), register);


export default router;
