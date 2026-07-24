import { and, asc, eq, min, ne } from 'drizzle-orm';
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
import type {
  CreateTicketInput,
  ReorderTicketInput,
  UpdateTicketInput,
} from '@/shared/validations/ticket';

const DONE_VISIBLE_WINDOW_MS = 24 * 60 * 60 * 1000;
const POSITION_GAP = 1024;

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

export const complete = async (id: number): Promise<Ticket | null> => {
  const [existing] = await db.select().from(tickets).where(eq(tickets.id, id));
  if (!existing) return null;

  const values =
    existing.status === TICKET_STATUS.DONE
      ? { status: TICKET_STATUS.IN_PROGRESS, completedAt: null }
      : { status: TICKET_STATUS.DONE, completedAt: new Date() };

  const [row] = await db.update(tickets).set(values).where(eq(tickets.id, id)).returning();

  return toTicket(row);
};

// position(=클라이언트가 계산한 대상 칼럼 내 0-based 삽입 인덱스, docs/TRD.md 드래그앤드롭 흐름
// 참고)에 해당하는 이웃 카드들 사이의 실제 저장 position 값을 계산한다. 간격이 1 미만이면
// 칼럼 전체 재정렬이 필요함을 함께 알린다 (docs/DATA_MODEL.md position 계산 규칙).
const computeInsertPosition = (
  neighbors: { position: number }[],
  index: number,
): { position: number; needsRenumber: boolean } => {
  const clampedIndex = Math.max(0, Math.min(index, neighbors.length));
  const prev = clampedIndex > 0 ? neighbors[clampedIndex - 1] : null;
  const next = clampedIndex < neighbors.length ? neighbors[clampedIndex] : null;

  if (!prev && !next) return { position: 0, needsRenumber: false };
  if (!prev) return { position: next!.position - POSITION_GAP, needsRenumber: false };
  if (!next) return { position: prev.position + POSITION_GAP, needsRenumber: false };

  const gap = next.position - prev.position;
  if (gap < 1) return { position: 0, needsRenumber: true };

  return { position: Math.round((prev.position + next.position) / 2), needsRenumber: false };
};

export const reorder = async (input: ReorderTicketInput): Promise<Ticket | null> => {
  const { ticketId, status: targetStatus, position: targetIndex } = input;

  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(tickets).where(eq(tickets.id, ticketId));
    if (!existing) return null;

    const previousStatus = existing.status as TicketStatus;

    const neighbors = await tx
      .select({ id: tickets.id, position: tickets.position })
      .from(tickets)
      .where(and(eq(tickets.status, targetStatus), ne(tickets.id, ticketId)))
      .orderBy(asc(tickets.position));

    const { position: candidatePosition, needsRenumber } = computeInsertPosition(
      neighbors,
      targetIndex,
    );

    let finalPosition = candidatePosition;

    if (needsRenumber) {
      const clampedIndex = Math.max(0, Math.min(targetIndex, neighbors.length));
      const finalOrderIds = [
        ...neighbors.slice(0, clampedIndex).map((neighbor) => neighbor.id),
        ticketId,
        ...neighbors.slice(clampedIndex).map((neighbor) => neighbor.id),
      ];

      for (const [index, id] of finalOrderIds.entries()) {
        if (id === ticketId) {
          finalPosition = index * POSITION_GAP;
          continue;
        }
        await tx
          .update(tickets)
          .set({ position: index * POSITION_GAP })
          .where(eq(tickets.id, id));
      }
    }

    let startedAt: Date | null | undefined;
    if (targetStatus === TICKET_STATUS.TODO) {
      startedAt = new Date();
    } else if (previousStatus === TICKET_STATUS.TODO && targetStatus === TICKET_STATUS.BACKLOG) {
      startedAt = null;
    }

    const [row] = await tx
      .update(tickets)
      .set({
        status: targetStatus,
        position: finalPosition,
        ...(startedAt !== undefined ? { startedAt } : {}),
      })
      .where(eq(tickets.id, ticketId))
      .returning();

    return toTicket(row);
  });
};
