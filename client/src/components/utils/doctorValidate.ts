import { Gender } from "@/types/Tuser";
import z from "zod";

export const doctorSchema = z.object({
  license_number: z.string().min(1, 'License number is required'),
  phone_number: z.string().optional(),
  specialization: z.string().optional(),
  years_of_experience: z.number().min(0, 'Years of experience must be 0 or greater'),
  education: z.string().min(1, 'Education is required'),
  department: z.string().min(1, 'Department is required'),
  availability: z.boolean(),
  sex: z.enum(Object.values(Gender) as [string, ...string[]]),
  address: z.string().min(1, 'Address is required'),
  consultation_fee: z.number().min(0, 'Consultation fee must be 0 or greater').optional(),
  days: z.array(z.string()).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  avatar: z.string().url('Please provide a valid URL for avatar'),
  bio: z.string().optional(),
})