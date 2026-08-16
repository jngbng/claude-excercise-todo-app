// Board — Phase 4 (docs/COMPONENT_SPEC.md §2.4 Board, docs/FRONTEND_TASKS.md Phase 4)
// jsdom은 네이티브 PointerEvent를 지원하지 않아 실제 포인터 드래그 물리(distance 판정 등)를
// fireEvent로 재현할 수 없다(docs/FRONTEND_TASKS.md의 DnD 컴포넌트 테스트 지침 참고). 대신
// DndContext에 전달되는 onDragStart/onDragEnd 콜백을 캡처해 직접 호출하는 방식으로,
// Board가 dnd-kit 이벤트를 받아 activeTicket(DragOverlay) 상태와 onDragEnd 위임을 올바르게
// 처리하는지만 검증한다. onDragEnd의 대상 칼럼 판별/API 분기는 Board가 아니라 BoardContainer의
// 책임이므로, 여기서는 onDragEnd 콜백이 그대로 위임 호출되는지만 확인한다.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { Board } from "@/client/components/Board";
import type { BoardData, TicketWithMeta } from "@/shared/types";

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
    // 실제 DragOverlay는 dnd-kit 내부 active 상태(진짜 포인터 드래그로만 설정됨)가 있어야
    // children을 렌더링한다. DndContext를 모킹한 이상 그 내부 상태는 항상 비어 있으므로,
    // Board 자체의 activeTicket 조건부 렌더링만 검증할 수 있게 children을 그대로 통과시킨다.
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
  backlog: [createTicket({ id: 1, title: "백로그 티켓", status: "BACKLOG" })],
  todo: [createTicket({ id: 2, title: "투두 티켓", status: "TODO" })],
  inProgress: [createTicket({ id: 3, title: "진행중 티켓", status: "IN_PROGRESS" })],
  done: [createTicket({ id: 4, title: "완료 티켓", status: "DONE" })],
  ...overrides,
});

const renderBoard = (props: Partial<React.ComponentProps<typeof Board>> = {}) =>
  render(<Board board={createBoard()} onTicketClick={jest.fn()} onDragEnd={jest.fn()} {...props} />);

describe("Board", () => {
  beforeEach(() => {
    mockDndHandlers = {};
  });

  it("board prop의 4개 칼럼(backlog/todo/inProgress/done)이 각각 Column으로 렌더링된다", () => {
    renderBoard();

    expect(screen.getByText("BACKLOG")).toBeInTheDocument();
    expect(screen.getByText("TODO")).toBeInTheDocument();
    expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
    expect(screen.getByText("DONE")).toBeInTheDocument();

    expect(screen.getByText("백로그 티켓")).toBeInTheDocument();
    expect(screen.getByText("투두 티켓")).toBeInTheDocument();
    expect(screen.getByText("진행중 티켓")).toBeInTheDocument();
    expect(screen.getByText("완료 티켓")).toBeInTheDocument();
  });

  it("카드 클릭 시 onTicketClick이 위임 호출된다", async () => {
    const user = userEvent.setup();
    const handleTicketClick = jest.fn();
    const board = createBoard();

    renderBoard({ onTicketClick: handleTicketClick });

    await user.click(screen.getByRole("button", { name: `티켓: ${board.todo[0].title}` }));

    expect(handleTicketClick).toHaveBeenCalledTimes(1);
    expect(handleTicketClick).toHaveBeenCalledWith(board.todo[0]);
  });

  it("드래그 시작 시 DragOverlay에 활성 카드가 표시된다", () => {
    const board = createBoard();
    renderBoard({ board });

    expect(screen.queryByTestId("drag-overlay-card")).not.toBeInTheDocument();

    act(() => {
      mockDndHandlers.onDragStart?.({ active: { id: board.todo[0].id } } as unknown as DragStartEvent);
    });

    expect(screen.getByTestId("drag-overlay-card")).toHaveTextContent(board.todo[0].title);
  });

  it("드래그 종료 시 onDragEnd가 위임 호출되고 DragOverlay가 사라진다", () => {
    const handleDragEnd = jest.fn();
    const board = createBoard();
    renderBoard({ board, onDragEnd: handleDragEnd });

    act(() => {
      mockDndHandlers.onDragStart?.({ active: { id: board.todo[0].id } } as unknown as DragStartEvent);
    });
    expect(screen.getByTestId("drag-overlay-card")).toBeInTheDocument();

    const dragEndEvent = { active: { id: board.todo[0].id }, over: null } as unknown as DragEndEvent;
    act(() => {
      mockDndHandlers.onDragEnd?.(dragEndEvent);
    });

    expect(handleDragEnd).toHaveBeenCalledTimes(1);
    expect(handleDragEnd).toHaveBeenCalledWith(dragEndEvent);
    expect(screen.queryByTestId("drag-overlay-card")).not.toBeInTheDocument();
  });
});
