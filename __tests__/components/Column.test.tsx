// Column — Phase 2 (docs/COMPONENT_SPEC.md §2.5 Column, TC-COMP-002)
// DndContext/SortableContext는 실제로 감싸서 렌더링한다(docs/FRONTEND_TASKS.md 지침) —
// 실제 드래그 시뮬레이션은 하지 않고, 렌더링/클릭 상호작용까지만 검증한다.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Column } from "@/client/components/Column";

// PointerSensor는 activationConstraint 없이는 pointerdown에서 바로 preventDefault를 호출해
// 뒤따르는 click 이벤트(Pointer Events 스펙상 호환 마우스 이벤트)를 막아버린다. 실제 Board에서도
// 클릭과 드래그를 구분하기 위해 distance 제약이 필요하므로 테스트에서도 동일하게 구성한다.
const TestDndProvider = ({ children }: { children: React.ReactNode }) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  return <DndContext sensors={sensors}>{children}</DndContext>;
};
import type { TicketWithMeta } from "@/shared/types";

const baseTicket: TicketWithMeta = {
  id: 1,
  title: "티켓",
  description: null,
  status: "TODO",
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

const renderColumn = (props: React.ComponentProps<typeof Column>) =>
  render(
    <TestDndProvider>
      <Column {...props} />
    </TestDndProvider>,
  );

describe("Column", () => {
  it("TC-COMP-002-1: 칼럼명과 카드 수가 표시된다", () => {
    const tickets = [createTicket({ id: 1 }), createTicket({ id: 2 }), createTicket({ id: 3 })];

    renderColumn({ status: "BACKLOG", tickets, onTicketClick: jest.fn() });

    expect(screen.getByText("BACKLOG")).toBeInTheDocument();
    expect(screen.getByTestId("column-count")).toHaveTextContent("3");
  });

  it("TC-COMP-002-2: tickets 2개면 카드 제목 2개가 렌더링된다", () => {
    const tickets = [createTicket({ id: 1, title: "티켓A" }), createTicket({ id: 2, title: "티켓B" })];

    renderColumn({ status: "TODO", tickets, onTicketClick: jest.fn() });

    expect(screen.getByText("티켓A")).toBeInTheDocument();
    expect(screen.getByText("티켓B")).toBeInTheDocument();
  });

  it("TC-COMP-002-3: tickets가 비어있으면 안내 문구와 카드 수 0이 표시된다", () => {
    renderColumn({ status: "DONE", tickets: [], onTicketClick: jest.fn() });

    expect(screen.getByText("이 칼럼에 티켓이 없습니다")).toBeInTheDocument();
    expect(screen.getByTestId("column-count")).toHaveTextContent("0");
  });

  it("카드 클릭 시 onTicketClick(ticket)이 호출된다 (TicketCard 위임)", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const ticket = createTicket({ id: 5, title: "클릭용 티켓" });

    renderColumn({ status: "TODO", tickets: [ticket], onTicketClick: handleClick });

    await user.click(screen.getByRole("button", { name: `티켓: ${ticket.title}` }));

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(ticket);
  });

  it.each([
    ["TODO", "TODO"],
    ["IN_PROGRESS", "IN PROGRESS"],
    ["DONE", "DONE"],
  ] as const)("status=%s이면 칼럼명이 '%s'로 표시된다", (status, label) => {
    renderColumn({ status, tickets: [], onTicketClick: jest.fn() });

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
