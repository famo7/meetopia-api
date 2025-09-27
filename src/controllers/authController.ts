import { Request, Response } from 'express';
import bcrypt from "bcrypt";
import prisma from '../lib/prisma';
import jwt from "jsonwebtoken";
import { LoginRequest, RegisterRequest } from '../validations/User';


export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const jwtSecret = process.env.SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });

  }
};


export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword
      }
    })
    res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'User with this email already exists'
      });
    }
    console.error('Error during user registration:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

};


interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};