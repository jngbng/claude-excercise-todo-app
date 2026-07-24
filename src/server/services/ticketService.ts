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
import type { CreateTicketInput, UpdateTicketInput } from '@/shared/validations/ticket';

const DONE_VISIBLE_WINDOW_MS = 24 * 60 * 60 * 1000;

const isOverdue = (dueDate: string | null, status: TicketStatus): boolean => {
  if (!dueDate || status === TICKET_STATUS.DONE) return false;
  return new Date(dueDate) < today();
};

const toTicket = (row: typeof tickets.$inferSelect): Ticket => {
  const status = row.status as TicketStatus;

  return {
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
};

const isDoneVisible = (completedAt: Date | null): boolean =>
  completedAt != null && Date.now() - completedAt.getTime() <= DONE_VISIBLE_WINDOW_MS;

export const getBoard = async (): Promise<BoardData> => {
  const rows = await db.select().from(tickets).orderBy(asc(tickets.position));

  const board: BoardData = { backlog: [], todo: [], inProgress: [], done: [] };

  for (const row of rows) {
    switch (row.status as TicketStatus) {
      case TICKET_STATUS.BACKLOG:
        board.backlog.push(toTicket(row));
        break;
      case TICKET_STATUS.TODO:
        board.todo.push(toTicket(row));
        break;
      case TICKET_STATUS.IN_PROGRESS:
        board.inProgress.push(toTicket(row));
        break;
      case TICKET_STATUS.DONE:
        if (isDoneVisible(row.completedAt)) {
          board.done.push(toTicket(row));
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

  return toTicket(ticket);
};

export const getById = async (id: number): Promise<Ticket | null> => {
  const [row] = await db.select().from(tickets).where(eq(tickets.id, id));

  return row ? toTicket(row) : null;
};

export const update = async (id: number, input: UpdateTicketInput): Promise<Ticket | null> => {
  const values: Partial<typeof tickets.$inferInsert> = {};

  if ('title' in input) values.title = input.title;
  if ('description' in input) values.description = input.description ?? null;
  if ('priority' in input) values.priority = input.priority;
  if ('plannedStartDate' in input) values.plannedStartDate = input.plannedStartDate ?? null;
  if ('dueDate' in input) values.dueDate = input.dueDate ?? null;

  const [row] = await db.update(tickets).set(values).where(eq(tickets.id, id)).returning();

  return row ? toTicket(row) : null;
};

export const remove = async (id: number): Promise<boolean> => {
  const [row] = await db.delete(tickets).where(eq(tickets.id, id)).returning({ id: tickets.id });

  return row !== undefined;
};
