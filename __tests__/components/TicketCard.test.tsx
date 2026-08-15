// TicketCard — Phase 1 (docs/COMPONENT_SPEC.md §2.6 TicketCard, TC-COMP-001)
// docs/FRONTEND_TASKS.md 지침에 따라 @dnd-kit은 mock 처리한다 (JSDOM에서 실제 포인터 드래그
// 시뮬레이션이 어려움). 드래그앤드롭 통합 흐름은 TC-INT-001/002에서 별도 검증한다.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketCard } from "@/client/components/TicketCard";
import type { TicketWithMeta } from "@/shared/types";

jest.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: () => undefined,
    },
  },
}));

const baseTicket: TicketWithMeta = {
  id: 1,
  title: "로그인 페이지 리팩토링",
  description: null,
  status: "TODO",
  priority: "HIGH",
  position: 0,
  plannedStartDate: null,
  dueDate: "2026-08-20",
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

describe("TicketCard", () => {
  it("TC-COMP-001-1: title, priority=HIGH, dueDate가 있으면 제목·우선순위 뱃지·날짜가 표시된다", () => {
    const ticket = createTicket({ title: "로그인 페이지 리팩토링", priority: "HIGH", dueDate: "2026-08-20" });

    render(<TicketCard ticket={ticket} onClick={jest.fn()} />);

    expect(screen.getByText("로그인 페이지 리팩토링")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
    expect(screen.getByText("2026-08-20")).toBeInTheDocument();
  });

  it("TC-COMP-001-2: isOverdue=true이면 오버듀 경고가 렌더링된다", () => {
    const ticket = createTicket({ isOverdue: true });

    render(<TicketCard ticket={ticket} onClick={jest.fn()} />);

    expect(screen.getByTestId("overdue-warning")).toBeInTheDocument();
  });

  it("TC-COMP-001-3: isOverdue=false이면 오버듀 경고가 렌더링되지 않는다", () => {
    const ticket = createTicket({ isOverdue: false });

    render(<TicketCard ticket={ticket} onClick={jest.fn()} />);

    expect(screen.queryByTestId("overdue-warning")).not.toBeInTheDocument();
  });

  it("TC-COMP-001-4: dueDate가 null이면 날짜 영역이 렌더링되지 않는다", () => {
    const ticket = createTicket({ dueDate: null });

    render(<TicketCard ticket={ticket} onClick={jest.fn()} />);

    expect(screen.queryByText(/\d{4}-\d{2}-\d{2}/)).not.toBeInTheDocument();
  });

  it("TC-COMP-001-5: 카드를 클릭하면 onClick이 1회 호출된다", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const ticket = createTicket();

    render(<TicketCard ticket={ticket} onClick={handleClick} />);

    await user.click(screen.getByRole("button", { name: `티켓: ${ticket.title}` }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("TC-COMP-001-6: title이 200글자여도 말줄임(ellipsis) 클래스가 적용된 요소 안에 전체 텍스트가 렌더링된다", () => {
    const longTitle = "가".repeat(200);
    const ticket = createTicket({ title: longTitle });

    render(<TicketCard ticket={ticket} onClick={jest.fn()} />);

    const titleElement = screen.getByText(longTitle);
    expect(titleElement).toHaveClass("truncate");
  });

  it.each([
    ["LOW", ["bg-priority-low/10", "text-priority-low"]],
    ["MEDIUM", ["bg-priority-medium/10", "text-priority-medium"]],
    ["HIGH", ["bg-priority-high/10", "text-priority-high"]],
  ] as const)("TC-COMP-001-7: priority=%s이면 해당 색상 뱃지 클래스가 적용된다", (priority, classes) => {
    const ticket = createTicket({ priority });

    render(<TicketCard ticket={ticket} onClick={jest.fn()} />);

    expect(screen.getByText(priority)).toHaveClass(...classes);
  });
});
