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
const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT')
});

const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional()
});

// Get all projects (with optional authentication)
export const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const isAuthenticated = !!req.user;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    // If not authenticated, only show public projects
    if (!isAuthenticated) {
      where.isPublic = true;
      where.status = 'PUBLISHED';
    } else {
      // If authenticated, show public projects and user's own projects
      where.OR = [
        { isPublic: true, status: 'PUBLISHED' },
        { userId: req.user!.userId }
      ];
    }
    
    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (status && isAuthenticated) {
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
          category: true,
          tags: true,
          isPublic: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
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

// Get public projects only
export const getPublicProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    
    const skip = (page - 1) * limit;
    
    // Build where clause for public projects only
    const where: any = {
      isPublic: true,
      status: 'PUBLISHED'
    };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      where.category = category;
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
          category: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
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

// Get project by ID
export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const isAuthenticated = !!req.user;
    
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        category: true,
        tags: true,
        isPublic: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    
    // Check access permissions
    const isOwner = isAuthenticated && req.user!.userId === project.userId;
    const isAdmin = isAuthenticated && ['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);
    const isPublicAndPublished = project.isPublic && project.status === 'PUBLISHED';
    
    if (!isOwner && !isAdmin && !isPublicAndPublished) {
      throw new AppError('Access denied', 403);
    }
    
    res.json({ project });
    
  } catch (error) {
    next(error);
  }
};

// Create new project
export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);
    const userId = req.user!.userId;
    
    const project = await prisma.project.create({
      data: {
        ...validatedData,
        userId
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        tags: true,
        isPublic: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    res.status(201).json({
      message: 'Project created successfully',
      project
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

// Update project
export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedData = updateProjectSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    
    // Find the project
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        title: true
      }
    });
    
    if (!existingProject) {
      throw new AppError('Project not found', 404);
    }
    
    // Check permissions
    const isOwner = userId === existingProject.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);
    
    if (!isOwner && !isAdmin) {
      throw new AppError('Access denied', 403);
    }
    
    const updatedProject = await prisma.project.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        category: true,
        tags: true,
        isPublic: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    res.json({
      message: 'Project updated successfully',
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
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    
    // Find the project
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        title: true
      }
    });
    
    if (!existingProject) {
      throw new AppError('Project not found', 404);
    }
    
    // Check permissions
    const isOwner = userId === existingProject.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);
    
    if (!isOwner && !isAdmin) {
      throw new AppError('Access denied', 403);
    }
    
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

// Get projects by current user
export const getProjectsByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      userId
    };
    
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
          category: true,
          tags: true,
          isPublic: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'desc'
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