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
  primary: "bg-brand-500 text-white",
  secondary: "bg-white border border-border-default text-text-primary",
  danger: "bg-danger text-white",
  ghost: "bg-transparent text-text-primary",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-base px-4 py-2",
  lg: "text-lg px-5 py-2.5",
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
      className={`${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]}`}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? "처리중..." : children}
    </button>
  );
};
