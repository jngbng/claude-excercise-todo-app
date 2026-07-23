import { asc, eq, min } from 'drizzle-orm';
import { db } from '@/server/db';
import { tickets } from '@/server/db/schema';
import { today } from '@/shared/utils/today';
import {
  TICKET_STATUS,
  type BoardData,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from '@/shared/types';
import type { CreateTicketInput } from '@/shared/validations/ticket';

const DONE_VISIBLE_WINDOW_MS = 24 * 60 * 60 * 1000;

const isOverdue = (dueDate: string | null, status: TicketStatus): boolean => {
  if (!dueDate || status === TICKET_STATUS.DONE) return false;
  return new Date(dueDate) < today();
};

const isDoneVisible = (completedAt: Date | null): boolean =>
  completedAt != null && Date.now() - completedAt.getTime() <= DONE_VISIBLE_WINDOW_MS;

export const getBoard = async (): Promise<BoardData> => {
  const rows = await db.select().from(tickets).orderBy(asc(tickets.position));

  const board: BoardData = { backlog: [], todo: [], inProgress: [], done: [] };

  for (const row of rows) {
    const status = row.status as TicketStatus;
    const ticket: Ticket = {
      id: row.id,
      title: row.title,
      description: row.description,
      status,
      priority: row.priority as TicketPriority,
      position: row.position,
      plannedStartDate: row.plannedStartDate,
      dueDate: row.dueDate,
      startedAt: row.startedAt ? row.startedAt.toISOString() : null,
      completedAt: row.completedAt ? row.completedAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      isOverdue: isOverdue(row.dueDate, status),
    };

    switch (status) {
      case TICKET_STATUS.BACKLOG:
        board.backlog.push(ticket);
        break;
      case TICKET_STATUS.TODO:
        board.todo.push(ticket);
        break;
      case TICKET_STATUS.IN_PROGRESS:
        board.inProgress.push(ticket);
        break;
      case TICKET_STATUS.DONE:
        if (isDoneVisible(row.completedAt)) {
          board.done.push(ticket);
        }
        break;
    }
  }

  return board;
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
