import { z } from "zod";

// Base employee schema with all fields
export const employeeSchema = z.object({
  // Account Management
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  employeeId: z.string().optional(),
  
  // Profile Information
  jobTitle: z.string().optional(),
  departmentId: z.number().int().positive().optional(),
  role: z.enum(["admin", "department_head", "group_leader", "member"]).optional(),
  power: z.enum(["monitoring", "full"]).optional(),
  
  // Contact Info
  phone: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  
  // Address/Location
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  
  // Additional Info
  dateOfBirth: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  dateOfJoining: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  
  // Profile Image (base64 encoded string)
  profileImageBase64: z.string().optional(),
  
  // Password (for creation only)
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  autoGeneratePassword: z.boolean().optional(),
});

export const createEmployeeSchema = employeeSchema.extend({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const updateEmployeeSchema = employeeSchema.partial().extend({
  id: z.string().min(1, "User ID is required"),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type CreateEmployeeData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeData = z.infer<typeof updateEmployeeSchema>;
