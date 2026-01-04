import { Prisma, TicketPriority, TicketStatus, Department } from "@prisma/client";
import { ApiDepartment, ApiPriority, ApiStatus } from "./schema";

// Bidirectional enum maps let the DB use enum-safe identifiers while the API
// keeps the human-readable strings the FE already expects.
export const statusToDb: Record<ApiStatus, TicketStatus> = {
  "Open Call": "OpenCall",
  "In Progress": "InProgress",
  Closed: "Closed",
};

export const statusFromDb: Record<TicketStatus, ApiStatus> = {
  OpenCall: "Open Call",
  InProgress: "In Progress",
  Closed: "Closed",
};

export const departmentToDb: Record<ApiDepartment, Department> = {
  CRP: "CRP",
  "Education/Migration": "EducationMigration",
  "Skill Assessment": "SkillAssessment",
};

export const departmentFromDb: Record<Department, ApiDepartment> = {
  CRP: "CRP",
  EducationMigration: "Education/Migration",
  SkillAssessment: "Skill Assessment",
};

export const priorityToDb: Record<ApiPriority, TicketPriority> = {
  Low: "Low",
  Normal: "Normal",
  High: "High",
};

export const priorityFromDb: Record<TicketPriority, ApiPriority> = {
  Low: "Low",
  Normal: "Normal",
  High: "High",
};

// Normalize a Prisma ticket (with notes) into FE-friendly JSON:
// - enum values converted to display strings
// - dates serialized to ISO strings
// - notes sorted newest-first
export function toApiTicket(ticket: Prisma.TicketGetPayload<{ include: { notes: true } }>) {
  return {
    id: ticket.id,
    fullName: ticket.fullName,
    phoneNumber: ticket.phoneNumber,
    email: ticket.email,
    reason: ticket.reason,
    priority: priorityFromDb[ticket.priority],
    status: statusFromDb[ticket.status],
    assignedTo: ticket.assignedTo,
    reportedBy: ticket.reportedBy,
    department: departmentFromDb[ticket.department],
    createdOn: ticket.createdOn.toISOString(),
    notes: ticket.notes
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .map((note) => ({
        id: note.id,
        content: note.content,
        author: note.author,
        timestamp: note.timestamp.toISOString(),
      })),
  };
}

// Build Prisma filters from query params; avoids repeating the same logic in each handler.
export function buildWhereClause(filters: {
  status?: ApiStatus;
  priority?: ApiPriority;
  department?: ApiDepartment;
  assignedTo?: string;
  search?: string;
}): Prisma.TicketWhereInput {
  const where: Prisma.TicketWhereInput = {};

  if (filters.status) where.status = statusToDb[filters.status];
  if (filters.priority) where.priority = priorityToDb[filters.priority];
  if (filters.department) where.department = departmentToDb[filters.department];

  if (filters.assignedTo) {
    where.assignedTo = { contains: filters.assignedTo, mode: "insensitive" };
  }

  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { phoneNumber: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}
