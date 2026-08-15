// TicketModal — Phase 2 (docs/COMPONENT_SPEC.md §2.7 TicketModal, TC-COMP-005, TC-COMP-006 통합)
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketModal } from "@/client/components/TicketModal";
import type { TicketWithMeta } from "@/shared/types";

const baseTicket: TicketWithMeta = {
  id: 1,
  title: "로그인 페이지 리팩토링",
  description: null,
  status: "IN_PROGRESS",
  priority: "HIGH",
  position: 0,
  plannedStartDate: null,
  dueDate: "2026-08-20",
  startedAt: "2026-08-01T00:00:00.000Z",
  completedAt: null,
  createdAt: "2026-07-30T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  isOverdue: false,
};

const createTicket = (overrides: Partial<TicketWithMeta> = {}): TicketWithMeta => ({
  ...baseTicket,
  ...overrides,
});

const renderModal = (overrides: Partial<React.ComponentProps<typeof TicketModal>> = {}) => {
  const props = {
    ticket: createTicket(),
    isOpen: true,
    onClose: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    ...overrides,
  };
  render(<TicketModal {...props} />);
  return props;
};

describe("TicketModal", () => {
  it("TC-COMP-005-1: 기존 ticket 데이터로 title, priority가 폼에 초기화된다", () => {
    renderModal({ ticket: createTicket({ title: "기존 제목", priority: "LOW" }) });

    expect(screen.getByLabelText("제목")).toHaveValue("기존 제목");
    expect(screen.getByLabelText("우선순위")).toHaveValue("LOW");
  });

  it("TC-COMP-005-2: 필드 수정 후 저장하면 onUpdate가 호출되고 onClose는 호출되지 않는다", async () => {
    const user = userEvent.setup();
    const { onUpdate, onClose } = renderModal({ ticket: createTicket({ id: 42 }) });

    await user.clear(screen.getByLabelText("제목"));
    await user.type(screen.getByLabelText("제목"), "수정된 제목");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(42, expect.objectContaining({ title: "수정된 제목" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("TC-COMP-005-3: [삭제] 버튼이 존재한다", () => {
    renderModal();

    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("TC-COMP-006 통합: [삭제] 클릭 시 ConfirmDialog가 표시되고, 확인 시 onDelete가 호출된다", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderModal({ ticket: createTicket({ id: 7 }) });

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(screen.getByText("정말 삭제하시겠습니까?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  it("TC-COMP-006 통합: ConfirmDialog에서 [취소] 클릭 시 onDelete가 호출되지 않는다", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderModal();

    await user.click(screen.getByRole("button", { name: "삭제" }));
    const confirmDialog = screen.getByText("정말 삭제하시겠습니까?").closest('[role="dialog"]') as HTMLElement;
    await user.click(within(confirmDialog).getByRole("button", { name: "취소" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText("정말 삭제하시겠습니까?")).not.toBeInTheDocument();
  });

  it("status/startedAt/completedAt/createdAt은 TicketDetailView를 통해 읽기 전용으로 표시된다", () => {
    renderModal({
      ticket: createTicket({
        status: "IN_PROGRESS",
        startedAt: "2026-08-01T00:00:00.000Z",
        completedAt: null,
        createdAt: "2026-07-30T00:00:00.000Z",
      }),
    });

    expect(screen.getByText("IN_PROGRESS")).toBeInTheDocument();
    expect(screen.getByText("2026-08-01")).toBeInTheDocument();
    expect(screen.getByText("2026-07-30")).toBeInTheDocument();
  });

  it("ESC 키를 누르면 onClose가 호출된다 (Modal 위임)", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("오버레이(바깥 영역) 클릭 시 onClose가 호출된다 (Modal 위임)", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByTestId("modal-overlay"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("isOpen=false이면 아무것도 렌더링하지 않는다", () => {
    renderModal({ isOpen: false });

    expect(screen.queryByLabelText("제목")).not.toBeInTheDocument();
  });
});
