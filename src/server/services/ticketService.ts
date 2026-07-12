import { eq, min } from 'drizzle-orm';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { today } from '@/shared/utils/today';
import { TICKET_STATUS, type Ticket, type TicketPriority, type TicketStatus } from '@/shared/types';
import type { CreateTicketInput } from '@/shared/validations/ticket';

const isOverdue = (dueDate: string | null, status: TicketStatus): boolean => {
  if (!dueDate || status === TICKET_STATUS.DONE) return false;
  return new Date(dueDate) < today();
};

export const create = async (input: CreateTicketInput): Promise<Ticket> => {
  const [{ minPosition }] = await db
    .select({ minPosition: min(tickets.position) })
    .from(tickets)
    .where(eq(tickets.status, TICKET_STATUS.BACKLOG));

  const position = minPosition == null ? 0 : Number(minPosition) - 1024;

  const [ticket] = await db
    .insert(tickets)
    .values({
      title: input.title,
      description: input.description ?? null,
      status: TICKET_STATUS.BACKLOG,
      priority: input.priority,
      position,
      plannedStartDate: input.plannedStartDate ?? null,
      dueDate: input.dueDate ?? null,
    })
    .returning();

  const status = ticket.status as TicketStatus;

  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status,
    priority: ticket.priority as TicketPriority,
    position: ticket.position,
    plannedStartDate: ticket.plannedStartDate,
    dueDate: ticket.dueDate,
    startedAt: ticket.startedAt ? ticket.startedAt.toISOString() : null,
    completedAt: ticket.completedAt ? ticket.completedAt.toISOString() : null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    isOverdue: isOverdue(ticket.dueDate, status),
  };
};
