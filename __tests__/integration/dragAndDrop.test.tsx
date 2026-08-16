// TC-INT-001: 드래그앤드롭 — 이동 및 롤백 (docs/TEST_CASES.md, docs/FRONTEND_TASKS.md Phase 4)
// jsdom은 네이티브 PointerEvent를 지원하지 않아 실제 포인터 드래그 물리를 fireEvent로 재현할 수
// 없다. Board.test.tsx와 동일하게 @dnd-kit/core의 DndContext/DragOverlay만 부분 모킹해
// onDragStart/onDragEnd 콜백을 직접 호출하는 방식으로, BoardContainer → Board → useTickets →
// ticketApi로 이어지는 실제 배선을 검증한다. TC-INT-001-3(드래그 중 반투명 placeholder +
// DragOverlay 렌더링)은 실제 포인터 물리가 필요해 이 방식으로 재현할 수 없으므로
// __tests__/components/Board.test.tsx의 컴포넌트 단위 테스트로 이미 검증했다.
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
  status: "BACKLOG",
  priority: "MEDIUM",
  position: 0,
  plannedStartDate: null,
  dueDate: null,
  startedAt: null,
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

// onDragEnd는 내부에서 useTickets 액션을 fire-and-forget으로 호출하므로, 모킹된 API가 반환한
// 프로미스를 act 스코프 안에서 직접 기다려야 그 이후의 setState가 act 경고 없이 반영된다.
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

describe("TC-INT-001: 드래그앤드롭 — 이동 및 롤백", () => {
  it("TC-INT-001-1: BACKLOG 카드를 TODO로 드래그하면 TODO에 표시되고 reorder API가 호출된다", async () => {
    const ticket = createTicket({ id: 1, title: "백로그 티켓", status: "BACKLOG" });
    mockedApi.reorderTicket.mockResolvedValue({ ...ticket, status: "TODO", position: 0 });

    render(<BoardContainer initialData={createBoard({ backlog: [ticket] })} />);

    await triggerDragEnd(ticket.id, "TODO", mockedApi.reorderTicket);

    expect(mockedApi.reorderTicket).toHaveBeenCalledWith(ticket.id, "TODO", 0);
    expect(screen.getByText("백로그 티켓")).toBeInTheDocument();
  });

  it("TC-INT-001-2: 같은 칼럼 내 카드 위로 드롭하면 그 카드의 인덱스로 reorder API가 호출된다", async () => {
    const ticketA = createTicket({ id: 1, title: "티켓A", status: "TODO", position: 0 });
    const ticketB = createTicket({ id: 2, title: "티켓B", status: "TODO", position: 1 });
    mockedApi.reorderTicket.mockResolvedValue({ ...ticketB, position: -1024 });

    render(<BoardContainer initialData={createBoard({ todo: [ticketA, ticketB] })} />);

    await triggerDragEnd(ticketB.id, ticketA.id, mockedApi.reorderTicket);

    expect(mockedApi.reorderTicket).toHaveBeenCalledWith(ticketB.id, "TODO", 0);
  });

  it("카드를 제자리(자기 자신 위)에 드롭하면 원래 인덱스로 reorder API가 호출된다", async () => {
    const ticketA = createTicket({ id: 1, title: "티켓A", status: "TODO", position: 0 });
    const ticketB = createTicket({ id: 2, title: "티켓B", status: "TODO", position: 1024 });
    const ticketC = createTicket({ id: 3, title: "티켓C", status: "TODO", position: 2048 });
    mockedApi.reorderTicket.mockResolvedValue(ticketB);

    render(
      <BoardContainer initialData={createBoard({ todo: [ticketA, ticketB, ticketC] })} />,
    );

    await triggerDragEnd(ticketB.id, ticketB.id, mockedApi.reorderTicket);

    expect(mockedApi.reorderTicket).toHaveBeenCalledWith(ticketB.id, "TODO", 1);
  });

  it("카드를 자신보다 뒤에 있는 카드 위로 드롭하면(아래로 이동) 그 카드 다음 자리로 reorder API가 호출된다", async () => {
    const ticketA = createTicket({ id: 1, title: "티켓A", status: "TODO", position: 0 });
    const ticketB = createTicket({ id: 2, title: "티켓B", status: "TODO", position: 1024 });
    const ticketC = createTicket({ id: 3, title: "티켓C", status: "TODO", position: 2048 });
    mockedApi.reorderTicket.mockResolvedValue(ticketB);

    render(
      <BoardContainer initialData={createBoard({ todo: [ticketA, ticketB, ticketC] })} />,
    );

    await triggerDragEnd(ticketB.id, ticketC.id, mockedApi.reorderTicket);

    expect(mockedApi.reorderTicket).toHaveBeenCalledWith(ticketB.id, "TODO", 2);
  });

  it("TC-INT-001-4: API가 실패하면 카드가 원래 칼럼으로 복귀하고 에러 메시지가 표시된다", async () => {
    const ticket = createTicket({ id: 1, title: "백로그 티켓", status: "BACKLOG" });
    mockedApi.reorderTicket.mockRejectedValue(new Error("서버 오류가 발생했습니다"));

    render(<BoardContainer initialData={createBoard({ backlog: [ticket] })} />);

    await triggerDragEnd(ticket.id, "TODO", mockedApi.reorderTicket);

    expect(screen.getByTestId("board-error")).toHaveTextContent("서버 오류가 발생했습니다");
    expect(screen.getByText("백로그 티켓")).toBeInTheDocument();
  });
});
