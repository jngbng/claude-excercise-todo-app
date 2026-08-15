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

  useEffect(() => {
    if (!isOpen) return;

    // 스크롤바가 사라지며 생기는 폭만큼 padding-right로 보정해 배경 레이아웃이 밀리지 않게 한다.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.classList.add("body-scroll-locked");
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.classList.remove("body-scroll-locked");
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="modal-overlay"
      className="animate-overlay-in fixed inset-0 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        className="animate-modal-in rounded-modal bg-surface-card p-6 shadow-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
