'use client';

import { useCallback, useRef, useState } from 'react';
import * as ticketApi from '@/client/api/ticketApi';
import { TICKET_STATUS } from '@/shared/types';
import type { BoardData, TicketStatus, TicketWithMeta } from '@/shared/types';
import type { CreateTicketInput, UpdateTicketInput } from '@/shared/validations/ticket';

type ReorderableStatus = Exclude<TicketStatus, 'DONE'>;

type ColumnKey = keyof BoardData;

interface UseTicketsReturn {
  board: BoardData;
  isLoading: boolean;
  error: string | null;
  create: (data: CreateTicketInput) => Promise<void>;
  update: (id: number, data: UpdateTicketInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
  reorder: (ticketId: number, status: ReorderableStatus, position: number) => Promise<void>;
  complete: (id: number) => Promise<void>;
}

const COLUMN_KEYS: ColumnKey[] = ['backlog', 'todo', 'inProgress', 'done'];

const STATUS_TO_COLUMN: Record<TicketStatus, ColumnKey> = {
  [TICKET_STATUS.BACKLOG]: 'backlog',
  [TICKET_STATUS.TODO]: 'todo',
  [TICKET_STATUS.IN_PROGRESS]: 'inProgress',
  [TICKET_STATUS.DONE]: 'done',
};

const findTicketInBoard = (board: BoardData, id: number): TicketWithMeta | undefined => {
  for (const key of COLUMN_KEYS) {
    const found = board[key].find((ticket) => ticket.id === id);
    if (found) return found;
  }
  return undefined;
};

const removeTicketFromBoard = (board: BoardData, id: number): BoardData => {
  const next = { ...board };
  for (const key of COLUMN_KEYS) {
    next[key] = next[key].filter((ticket) => ticket.id !== id);
  }
  return next;
};

const moveTicketIntoBoard = (board: BoardData, ticket: TicketWithMeta): BoardData => {
  const withoutTicket = removeTicketFromBoard(board, ticket.id);
  const column = STATUS_TO_COLUMN[ticket.status];
  const sorted = [...withoutTicket[column], ticket].sort((a, b) => a.position - b.position);
  return { ...withoutTicket, [column]: sorted };
};

const mapTicketInBoard = (
  board: BoardData,
  id: number,
  transform: (ticket: TicketWithMeta) => TicketWithMeta,
): BoardData => {
  const next = { ...board };
  for (const key of COLUMN_KEYS) {
    next[key] = next[key].map((ticket) => (ticket.id === id ? transform(ticket) : ticket));
  }
  return next;
};

export const useTickets = (initialData: BoardData): UseTicketsReturn => {
  const [board, setBoard] = useState<BoardData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boardRef = useRef(board);
  boardRef.current = board;

  const runAction = useCallback(
    async <R>(
      optimisticBoard: BoardData,
      apiCall: () => Promise<R>,
      applyResult: (board: BoardData, result: R) => BoardData,
    ): Promise<void> => {
      const backup = boardRef.current;
      setError(null);
      setIsLoading(true);
      setBoard(optimisticBoard);
      try {
        const result = await apiCall();
        setBoard((current) => applyResult(current, result));
      } catch (err) {
        setBoard(backup);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const create = useCallback(
    async (data: CreateTicketInput) => {
      const backlog = boardRef.current.backlog;
      const minPosition = backlog.reduce((min, ticket) => Math.min(min, ticket.position), 0);
      const tempId = -Date.now();
      const now = new Date().toISOString();
      const optimisticTicket: TicketWithMeta = {
        id: tempId,
        title: data.title,
        description: data.description ?? null,
        status: TICKET_STATUS.BACKLOG,
        priority: data.priority,
        position: backlog.length > 0 ? minPosition - 1 : 0,
        plannedStartDate: data.plannedStartDate ?? null,
        dueDate: data.dueDate ?? null,
        startedAt: null,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
        isOverdue: false,
      };

      await runAction(
        moveTicketIntoBoard(boardRef.current, optimisticTicket),
        () => ticketApi.createTicket(data),
        (current, result) => moveTicketIntoBoard(removeTicketFromBoard(current, tempId), result),
      );
    },
    [runAction],
  );

  const update = useCallback(
    async (id: number, data: UpdateTicketInput) => {
      await runAction(
        mapTicketInBoard(boardRef.current, id, (ticket) => ({ ...ticket, ...data })),
        () => ticketApi.updateTicket(id, data),
        (current, result) => mapTicketInBoard(current, id, () => result),
      );
    },
    [runAction],
  );

  const remove = useCallback(
    async (id: number) => {
      await runAction(
        removeTicketFromBoard(boardRef.current, id),
        () => ticketApi.removeTicket(id),
        (current) => current,
      );
    },
    [runAction],
  );

  const reorder = useCallback(
    async (ticketId: number, status: ReorderableStatus, position: number) => {
      const current = findTicketInBoard(boardRef.current, ticketId);
      if (!current) return;

      const optimisticTicket: TicketWithMeta = { ...current, status, position };

      await runAction(
        moveTicketIntoBoard(removeTicketFromBoard(boardRef.current, ticketId), optimisticTicket),
        () => ticketApi.reorderTicket(ticketId, status, position),
        (board, result) => moveTicketIntoBoard(removeTicketFromBoard(board, ticketId), result),
      );
    },
    [runAction],
  );

  const complete = useCallback(
    async (id: number) => {
      const current = findTicketInBoard(boardRef.current, id);
      if (!current) return;

      const optimisticTicket: TicketWithMeta = {
        ...current,
        status: TICKET_STATUS.DONE,
        completedAt: new Date().toISOString(),
      };

      await runAction(
        moveTicketIntoBoard(removeTicketFromBoard(boardRef.current, id), optimisticTicket),
        () => ticketApi.completeTicket(id),
        (board, result) => moveTicketIntoBoard(removeTicketFromBoard(board, id), result),
      );
    },
    [runAction],
  );

  return { board, isLoading, error, create, update, remove, reorder, complete };
};
