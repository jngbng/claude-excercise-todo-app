// BoardContainer — Phase 4 (docs/COMPONENT_SPEC.md §2.1 BoardContainer, TC-COMP-003)
// ticketApi만 모킹하고 실제 useTickets/Board/Column/TicketCard는 그대로 사용한다.
// 실제 DnD 이벤트 배선(TC-INT-001/002)은 __tests__/integration/*에서 별도로 검증한다.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoardContainer } from "@/client/components/BoardContainer";
import { isThisWeek, isOverdueTicket } from "@/client/components/BoardContainer";
import type { BoardData, TicketWithMeta } from "@/shared/types";

jest.mock("@/client/api/ticketApi");

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

describe("BoardContainer", () => {
  it("TC-COMP-003-1: BACKLOG/TODO/IN PROGRESS/DONE 칼럼명이 모두 표시된다", () => {
    render(<BoardContainer initialData={createBoard()} />);

    expect(screen.getByText("BACKLOG")).toBeInTheDocument();
    expect(screen.getByText("TODO")).toBeInTheDocument();
    expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();
    expect(screen.getByText("DONE")).toBeInTheDocument();
  });

  it('TC-COMP-003-2: "새 업무" 클릭 시 생성 모드 TicketForm 모달이 렌더링된다', async () => {
    const user = userEvent.setup();
    render(<BoardContainer initialData={createBoard()} />);

    await user.click(screen.getByRole("button", { name: "새 업무" }));

    expect(screen.getByLabelText("제목")).toHaveValue("");
    expect(screen.getByLabelText("우선순위")).toHaveValue("MEDIUM");
  });

  it("TC-COMP-003-3: FilterBar(이번주 업무 / 일정 초과 버튼)가 표시된다", () => {
    render(<BoardContainer initialData={createBoard()} />);

    expect(screen.getByRole("button", { name: /이번주 업무/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /일정 초과/ })).toBeInTheDocument();
  });

  it("카드 클릭 시 수정 모드 TicketModal이 열린다", async () => {
    const user = userEvent.setup();
    const ticket = createTicket({ id: 10, title: "수정용 티켓", status: "TODO" });

    render(<BoardContainer initialData={createBoard({ todo: [ticket] })} />);

    await user.click(screen.getByRole("button", { name: `티켓: ${ticket.title}` }));

    expect(screen.getByLabelText("제목")).toHaveValue(ticket.title);
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("필터 적용 시 TODO/IN_PROGRESS만 필터링되고 BACKLOG는 항상 전체 표시된다", async () => {
    const user = userEvent.setup();
    const board = createBoard({
      backlog: [createTicket({ id: 1, title: "백로그-지남", isOverdue: true, status: "BACKLOG" })],
      todo: [
        createTicket({ id: 2, title: "투두-지남", isOverdue: true, status: "TODO" }),
        createTicket({ id: 3, title: "투두-정상", isOverdue: false, status: "TODO" }),
      ],
    });

    render(<BoardContainer initialData={board} />);

    await user.click(screen.getByRole("button", { name: /일정 초과/ }));

    expect(screen.getByText("백로그-지남")).toBeInTheDocument();
    expect(screen.getByText("투두-지남")).toBeInTheDocument();
    expect(screen.queryByText("투두-정상")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /일정 초과/ }));

    expect(screen.getByText("투두-정상")).toBeInTheDocument();
  });
});

describe("isOverdueTicket", () => {
  it("ticket.isOverdue 값을 그대로 반환한다", () => {
    expect(isOverdueTicket(createTicket({ isOverdue: true }))).toBe(true);
    expect(isOverdueTicket(createTicket({ isOverdue: false }))).toBe(false);
  });
});

describe("isThisWeek", () => {
  const monday = new Date("2026-08-17T00:00:00.000Z");

  it("BACKLOG/DONE 상태이면 dueDate와 무관하게 false다", () => {
    const backlog = createTicket({ status: "BACKLOG", dueDate: "2026-08-18" });
    const done = createTicket({ status: "DONE", dueDate: "2026-08-18" });

    expect(isThisWeek(backlog, monday)).toBe(false);
    expect(isThisWeek(done, monday)).toBe(false);
  });

  it("dueDate가 없으면 false다", () => {
    const ticket = createTicket({ status: "TODO", dueDate: null });

    expect(isThisWeek(ticket, monday)).toBe(false);
  });

  it("이번 주(월~일) 범위 안의 dueDate면 true다", () => {
    const startOfWeek = createTicket({ status: "TODO", dueDate: "2026-08-17" });
    const endOfWeek = createTicket({ status: "IN_PROGRESS", dueDate: "2026-08-23" });

    expect(isThisWeek(startOfWeek, monday)).toBe(true);
    expect(isThisWeek(endOfWeek, monday)).toBe(true);
  });

  it("이번 주 범위 밖의 dueDate면 false다", () => {
    const beforeWeek = createTicket({ status: "TODO", dueDate: "2026-08-16" });
    const afterWeek = createTicket({ status: "TODO", dueDate: "2026-08-24" });

    expect(isThisWeek(beforeWeek, monday)).toBe(false);
    expect(isThisWeek(afterWeek, monday)).toBe(false);
  });
});
