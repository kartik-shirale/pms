import { z } from "zod";

export const projectTemplateSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  statusId: z.number().min(1, "Status is required"),
  priorityId: z.number().optional(),
  seekerId: z.string().optional(),
  image: z.any().optional(), // File object from form
});

export type ProjectTemplateFormData = z.infer<typeof projectTemplateSchema>;

export const projectInstanceSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  departmentId: z.number().min(1, "Department is required"),
  statusId: z.number().min(1, "Status is required"),
  priorityId: z.number().optional(),
  assigneeId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type ProjectInstanceFormData = z.infer<typeof projectInstanceSchema>;

