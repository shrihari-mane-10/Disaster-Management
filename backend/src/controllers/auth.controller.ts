import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { generateToken } from '../lib/jwt.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../lib/errors.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import { Role } from '../types/models.js';


export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, password, role, lat, lng }: RegisterInput = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        passwordHash,
        role: (role as Role) || Role.citizen,
        lat: lat ?? null,
        lng: lng ?? null,
        available: true,
        lastSeenAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        lat: true,
        lng: true,
        available: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });


    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password }: LoginInput = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update lastSeenAt
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        lat: true,
        lng: true,
        available: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role as Role,
    });


    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: updatedUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        lat: true,
        lng: true,
        available: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
