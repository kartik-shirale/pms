import { z } from "zod";

// Label schema
export const labelSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, "Invalid color format"),
  departmentId: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return null;
      return typeof val === "string" ? parseInt(val) : val;
    })
    .nullable()
    .optional(),
});

export type LabelInput = z.infer<typeof labelSchema>;

// Status schema
export const statusSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, "Invalid color format"),
  order: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return 0;
      return typeof val === "string" ? parseInt(val) : val;
    })
    .default(0),
});

export type StatusInput = z.infer<typeof statusSchema>;

// Priority schema
export const prioritySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, "Invalid color format"),
  order: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return 0;
      return typeof val === "string" ? parseInt(val) : val;
    })
    .default(0),
});

export type PriorityInput = z.infer<typeof prioritySchema>;
