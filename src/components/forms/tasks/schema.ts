import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priorityId: z.number().optional(),
  projectInstanceId: z.number().optional(),
  milestoneId: z.number().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
  labelIds: z.array(z.number()),
  isPrivate: z.boolean(),
  departmentId: z.number().optional(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
