// Button — 공통 UI 프리미티브 (docs/COMPONENT_SPEC.md §3, docs/FRONTEND_TASKS.md Phase 0 참조)
// TEST_CASES.md 미기재 컴포넌트 — 아래 variant/size 클래스 매핑은 이 테스트가 정의하는 계약이며,
// Green 단계 구현은 이 클래스를 그대로 적용해야 한다.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/client/components/ui/Button";

const VARIANT_CLASSES = {
  primary: ["bg-brand-500", "text-white"],
  secondary: ["bg-white", "border", "border-border-default", "text-text-primary"],
  danger: ["bg-danger", "text-white"],
  ghost: ["bg-transparent", "text-text-primary"],
} as const;

const SIZE_CLASSES = {
  sm: ["text-xs", "px-3", "py-1.5"],
  md: ["text-xs", "px-4", "py-2"],
  lg: ["text-xs", "px-5", "py-2.5"],
} as const;

describe("Button", () => {
  describe.each(Object.entries(VARIANT_CLASSES))("variant=%s", (variant, classes) => {
    it(`variant=${variant}일 때 해당 클래스가 적용된다`, () => {
      render(<Button variant={variant as keyof typeof VARIANT_CLASSES}>버튼</Button>);

      expect(screen.getByRole("button")).toHaveClass(...classes);
    });
  });

  describe.each(Object.entries(SIZE_CLASSES))("size=%s", (size, classes) => {
    it(`size=${size}일 때 해당 클래스가 적용된다`, () => {
      render(<Button size={size as keyof typeof SIZE_CLASSES}>버튼</Button>);

      expect(screen.getByRole("button")).toHaveClass(...classes);
    });
  });

  it("variant/size를 지정하지 않으면 기본값 primary/md 클래스가 적용된다", () => {
    render(<Button>버튼</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(...VARIANT_CLASSES.primary);
    expect(button).toHaveClass(...SIZE_CLASSES.md);
  });

  it("클릭하면 onClick 핸들러가 1회 호출된다", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>저장</Button>);

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("isLoading=true이면 버튼이 비활성화되고 '처리중...' 텍스트가 표시된다", () => {
    render(<Button isLoading>저장</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("처리중...");
  });

  it("isLoading=true이면 클릭해도 onClick이 호출되지 않는다", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(
      <Button isLoading onClick={handleClick}>
        저장
      </Button>,
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("children이 버튼 내부에 정상적으로 렌더링된다", () => {
    render(<Button>티켓 생성</Button>);

    expect(screen.getByRole("button", { name: "티켓 생성" })).toBeInTheDocument();
  });
});
