"use client";

import { useState } from "react";
import type { TicketWithMeta } from "@/shared/types";
import type { UpdateTicketInput } from "@/shared/validations/ticket";
import { Modal } from "@/client/components/ui/Modal";
import { Button } from "@/client/components/ui/Button";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";
import { TicketDetailView } from "@/client/components/TicketDetailView";
import { TicketForm } from "@/client/components/TicketForm";

type TicketModalProps = {
  ticket: TicketWithMeta;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateTicketInput) => void;
  onDelete: (id: number) => void;
};

export const TicketModal = ({ ticket, isOpen, onClose, onUpdate, onDelete }: TicketModalProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSubmit = (data: UpdateTicketInput) => {
    onUpdate(ticket.id, data);
  };

  const handleConfirmDelete = () => {
    setIsConfirmOpen(false);
    onDelete(ticket.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <TicketForm mode="edit" initialData={ticket} onSubmit={handleSubmit} onCancel={onClose} isLoading={false} />

        <TicketDetailView
          status={ticket.status}
          startedAt={ticket.startedAt}
          completedAt={ticket.completedAt}
          createdAt={ticket.createdAt}
        />

        {!isConfirmOpen && (
          <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
            삭제
          </Button>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </Modal>
  );
};
