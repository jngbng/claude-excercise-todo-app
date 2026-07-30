// ConfirmDialog — Phase 1 (docs/COMPONENT_SPEC.md §3 ConfirmDialog, TC-COMP-006)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "@/client/components/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("TC-COMP-006-1: isOpen=true일 때 확인 메시지와 [취소]/[삭제] 버튼이 표시된다", () => {
    render(<ConfirmDialog isOpen onConfirm={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByText("정말 삭제하시겠습니까?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("isOpen=false이면 아무것도 렌더링하지 않는다", () => {
    render(<ConfirmDialog isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.queryByText("정말 삭제하시겠습니까?")).not.toBeInTheDocument();
  });

  it("TC-COMP-006-2: [취소] 클릭 시 onCancel이 호출된다", async () => {
    const user = userEvent.setup();
    const handleCancel = jest.fn();
    render(<ConfirmDialog isOpen onConfirm={jest.fn()} onCancel={handleCancel} />);

    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("TC-COMP-006-3: [삭제] 클릭 시 onConfirm이 1회 호출된다", async () => {
    const user = userEvent.setup();
    const handleConfirm = jest.fn();
    render(<ConfirmDialog isOpen onConfirm={handleConfirm} onCancel={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("[삭제] 버튼은 danger variant(Button) 클래스로 렌더링된다", () => {
    render(<ConfirmDialog isOpen onConfirm={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByRole("button", { name: "삭제" })).toHaveClass("bg-danger", "text-white");
  });
});
