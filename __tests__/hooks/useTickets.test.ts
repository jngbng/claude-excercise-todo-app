// useTickets 훅 테스트 (docs/FRONTEND_TASKS.md Phase 3, docs/COMPONENT_SPEC.md §4 참조)
// TEST_CASES.md에 별도 TC 없음 — 낙관적 업데이트 패턴(백업 → 낙관적 반영 → API 호출 → 확정/롤백)을
// 훅 레벨에서 검증한다. ticketApi는 jest.mock으로 모킹한다.
import { act, renderHook } from '@testing-library/react';
import * as ticketApi from '@/client/api/ticketApi';
import { useTickets } from '@/client/hooks/useTickets';
import type { BoardData, TicketWithMeta } from '@/shared/types';

jest.mock('@/client/api/ticketApi');

const mockedApi = ticketApi as jest.Mocked<typeof ticketApi>;

const makeTicket = (overrides: Partial<TicketWithMeta> = {}): TicketWithMeta => ({
  id: 1,
  title: '티켓',
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
  ...overrides,
});

const emptyBoard = (): BoardData => ({ backlog: [], todo: [], inProgress: [], done: [] });

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const createDeferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('create', () => {
  it('성공 시 backlog 맨 앞에 낙관적으로 추가되고 성공 응답으로 확정된다', async () => {
    const deferred = createDeferred<TicketWithMeta>();
    mockedApi.createTicket.mockReturnValue(deferred.promise);

    const { result } = renderHook(() => useTickets(emptyBoard()));

    act(() => {
      void result.current.create({ title: '새 티켓', priority: 'MEDIUM' });
    });

    expect(result.current.board.backlog).toHaveLength(1);
    expect(result.current.board.backlog[0].title).toBe('새 티켓');

    const created = makeTicket({ id: 99, title: '새 티켓' });
    await act(async () => {
      deferred.resolve(created);
      await deferred.promise;
    });

    expect(result.current.board.backlog).toEqual([created]);
    expect(mockedApi.createTicket).toHaveBeenCalledWith({ title: '새 티켓', priority: 'MEDIUM' });
  });
});

describe('update', () => {
  it('성공 시 해당 티켓 필드만 갱신된다', async () => {
    const original = makeTicket({ id: 1, title: '원래 제목', priority: 'LOW' });
    const updated = { ...original, title: '수정된 제목' };
    mockedApi.updateTicket.mockResolvedValue(updated);

    const { result } = renderHook(() => useTickets({ ...emptyBoard(), backlog: [original] }));

    await act(async () => {
      await result.current.update(1, { title: '수정된 제목' });
    });

    expect(result.current.board.backlog).toEqual([updated]);
    expect(mockedApi.updateTicket).toHaveBeenCalledWith(1, { title: '수정된 제목' });
  });
});

describe('remove', () => {
  it('성공 시 board에서 제거된다', async () => {
    const ticket = makeTicket({ id: 1 });
    mockedApi.removeTicket.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTickets({ ...emptyBoard(), backlog: [ticket] }));

    await act(async () => {
      await result.current.remove(1);
    });

    expect(result.current.board.backlog).toEqual([]);
    expect(mockedApi.removeTicket).toHaveBeenCalledWith(1);
  });
});

describe('reorder', () => {
  it('성공 시 대상 칼럼/포지션이 반영된다', async () => {
    const ticket = makeTicket({ id: 1, status: 'BACKLOG', position: 0 });
    const moved: TicketWithMeta = {
      ...ticket,
      status: 'TODO',
      position: 512,
      startedAt: '2026-06-28T10:00:00.000Z',
    };
    mockedApi.reorderTicket.mockResolvedValue(moved);

    const { result } = renderHook(() => useTickets({ ...emptyBoard(), backlog: [ticket] }));

    await act(async () => {
      await result.current.reorder(1, 'TODO', 512);
    });

    expect(result.current.board.backlog).toEqual([]);
    expect(result.current.board.todo).toEqual([moved]);
    expect(mockedApi.reorderTicket).toHaveBeenCalledWith(1, 'TODO', 512);
  });

  it('API가 500을 반환하면 이동 이전 상태로 롤백되고 error가 설정된다 (TC-INT-001-4)', async () => {
    const ticket = makeTicket({ id: 1, status: 'BACKLOG', position: 0 });
    mockedApi.reorderTicket.mockRejectedValue(new Error('서버 오류가 발생했습니다'));

    const initialBoard: BoardData = { ...emptyBoard(), backlog: [ticket] };
    const { result } = renderHook(() => useTickets(initialBoard));

    await act(async () => {
      await result.current.reorder(1, 'TODO', 512);
    });

    expect(result.current.board).toEqual(initialBoard);
    expect(result.current.error).toBe('서버 오류가 발생했습니다');
  });
});

describe('complete', () => {
  it('성공 시 done 칼럼으로 이동하고 completedAt이 반영된다', async () => {
    const ticket = makeTicket({ id: 1, status: 'IN_PROGRESS', position: 0 });
    const completed: TicketWithMeta = {
      ...ticket,
      status: 'DONE',
      completedAt: '2026-06-28T11:30:00.000Z',
    };
    mockedApi.completeTicket.mockResolvedValue(completed);

    const { result } = renderHook(() => useTickets({ ...emptyBoard(), inProgress: [ticket] }));

    await act(async () => {
      await result.current.complete(1);
    });

    expect(result.current.board.inProgress).toEqual([]);
    expect(result.current.board.done).toEqual([completed]);
    expect(mockedApi.completeTicket).toHaveBeenCalledWith(1);
  });

  it('API가 500을 반환하면 완료 이전 상태로 롤백되고 error가 설정된다 (TC-INT-002)', async () => {
    const ticket = makeTicket({ id: 1, status: 'IN_PROGRESS', position: 0 });
    mockedApi.completeTicket.mockRejectedValue(new Error('서버 오류가 발생했습니다'));

    const initialBoard: BoardData = { ...emptyBoard(), inProgress: [ticket] };
    const { result } = renderHook(() => useTickets(initialBoard));

    await act(async () => {
      await result.current.complete(1);
    });

    expect(result.current.board).toEqual(initialBoard);
    expect(result.current.error).toBe('서버 오류가 발생했습니다');
  });

  it('이미 done인 티켓에 다시 호출해도 낙관적 업데이트가 done 칼럼을 유지한다', async () => {
    const deferred = createDeferred<TicketWithMeta>();
    mockedApi.completeTicket.mockReturnValue(deferred.promise);
    const ticket = makeTicket({ id: 1, status: 'DONE', completedAt: '2026-06-28T11:30:00.000Z' });

    const { result } = renderHook(() => useTickets({ ...emptyBoard(), done: [ticket] }));

    act(() => {
      void result.current.complete(1);
    });

    expect(result.current.board.done).toHaveLength(1);

    const recompleted: TicketWithMeta = { ...ticket, completedAt: '2026-06-28T12:00:00.000Z' };
    await act(async () => {
      deferred.resolve(recompleted);
      await deferred.promise;
    });

    expect(result.current.board.done).toEqual([recompleted]);
    expect(mockedApi.completeTicket).toHaveBeenCalledWith(1);
  });
});
