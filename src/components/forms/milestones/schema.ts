import { z } from "zod";

export const milestoneSchema = z.object({
  title: z.string().min(1, "Milestone title is required"),
  description: z.string().optional(),
  projectInstanceId: z.number().min(1, "Project is required"),
  statusId: z.number().min(1, "Status is required"),
  priorityId: z.number().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
});

export type MilestoneFormData = z.infer<typeof milestoneSchema>;
