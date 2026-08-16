import type { BoardData, TicketStatus, TicketWithMeta } from '@/shared/types';
import type { CreateTicketInput, UpdateTicketInput } from '@/shared/validations/ticket';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const TICKETS_URL = '/api/tickets';

const request = async <T>(url: string, init: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, body.error.code, body.error.message);
  }

  return body as T;
};

export const getBoard = (): Promise<BoardData> => request<BoardData>(TICKETS_URL, { method: 'GET' });

export const createTicket = (data: CreateTicketInput): Promise<TicketWithMeta> =>
  request<TicketWithMeta>(TICKETS_URL, { method: 'POST', body: JSON.stringify(data) });

export const updateTicket = (id: number, data: UpdateTicketInput): Promise<TicketWithMeta> =>
  request<TicketWithMeta>(`${TICKETS_URL}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const removeTicket = (id: number): Promise<void> =>
  request<void>(`${TICKETS_URL}/${id}`, { method: 'DELETE' });

export const reorderTicket = (
  ticketId: number,
  status: Exclude<TicketStatus, 'DONE'>,
  position: number,
): Promise<TicketWithMeta> =>
  request<TicketWithMeta>(`${TICKETS_URL}/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ ticketId, status, position }),
  });

export const completeTicket = (id: number): Promise<TicketWithMeta> =>
  request<TicketWithMeta>(`${TICKETS_URL}/${id}/complete`, { method: 'PATCH' });
