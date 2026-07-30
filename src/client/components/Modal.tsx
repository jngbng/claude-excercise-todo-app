"use client";

import { useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="modal-overlay"
      className="animate-overlay-in fixed inset-0 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div role="dialog" className="animate-modal-in" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
