import { Role } from '@/types/Tuser'
import { z } from 'zod'

export const validateSignup = z.object({
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters long')
    .max(50, 'First name must be at most 50 characters long'),

  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters long')
    .max(50, 'Last name must be at most 50 characters long'),

  email: z.string().email('Invalid email address').optional(),

  role: z.enum(Object.values(Role) as [string, ...string[]]).optional(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be at most 128 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
})

export const validateSignin = z.object({
  email: z.string().email('Invalid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long') // Fixed: was 7
    .max(128, 'Password must be at most 128 characters long') // Increased limit
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
})

export const validateResetEmail = z.object({
  email: z.string().email('Invalid email address'),
})

export const validateResetPassword = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password must be at most 128 characters long') // Increased limit
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),

    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters long')
      .max(128, 'Confirm password must be at most 128 characters long') // Increased limit
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Confirm password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })
