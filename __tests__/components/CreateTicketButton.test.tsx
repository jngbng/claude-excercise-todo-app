// CreateTicketButton — Phase 1 (docs/COMPONENT_SPEC.md §2.2, "새 업무" 생성 모달 트리거)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateTicketButton } from "@/client/components/CreateTicketButton";

describe("CreateTicketButton", () => {
  it("'새 업무' 텍스트가 렌더링된다", () => {
    render(<CreateTicketButton onClick={jest.fn()} />);

    expect(screen.getByRole("button", { name: "새 업무" })).toBeInTheDocument();
  });

  it("클릭 시 onClick이 1회 호출된다", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<CreateTicketButton onClick={handleClick} />);

    await user.click(screen.getByRole("button", { name: "새 업무" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("primary variant(Button)로 렌더링된다", () => {
    render(<CreateTicketButton onClick={jest.fn()} />);

    expect(screen.getByRole("button", { name: "새 업무" })).toHaveClass("bg-brand-500", "text-white");
  });
});
