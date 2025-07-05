import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Error class
class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Helper functions
const generateTokens = (userId: string, role: string = 'USER') => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// User Registration
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, firstName, lastName } = validatedData;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new AppError('User already exists with this email', 409);
    }
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'USER',
        status: 'PENDING_VERIFICATION'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true
      }
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      tokens: {
        accessToken,
        refreshToken
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: error.errors
        }
      });
    }
    next(error);
  }
};

// User Login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }
    
    // Check if user is active
    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new AppError('Account is suspended or inactive', 403);
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: error.errors
        }
      });
    }
    next(error);
  }
};

// Admin Login
export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = adminLoginSchema.parse(req.body);
    const { email, password } = validatedData;
    
    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { email }
    });
    
    if (!admin) {
      throw new AppError('Invalid admin credentials', 401);
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid admin credentials', 401);
    }
    
    // Check if admin is active
    if (admin.status !== 'ACTIVE') {
      throw new AppError('Admin account is not active', 403);
    }
    
    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });
    
    // Generate tokens with admin role
    const { accessToken, refreshToken } = generateTokens(admin.id, admin.role);
    
    res.json({
      message: 'Admin login successful',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        status: admin.status,
        department: admin.department
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: error.errors
        }
      });
    }
    next(error);
  }
};

// Get User Profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        emailVerified: true
      }
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.json({
      user
    });
    
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just send a success response
  res.json({
    message: 'Logout successful'
  });
};

// Create Default Admin User
export const createDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@florkanewfun.com';
    const adminPassword = 'admin123456';
    
    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      console.log('✅ Default admin user already exists');
      return;
    }
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Default Admin',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        department: 'IT'
      }
    });
    
    console.log('✅ Default admin user created successfully');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('⚠️  Please change the default password in production!');
    
  } catch (error) {
    console.error('❌ Error creating default admin user:', error);
  }
};

// Admin Access Check
export const getAdminAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;
    
    if (!userId || !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      throw new AppError('Admin access required', 403);
    }
    
    // Get admin details
    const admin = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        department: true,
        permissions: true
      }
    });
    
    if (!admin) {
      throw new AppError('Admin not found', 404);
    }
    
    res.json({
      message: 'Admin access granted',
      admin
    });
    
  } catch (error) {
    next(error);
  }
};