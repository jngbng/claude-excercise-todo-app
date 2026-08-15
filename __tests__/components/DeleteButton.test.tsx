// DeleteButton — Phase 1 (docs/COMPONENT_SPEC.md §2.7, TicketModal 내 삭제 트리거)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteButton } from "@/client/components/DeleteButton";

describe("DeleteButton", () => {
  it("'삭제' 텍스트가 렌더링된다", () => {
    render(<DeleteButton onClick={jest.fn()} />);

    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("danger variant(Button)로 렌더링된다", () => {
    render(<DeleteButton onClick={jest.fn()} />);

    expect(screen.getByRole("button", { name: "삭제" })).toHaveClass("bg-danger", "text-white");
  });

  it("클릭 시 onClick이 1회 호출된다", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<DeleteButton onClick={handleClick} />);

    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
