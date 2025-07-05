import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long');
export const idSchema = z.string().uuid('Invalid ID format');

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
});

// Search schema
export const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional()
});

// User status enum
export const userStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE', 
  'SUSPENDED',
  'PENDING_VERIFICATION'
]);

// Project status enum
export const projectStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
  'UNDER_REVIEW'
]);

// User role enum
export const userRoleSchema = z.enum([
  'USER',
  'PREMIUM_USER',
  'MODERATOR'
]);

// Admin role enum
export const adminRoleSchema = z.enum([
  'ADMIN',
  'SUPER_ADMIN'
]);

// Validation helper functions
export const validatePagination = (query: any) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  
  return paginationSchema.parse({ page, limit });
};

export const validateSearch = (query: any) => {
  return searchSchema.parse({
    search: query.search,
    category: query.category,
    status: query.status
  });
};

// Custom validation messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: 'Password must be at least 6 characters long',
  passwordMatch: 'Passwords do not match',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  invalidFormat: 'Invalid format',
  notFound: 'Resource not found',
  unauthorized: 'Unauthorized access',
  forbidden: 'Access forbidden',
  conflict: 'Resource already exists',
  serverError: 'Internal server error'
};