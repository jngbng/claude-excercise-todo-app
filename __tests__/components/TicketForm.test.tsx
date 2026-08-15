// TicketForm — Phase 1 (docs/COMPONENT_SPEC.md §2.8, TC-COMP-004, 생성 모드 기준)
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketForm } from "@/client/components/TicketForm";

describe("TicketForm", () => {
  it("TC-COMP-004-1: mode='create'이면 title이 빈칸이고 priority는 'MEDIUM'이 기본 선택된다", () => {
    render(<TicketForm mode="create" onSubmit={jest.fn()} onCancel={jest.fn()} isLoading={false} />);

    expect(screen.getByLabelText("제목")).toHaveValue("");
    expect(screen.getByLabelText("우선순위")).toHaveValue("MEDIUM");
  });

  it("TC-COMP-004-2: title 빈 값으로 저장 시도하면 '제목을 입력해주세요' 인라인 에러가 표시된다", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<TicketForm mode="create" onSubmit={handleSubmit} onCancel={jest.fn()} isLoading={false} />);

    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("제목을 입력해주세요")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("TC-COMP-004-3: 유효한 입력 후 저장하면 onSubmit이 호출된다", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<TicketForm mode="create" onSubmit={handleSubmit} onCancel={jest.fn()} isLoading={false} />);

    await user.type(screen.getByLabelText("제목"), "새 티켓");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: "새 티켓" }));
  });

  it("TC-COMP-004-4: 취소 클릭 시 onCancel이 호출된다", async () => {
    const user = userEvent.setup();
    const handleCancel = jest.fn();
    render(<TicketForm mode="create" onSubmit={jest.fn()} onCancel={handleCancel} isLoading={false} />);

    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("isLoading=true이면 제출 버튼이 비활성화되고 로딩 상태(처리중...)가 표시된다", () => {
    render(<TicketForm mode="create" onSubmit={jest.fn()} onCancel={jest.fn()} isLoading />);

    const submitButton = screen.getByRole("button", { name: "처리중..." });
    expect(submitButton).toBeDisabled();
  });

  it("description이 1000자를 초과하면 '설명은 1000자 이내로 입력해주세요' 에러가 표시된다", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<TicketForm mode="create" onSubmit={handleSubmit} onCancel={jest.fn()} isLoading={false} />);

    await user.type(screen.getByLabelText("제목"), "티켓");
    fireEvent.change(screen.getByLabelText("설명"), { target: { value: "a".repeat(1001) } });
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("설명은 1000자 이내로 입력해주세요")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("dueDate가 과거 날짜이면 '종료예정일은 오늘 이후 날짜를 선택해주세요' 에러가 표시된다", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    render(<TicketForm mode="create" onSubmit={handleSubmit} onCancel={jest.fn()} isLoading={false} />);

    await user.type(screen.getByLabelText("제목"), "티켓");
    fireEvent.change(screen.getByLabelText("종료예정일"), { target: { value: "2000-01-01" } });
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("종료예정일은 오늘 이후 날짜를 선택해주세요"),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
