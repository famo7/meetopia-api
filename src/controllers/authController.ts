import { Request, Response } from 'express';
import { LoginRequest, RegisterRequest } from '../models/User';

export const login = (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const { email, password } = req.body;

  console.log('Login attempt:', { email, password });

  res.json({
    message: 'Login endpoint called',
    data: { email, password }
  });
};

export const register = (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  const { email, password, name } = req.body;
  
  console.log('Register attempt:', { email, password, name });

  res.json({
    message: 'Register endpoint called',
    data: { email, password, name }
  });
};
