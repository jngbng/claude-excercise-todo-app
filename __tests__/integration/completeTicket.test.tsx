// TC-INT-002: DONE 완료 처리 및 역이동 (docs/TEST_CASES.md, docs/FRONTEND_TASKS.md Phase 4)
// dragAndDrop.test.tsx와 동일하게 @dnd-kit/core의 DndContext/DragOverlay만 부분 모킹해
// onDragEnd 콜백을 직접 호출하는 방식으로 BoardContainer → Board → useTickets → ticketApi 배선을
// 검증한다.
import { act, render, screen } from "@testing-library/react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import * as ticketApi from "@/client/api/ticketApi";
import { BoardContainer } from "@/client/components/BoardContainer";
import type { BoardData, TicketWithMeta } from "@/shared/types";

jest.mock("@/client/api/ticketApi");

const mockedApi = ticketApi as jest.Mocked<typeof ticketApi>;

let mockDndHandlers: {
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
} = {};

jest.mock("@dnd-kit/core", () => {
  const actual = jest.requireActual("@dnd-kit/core");
  return {
    ...actual,
    DndContext: ({
      children,
      onDragStart,
      onDragEnd,
    }: {
      children: React.ReactNode;
      onDragStart?: (event: DragStartEvent) => void;
      onDragEnd?: (event: DragEndEvent) => void;
    }) => {
      mockDndHandlers = { onDragStart, onDragEnd };
      return children;
    },
    DragOverlay: ({ children }: { children: React.ReactNode }) => children,
  };
});

const baseTicket: TicketWithMeta = {
  id: 1,
  title: "티켓",
  description: null,
  status: "IN_PROGRESS",
  priority: "MEDIUM",
  position: 0,
  plannedStartDate: null,
  dueDate: null,
  startedAt: "2026-08-01T00:00:00.000Z",
  completedAt: null,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  isOverdue: false,
};

const createTicket = (overrides: Partial<TicketWithMeta> = {}): TicketWithMeta => ({
  ...baseTicket,
  ...overrides,
});

const createBoard = (overrides: Partial<BoardData> = {}): BoardData => ({
  backlog: [],
  todo: [],
  inProgress: [],
  done: [],
  ...overrides,
});

const dragEndEvent = (activeId: number, overId: string | number): DragEndEvent =>
  ({ active: { id: activeId }, over: { id: overId } }) as unknown as DragEndEvent;

const triggerDragEnd = async (
  activeId: number,
  overId: string | number,
  apiMock: { mock: { results: { value: unknown }[] } },
) => {
  await act(async () => {
    mockDndHandlers.onDragEnd?.(dragEndEvent(activeId, overId));
    await (apiMock.mock.results[0]?.value as Promise<unknown> | undefined)?.catch(() => {});
  });
};

afterEach(() => {
  jest.resetAllMocks();
  mockDndHandlers = {};
});

describe("TC-INT-002: DONE 완료 처리 및 역이동", () => {
  it("TC-INT-002-1: 카드를 DONE으로 드래그하면 /:id/complete가 호출되고 DONE 칼럼에 표시된다", async () => {
    const ticket = createTicket({ id: 1, title: "진행중 티켓", status: "IN_PROGRESS" });
    const completed = { ...ticket, status: "DONE" as const, completedAt: "2026-08-10T00:00:00.000Z" };
    mockedApi.completeTicket.mockResolvedValue(completed);

    render(<BoardContainer initialData={createBoard({ inProgress: [ticket] })} />);

    await triggerDragEnd(ticket.id, "DONE", mockedApi.completeTicket);

    expect(mockedApi.completeTicket).toHaveBeenCalledWith(ticket.id);
    expect(mockedApi.reorderTicket).not.toHaveBeenCalled();
    expect(screen.getByText("진행중 티켓")).toBeInTheDocument();
  });

  // 분기는 드롭 "대상(target)" 칼럼 기준이어야 한다 — 출발 칼럼(DONE)을 기준으로 삼으면
  // useTickets.complete()가 드롭 위치와 무관하게 항상 IN_PROGRESS로 토글해버려, DONE 카드를
  // BACKLOG/TODO로 드롭해도 IN_PROGRESS로 가버리는 버그가 있었다 (docs/COMPONENT_SPEC.md §5.1
  // 위반). target === DONE일 때만 complete()를 호출해야 한다.
  it("TC-INT-002-2: DONE 카드를 IN_PROGRESS로 드래그하면 reorder API가 호출되고 IN_PROGRESS로 이동한다", async () => {
    const ticket = createTicket({
      id: 2,
      title: "완료된 티켓",
      status: "DONE",
      completedAt: "2026-08-05T00:00:00.000Z",
    });
    const reopened = { ...ticket, status: "IN_PROGRESS" as const, completedAt: null };
    mockedApi.reorderTicket.mockResolvedValue(reopened);

    render(<BoardContainer initialData={createBoard({ done: [ticket] })} />);

    await triggerDragEnd(ticket.id, "IN_PROGRESS", mockedApi.reorderTicket);

    expect(mockedApi.reorderTicket).toHaveBeenCalledWith(ticket.id, "IN_PROGRESS", 0);
    expect(mockedApi.completeTicket).not.toHaveBeenCalled();
  });

  it("DONE 카드를 BACKLOG로 드래그하면 reorder API가 호출되고 BACKLOG로 이동한다 (회귀 테스트)", async () => {
    const ticket = createTicket({
      id: 4,
      title: "완료된 티켓",
      status: "DONE",
      completedAt: "2026-08-05T00:00:00.000Z",
    });
    const reopened = { ...ticket, status: "BACKLOG" as const, completedAt: null };
    mockedApi.reorderTicket.mockResolvedValue(reopened);

    render(<BoardContainer initialData={createBoard({ done: [ticket] })} />);

    await triggerDragEnd(ticket.id, "BACKLOG", mockedApi.reorderTicket);

    expect(mockedApi.reorderTicket).toHaveBeenCalledWith(ticket.id, "BACKLOG", 0);
    expect(mockedApi.completeTicket).not.toHaveBeenCalled();
  });

  it("TC-INT-002-3: DONE 칼럼으로 이동한 카드에 완료 표시(✓)가 렌더링된다", async () => {
    const ticket = createTicket({ id: 3, title: "완료할 티켓", status: "IN_PROGRESS" });
    const completed = { ...ticket, status: "DONE" as const, completedAt: "2026-08-10T00:00:00.000Z" };
    mockedApi.completeTicket.mockResolvedValue(completed);

    render(<BoardContainer initialData={createBoard({ inProgress: [ticket] })} />);

    await triggerDragEnd(ticket.id, "DONE", mockedApi.completeTicket);

    expect(screen.getByTestId("ticket-complete-mark")).toBeInTheDocument();
  });
});
