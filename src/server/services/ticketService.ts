import { eq, min } from 'drizzle-orm';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import type { CreateTicketInput } from '@/shared/validations/ticket';

const isOverdue = (dueDate: string | null, status: string): boolean => {
  if (!dueDate || status === 'DONE') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
};

export const create = async (input: CreateTicketInput) => {
  const [{ minPosition }] = await db
    .select({ minPosition: min(tickets.position) })
    .from(tickets)
    .where(eq(tickets.status, 'BACKLOG'));

  const position = minPosition == null ? 0 : Number(minPosition) - 1024;

  const [ticket] = await db
    .insert(tickets)
    .values({
      title: input.title,
      description: input.description ?? null,
      status: 'BACKLOG',
      priority: input.priority,
      position,
      plannedStartDate: input.plannedStartDate ?? null,
      dueDate: input.dueDate ?? null,
    })
    .returning();

  return { ...ticket, isOverdue: isOverdue(ticket.dueDate, ticket.status) };
};
