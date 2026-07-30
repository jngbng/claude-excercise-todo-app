// Modal — 공통 UI 프리미티브 (docs/COMPONENT_SPEC.md §3 Modal, docs/FRONTEND_TASKS.md Phase 0 참조)
// TEST_CASES.md 미기재 컴포넌트. 이번 세션 범위는 5개 테스트로 한정한다:
// isOpen, ESC키로 닫기, 오버레이클릭시 닫기, 컨텐츠클릭 무시, role=dialog
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/client/components/Modal";

describe("Modal", () => {
  it("isOpen=false이면 아무것도 렌더링하지 않는다", () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()}>
        <p>모달 내용</p>
      </Modal>,
    );

    expect(screen.queryByText("모달 내용")).not.toBeInTheDocument();
  });

  it("isOpen=true이면 children을 렌더링한다", () => {
    render(
      <Modal isOpen onClose={jest.fn()}>
        <p>모달 내용</p>
      </Modal>,
    );

    expect(screen.getByText("모달 내용")).toBeInTheDocument();
  });

  it("role=dialog로 렌더링된다", () => {
    render(
      <Modal isOpen onClose={jest.fn()}>
        <p>모달 내용</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("ESC 키를 누르면 onClose가 호출된다", async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        <p>모달 내용</p>
      </Modal>,
    );

    await user.keyboard("{Escape}");

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("오버레이(바깥 영역) 클릭 시 onClose가 호출된다", async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        <p>모달 내용</p>
      </Modal>,
    );

    await user.click(screen.getByTestId("modal-overlay"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("모달 콘텐츠 내부 클릭 시 onClose가 호출되지 않는다", async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        <p>모달 내용</p>
      </Modal>,
    );

    await user.click(screen.getByText("모달 내용"));

    expect(handleClose).not.toHaveBeenCalled();
  });
});
