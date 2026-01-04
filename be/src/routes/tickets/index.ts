import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../db";
import { noteSchema, ticketBaseSchema, ticketFilterSchema } from "./schema";
import {
  buildWhereClause,
  departmentToDb,
  priorityToDb,
  statusToDb,
  toApiTicket,
} from "./mappers";

type TicketResponse = ReturnType<typeof toApiTicket>;

// Guard that a ticket exists before performing work; returns hydrated ticket for reuse.
async function ensureTicketExists(app: FastifyInstance, id: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id }, include: { notes: true } });

  if (!ticket) {
    throw app.httpErrors.notFound("Ticket not found");
  }

  return ticket;
}

export async function registerTicketRoutes(app: FastifyInstance) {
  // List tickets with optional filters (status/priority/department/assignee/search).
  app.get(
    "/",
    async (request) => {
      const query = ticketFilterSchema.parse(request.query);
      const where = buildWhereClause(query);

      const tickets = await prisma.ticket.findMany({
        where,
        include: { notes: true },
        orderBy: { createdOn: "desc" },
      });

      return { data: tickets.map(toApiTicket) };
    }
  );

  // Fetch a single ticket by ID.
  app.get(
    "/:id",
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const ticket = await ensureTicketExists(app, id);
      return { data: toApiTicket(ticket) };
    }
  );

  // Create a ticket.
  app.post(
    "/",
    async (request, reply) => {
      const data = ticketBaseSchema.parse(request.body);

      const ticket = await prisma.ticket.create({
        data: {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          email: data.email,
          reason: data.reason,
          priority: priorityToDb[data.priority],
          status: statusToDb[data.status],
          assignedTo: data.assignedTo,
          reportedBy: data.reportedBy,
          department: departmentToDb[data.department],
        },
        include: { notes: true },
      });

      reply.code(201);
      return { data: toApiTicket(ticket) as TicketResponse };
    }
  );

  // Update selected ticket fields.
  app.patch(
    "/:id",
    async (request) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const changes = ticketBaseSchema.partial().parse(request.body);

      // Early guard ensures 404 over silent upsert.
      await ensureTicketExists(app, id);

      const data: Prisma.TicketUpdateInput = {};

      if (changes.fullName !== undefined) data.fullName = changes.fullName;
      if (changes.phoneNumber !== undefined) data.phoneNumber = changes.phoneNumber;
      if (changes.email !== undefined) data.email = changes.email;
      if (changes.reason !== undefined) data.reason = changes.reason;
      if (changes.priority !== undefined) data.priority = priorityToDb[changes.priority];
      if (changes.status !== undefined) data.status = statusToDb[changes.status];
      if (changes.assignedTo !== undefined) data.assignedTo = changes.assignedTo;
      if (changes.reportedBy !== undefined) data.reportedBy = changes.reportedBy;
      if (changes.department !== undefined) data.department = departmentToDb[changes.department];

      const ticket = await prisma.ticket.update({
        where: { id },
        data,
        include: { notes: true },
      });

      return { data: toApiTicket(ticket) as TicketResponse };
    }
  );

  // Delete a ticket.
  app.delete(
    "/:id",
    async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

      try {
        await prisma.ticket.delete({ where: { id } });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          throw app.httpErrors.notFound("Ticket not found");
        }
        throw error;
      }

      reply.code(204);
      return null;
    }
  );

  // Add note to a ticket.
  app.post(
    "/:id/notes",
    async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      const noteInput = noteSchema.parse(request.body);

      await ensureTicketExists(app, id);

      const note = await prisma.note.create({
        data: {
          id: randomUUID(),
          content: noteInput.content,
          author: noteInput.author,
          ticketId: id,
        },
      });

      reply.code(201);
      return {
        data: {
          id: note.id,
          content: note.content,
          author: note.author,
          timestamp: note.timestamp.toISOString(),
        },
      };
    }
  );

  // Delete a note from a ticket.
  app.delete(
    "/:ticketId/notes/:noteId",
    async (request, reply) => {
      const { ticketId, noteId } = z
        .object({
          ticketId: z.string().uuid(),
          noteId: z.string().uuid(),
        })
        .parse(request.params);

      const note = await prisma.note.findFirst({
        where: { id: noteId, ticketId },
      });

      if (!note) {
        throw app.httpErrors.notFound("Note not found");
      }

      await prisma.note.delete({ where: { id: note.id } });
      reply.code(204);
      return null;
    }
  );
}
