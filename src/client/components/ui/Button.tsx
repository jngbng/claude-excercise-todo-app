"use client";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 transition-colors",
  secondary:
    "bg-white border border-border-default text-text-primary hover:bg-surface-app transition-colors",
  danger: "bg-danger text-white hover:bg-danger-hover transition-colors",
  ghost: "bg-transparent text-text-primary hover:bg-surface-app transition-colors",
};

// 버튼 텍스트도 docs/DESIGN_SYSTEM.md §3 "내용" 규칙(12px)을 따른다 — 크기 구분은 padding으로만 표현
const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-xs px-4 py-2",
  lg: "text-xs px-5 py-2.5",
};

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  onClick,
  children,
}: ButtonProps) => {
  return (
    <button
      className={`rounded-button ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]}`}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? "처리중..." : children}
    </button>
  );
};
