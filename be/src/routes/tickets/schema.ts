import { z } from "zod";

// API-facing enums (match FE display strings, not DB enum identifiers).
export const statusValues = ["Open Call", "In Progress", "Closed"] as const;
export type ApiStatus = (typeof statusValues)[number];

export const departmentValues = ["CRP", "Education/Migration", "Skill Assessment"] as const;
export type ApiDepartment = (typeof departmentValues)[number];

export const priorityValues = ["Low", "Normal", "High"] as const;
export type ApiPriority = (typeof priorityValues)[number];

// Reusable schemas for ticket payloads and filters.
export const ticketBaseSchema = z.object({
  fullName: z.string().min(1),
  phoneNumber: z.string().min(1),
  email: z.string().email(),
  reason: z.string().min(1),
  priority: z.enum(priorityValues),
  status: z.enum(statusValues),
  assignedTo: z.string().min(1),
  reportedBy: z.string().min(1),
  department: z.enum(departmentValues),
});

export const noteSchema = z.object({
  content: z.string().min(1),
  author: z.string().min(1),
});

export const ticketFilterSchema = z.object({
  status: z.enum(statusValues).optional(),
  priority: z.enum(priorityValues).optional(),
  department: z.enum(departmentValues).optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
});
