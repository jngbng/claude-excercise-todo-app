// BoardHeader — Phase 2 (docs/COMPONENT_SPEC.md §2.2 BoardHeader, TC-COMP-003 중 -2 관련 부분)
// 모달이 실제로 열리는지는 BoardContainer 레벨(TC-COMP-003-2)에서 검증한다.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoardHeader } from "@/client/components/BoardHeader";

describe("BoardHeader", () => {
  it("SearchInput(비활성)이 렌더링된다", () => {
    render(<BoardHeader onCreateClick={jest.fn()} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("'새 업무' 버튼이 렌더링된다", () => {
    render(<BoardHeader onCreateClick={jest.fn()} />);

    expect(screen.getByRole("button", { name: "새 업무" })).toBeInTheDocument();
  });

  it("'새 업무' 버튼 클릭 시 onCreateClick이 1회 호출된다", async () => {
    const user = userEvent.setup();
    const handleCreateClick = jest.fn();
    render(<BoardHeader onCreateClick={handleCreateClick} />);

    await user.click(screen.getByRole("button", { name: "새 업무" }));

    expect(handleCreateClick).toHaveBeenCalledTimes(1);
  });
});
