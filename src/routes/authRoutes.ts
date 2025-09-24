import { Router } from 'express';
import { login, register } from '../controllers/authController';
import { validateData } from '../../middleware/validationMiddleware';
import { LoginSchema, RegisterSchema } from '../validations/User';

const router = Router();

router.post('/login', validateData(LoginSchema), login);
router.post('/register', validateData(RegisterSchema), register);


export default router;
