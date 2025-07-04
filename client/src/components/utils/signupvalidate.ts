
import { z } from 'zod';

export const validateSignup = z.object({
    first_name: z.string()
    .min(2, 'First name must be at least 2 characters long')
    .max(50, 'First name must be at most 50 characters long'),

    last_name: z.string()
    .min(2, 'Last name must be at least 2 characters long')
    .max(50, 'Last name must be at most 50 characters long'),

    email: z.string()
    .email('Invalid email address'),

    password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must be at most 16 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

})

export const validateSignin = z.object({
    email: z.string()
    .email('Invalid email address'),

    password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must be at most 16 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
})