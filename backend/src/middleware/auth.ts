import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Error class
class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Interface for JWT payload
interface JWTPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

// Verify JWT Token
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new AppError('Access token required', 401);
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Check if user still exists
    let user;
    if (['ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
      user = await prisma.adminUser.findUnique({
        where: { id: decoded.userId },
        select: { id: true, status: true, role: true }
      });
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, status: true, role: true }
      });
    }
    
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }
    
    // Check if user is active
    if (user.status !== 'ACTIVE' && user.status !== 'PENDING_VERIFICATION') {
      throw new AppError('User account is not active', 403);
    }
    
    // Add user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    
    next();
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: {
          message: 'Invalid token'
        }
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: {
          message: 'Token expired'
        }
      });
    }
    
    next(error);
  }
};

// Require specific roles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole || !roles.includes(userRole)) {
        throw new AppError('Insufficient permissions', 403);
      }
      
      next();
      
    } catch (error) {
      next(error);
    }
  };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // Continue without authentication
    }
    
    // Try to verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Check if user still exists
    let user;
    if (['ADMIN', 'SUPER_ADMIN'].includes(decoded.role)) {
      user = await prisma.adminUser.findUnique({
        where: { id: decoded.userId },
        select: { id: true, status: true, role: true }
      });
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, status: true, role: true }
      });
    }
    
    if (user && (user.status === 'ACTIVE' || user.status === 'PENDING_VERIFICATION')) {
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };
    }
    
    next();
    
  } catch (error) {
    // If token verification fails, continue without authentication
    next();
  }
};

// Rate limiting middleware (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientIP);
    
    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize counter
      requestCounts.set(clientIP, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        error: {
          message: 'Too many requests, please try again later'
        }
      });
    }
    
    // Increment counter
    clientData.count++;
    requestCounts.set(clientIP, clientData);
    
    next();
  };
};

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60000); // Clean up every minute