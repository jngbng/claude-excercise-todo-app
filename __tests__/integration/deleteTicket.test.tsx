// TC-INT-003: 티켓 삭제 흐름 (docs/TEST_CASES.md, docs/FRONTEND_TASKS.md Phase 4)
// 이 흐름은 드래그 없이 클릭만으로 이루어지므로 @dnd-kit 모킹 없이 실제 컴포넌트 트리를 그대로
// 사용한다: 카드 클릭 → TicketModal → [삭제] → ConfirmDialog → [삭제]/[취소].
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as ticketApi from "@/client/api/ticketApi";
import { BoardContainer } from "@/client/components/BoardContainer";
import type { BoardData, TicketWithMeta } from "@/shared/types";

jest.mock("@/client/api/ticketApi");

const mockedApi = ticketApi as jest.Mocked<typeof ticketApi>;

const baseTicket: TicketWithMeta = {
  id: 1,
  title: "삭제할 티켓",
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

const createBoard = (overrides: Partial<BoardData> = {}): BoardData => ({
  backlog: [],
  todo: [],
  inProgress: [],
  done: [],
  ...overrides,
});

// remove()는 fire-and-forget으로 호출되므로, 모킹된 API가 반환한 프로미스를 act 스코프 안에서
// 직접 기다려야 그 이후의 setState가 act 경고 없이 반영된다.
const flushMockedPromise = async (apiMock: { mock: { results: { value: unknown }[] } }) => {
  await act(async () => {
    await (apiMock.mock.results[0]?.value as Promise<unknown> | undefined)?.catch(() => {});
  });
};

afterEach(() => {
  jest.resetAllMocks();
});

describe("TC-INT-003: 티켓 삭제 흐름", () => {
  it("TC-INT-003-1: 카드 클릭 → 삭제 → 확인 시 DELETE가 호출되고 카드가 제거되며 모달이 닫힌다", async () => {
    const user = userEvent.setup();
    const ticket = createTicket({ id: 5, title: "삭제할 티켓" });
    mockedApi.removeTicket.mockResolvedValue(undefined);

    render(<BoardContainer initialData={createBoard({ todo: [ticket] })} />);

    await user.click(screen.getByRole("button", { name: `티켓: ${ticket.title}` }));
    expect(screen.getByLabelText("제목")).toHaveValue(ticket.title);

    await user.click(screen.getByRole("button", { name: "삭제" }));
    expect(screen.getByText("정말 삭제하시겠습니까?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "삭제" }));
    await flushMockedPromise(mockedApi.removeTicket);

    expect(mockedApi.removeTicket).toHaveBeenCalledWith(ticket.id);
    expect(screen.queryByText(ticket.title)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("제목")).not.toBeInTheDocument();
  });

  it("TC-INT-003-2: 삭제 → 취소 시 DELETE가 호출되지 않고 카드/모달이 유지된다", async () => {
    const user = userEvent.setup();
    const ticket = createTicket({ id: 6, title: "유지할 티켓" });

    render(<BoardContainer initialData={createBoard({ todo: [ticket] })} />);

    await user.click(screen.getByRole("button", { name: `티켓: ${ticket.title}` }));
    await user.click(screen.getByRole("button", { name: "삭제" }));

    const confirmDialog = screen.getByText("정말 삭제하시겠습니까?").closest('[role="dialog"]') as HTMLElement;
    await user.click(within(confirmDialog).getByRole("button", { name: "취소" }));

    expect(mockedApi.removeTicket).not.toHaveBeenCalled();
    expect(screen.getByText(ticket.title)).toBeInTheDocument();
    expect(screen.getByLabelText("제목")).toHaveValue(ticket.title);
  });
});
