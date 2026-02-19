import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  code: z.string().min(2, "Code must be at least 2 characters").max(20, "Code must be at most 20 characters").regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, and underscores"),
  description: z.string().max(500, "Description must be at most 500 characters").optional().nullable(),
  image: z.string().url("Image must be a valid URL").optional().nullable(),
  headId: z.string().optional().nullable(),
});

export const updateDepartmentSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2).max(100).optional(),
  code: z.string().min(2).max(20).regex(/^[A-Z0-9_-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  image: z.string().url().optional().nullable(),
  headId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
