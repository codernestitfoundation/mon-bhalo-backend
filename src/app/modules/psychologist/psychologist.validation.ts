import { z } from "zod";
import { ApplicationStatus } from "./psychologist.interface";

const educationValidationSchema = z.object({
  degree: z.string({ error: "Degree is required" }),
  institute: z.string({ error: "Institute is required" }),
  year: z.string({ error: "Year is required" }),
});

export const createPsychologistSchema = z.object({
  specialization: z
    .array(z.string())
    .min(1, "At least one specialization is required"),
  education: z
    .array(educationValidationSchema)
    .min(1, "Education history is required"),
  experience: z.number().min(0),
  bio: z.string().min(20, "Bio should be at least 20 characters"),
  sessionFee: z.number().positive("Fee must be a positive number"),
});

export const updatePsychologistSchema = z.object({
  specialization: z.array(z.string()).optional(),
  education: z.array(educationValidationSchema).optional(),
  experience: z.number().optional(),
  bio: z.string().min(20).optional(),
  sessionFee: z.number().positive().optional(),
  status: z.enum(Object.values(ApplicationStatus) as [string]).optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  deleteImages: z.array(z.string()).optional(),
});
