import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Error class
class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Validation schemas
const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'])
});

const updateProjectStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'UNDER_REVIEW'])
});

// Get admin dashboard stats
export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [userStats, projectStats, recentActivity] = await Promise.all([
      // User statistics
      prisma.user.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      
      // Project statistics
      prisma.project.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      
      // Recent users (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);
    
    // Total counts
    const totalUsers = await prisma.user.count();
    const totalProjects = await prisma.project.count();
    const totalAdmins = await prisma.adminUser.count();
    
    res.json({
      stats: {
        users: {
          total: totalUsers,
          byStatus: userStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.id;
            return acc;
          }, {} as Record<string, number>),
          recentSignups: recentActivity
        },
        projects: {
          total: totalProjects,
          byStatus: projectStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.id;
            return acc;
          }, {} as Record<string, number>)
        },
        admins: {
          total: totalAdmins
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Get all users with pagination
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          lastLogin: true,
          _count: {
            select: {
              projects: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        lastLogin: true,
        projects: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.json({ user });
    
  } catch (error) {
    next(error);
  }
};

// Update user status
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserStatusSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: validatedData.status
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true
      }
    });
    
    res.json({
      message: 'User status updated successfully',
      user: updatedUser
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

// Delete user
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Delete user and related data
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

// Get all projects for admin
export const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.project.count({ where })
    ]);
    
    res.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Update project status
export const updateProjectStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateProjectStatusSchema.parse(req.body);
    
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        status: validatedData.status
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    });
    
    res.json({
      message: 'Project status updated successfully',
      project: updatedProject
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

// Delete project
export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    
    // Delete project
    await prisma.project.delete({
      where: { id }
    });
    
    res.json({
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};