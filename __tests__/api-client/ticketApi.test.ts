// ticketApi 클라이언트 함수 테스트 (docs/FRONTEND_TASKS.md Phase 3, docs/API_SPECS.md 참조)
// TEST_CASES.md에 별도 TC 없음 — TC-API-*를 클라이언트 관점(요청 URL/메서드/바디, 응답 파싱)에서
// 재사용한다. 전역 fetch는 각 테스트에서 jest.fn()으로 모킹한다.
import {
  ApiError,
  completeTicket,
  createTicket,
  getBoard,
  removeTicket,
  reorderTicket,
  updateTicket,
} from '@/client/api/ticketApi';
import type { BoardData, TicketWithMeta } from '@/shared/types';

const mockFetch = (status: number, body: unknown): jest.Mock =>
  jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });

const sampleTicket: TicketWithMeta = {
  id: 1,
  title: '샘플 티켓',
  description: null,
  status: 'BACKLOG',
  priority: 'MEDIUM',
  position: 0,
  plannedStartDate: null,
  dueDate: null,
  startedAt: null,
  completedAt: null,
  createdAt: '2026-06-28T09:00:00.000Z',
  updatedAt: '2026-06-28T09:00:00.000Z',
  isOverdue: false,
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('createTicket', () => {
  it('POST /api/tickets 요청을 보내고 201 응답을 TicketWithMeta로 파싱한다', async () => {
    global.fetch = mockFetch(201, sampleTicket);

    const result = await createTicket({ title: '샘플 티켓', priority: 'MEDIUM' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tickets',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title: '샘플 티켓', priority: 'MEDIUM' }),
      }),
    );
    expect(result).toEqual(sampleTicket);
  });
});

describe('getBoard', () => {
  it('GET /api/tickets 요청을 보내고 BoardData로 파싱한다', async () => {
    const board: BoardData = { backlog: [sampleTicket], todo: [], inProgress: [], done: [] };
    global.fetch = mockFetch(200, board);

    const result = await getBoard();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tickets',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toEqual(board);
  });
});

describe('updateTicket', () => {
  it('PATCH /api/tickets/:id 요청을 보내고 응답을 파싱한다', async () => {
    const updated = { ...sampleTicket, title: '수정된 제목' };
    global.fetch = mockFetch(200, updated);

    const result = await updateTicket(1, { title: '수정된 제목' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tickets/1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ title: '수정된 제목' }),
      }),
    );
    expect(result).toEqual(updated);
  });
});

describe('removeTicket', () => {
  it('DELETE /api/tickets/:id 요청을 보내고 204 응답을 undefined로 처리한다', async () => {
    global.fetch = mockFetch(204, undefined);

    const result = await removeTicket(1);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tickets/1',
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toBeUndefined();
  });
});

describe('reorderTicket', () => {
  it('PATCH /api/tickets/reorder 요청을 ticketId/status/position 바디로 보낸다', async () => {
    const moved: TicketWithMeta = { ...sampleTicket, status: 'TODO', position: 512 };
    global.fetch = mockFetch(200, moved);

    const result = await reorderTicket(1, 'TODO', 512);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tickets/reorder',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ ticketId: 1, status: 'TODO', position: 512 }),
      }),
    );
    expect(result).toEqual(moved);
  });
});

describe('completeTicket', () => {
  it('PATCH /api/tickets/:id/complete 요청을 보내고 응답을 파싱한다', async () => {
    const completed: TicketWithMeta = {
      ...sampleTicket,
      status: 'DONE',
      completedAt: '2026-06-28T11:30:00.000Z',
    };
    global.fetch = mockFetch(200, completed);

    const result = await completeTicket(1);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tickets/1/complete',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result).toEqual(completed);
  });
});

describe('에러 응답 처리', () => {
  it('400 VALIDATION_ERROR 응답을 받으면 ApiError를 throw한다', async () => {
    global.fetch = mockFetch(400, {
      error: { code: 'VALIDATION_ERROR', message: '제목을 입력해주세요' },
    });

    await expect(createTicket({ title: '', priority: 'MEDIUM' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'VALIDATION_ERROR',
      message: '제목을 입력해주세요',
    });
  });

  it('404 NOT_FOUND 응답을 받으면 ApiError를 throw한다', async () => {
    global.fetch = mockFetch(404, {
      error: { code: 'NOT_FOUND', message: '티켓을 찾을 수 없습니다' },
    });

    await expect(updateTicket(999, { title: '수정' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'NOT_FOUND',
      message: '티켓을 찾을 수 없습니다',
    });

    expect(() => {
      throw new ApiError(404, 'NOT_FOUND', '티켓을 찾을 수 없습니다');
    }).toThrow(ApiError);
  });
});
