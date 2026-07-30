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

export const Button = (_: ButtonProps) => {
  return <button></button>;
};
