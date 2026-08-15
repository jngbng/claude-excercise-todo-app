"use client";

import { useState } from "react";
import type { Ticket, TicketPriority } from "@/shared/types";
import {
  createTicketSchema,
  updateTicketSchema,
  type CreateTicketInput,
  type UpdateTicketInput,
} from "@/shared/validations/ticket";
import { Button } from "@/client/components/ui/Button";

type TicketFormMode = "create" | "edit";

type TicketFormProps = {
  mode: TicketFormMode;
  initialData?: Partial<Ticket>;
  onSubmit: (data: CreateTicketInput | UpdateTicketInput) => void;
  onCancel: () => void;
  isLoading: boolean;
};

type FormErrors = Partial<
  Record<"title" | "description" | "priority" | "plannedStartDate" | "dueDate", string>
>;

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <p role="alert" className="mt-1 text-sm text-danger">
      {message}
    </p>
  );
};

export const TicketForm = ({ mode, initialData, onSubmit, onCancel, isLoading }: TicketFormProps) => {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [priority, setPriority] = useState<TicketPriority>(initialData?.priority ?? "MEDIUM");
  const [plannedStartDate, setPlannedStartDate] = useState(initialData?.plannedStartDate ?? "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = () => {
    const input = {
      title,
      description: description || null,
      priority,
      plannedStartDate: plannedStartDate || null,
      dueDate: dueDate || null,
    };

    const schema = mode === "create" ? createTicketSchema : updateTicketSchema;
    const result = schema.safeParse(input);

    if (!result.success) {
      const nextErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="ticket-title" className="mb-1 block text-sm text-text-secondary">
          제목
        </label>
        <input
          id="ticket-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-button border border-border-default px-3 py-1.5 text-sm"
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <label htmlFor="ticket-description" className="mb-1 block text-sm text-text-secondary">
          설명
        </label>
        <textarea
          id="ticket-description"
          value={description ?? ""}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-button border border-border-default px-3 py-1.5 text-sm"
        />
        <FieldError message={errors.description} />
      </div>

      <div>
        <label htmlFor="ticket-priority" className="mb-1 block text-sm text-text-secondary">
          우선순위
        </label>
        <select
          id="ticket-priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value as TicketPriority)}
          className="w-full rounded-button border border-border-default px-3 py-1.5 text-sm"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <div>
        <label htmlFor="ticket-planned-start-date" className="mb-1 block text-sm text-text-secondary">
          시작예정일
        </label>
        <input
          id="ticket-planned-start-date"
          type="date"
          value={plannedStartDate ?? ""}
          onChange={(event) => setPlannedStartDate(event.target.value)}
          className="w-full rounded-button border border-border-default px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="ticket-due-date" className="mb-1 block text-sm text-text-secondary">
          종료예정일
        </label>
        <input
          id="ticket-due-date"
          type="date"
          value={dueDate ?? ""}
          onChange={(event) => setDueDate(event.target.value)}
          className="w-full rounded-button border border-border-default px-3 py-1.5 text-sm"
        />
        <FieldError message={errors.dueDate} />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" isLoading={isLoading} onClick={handleSubmit}>
          저장
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
      </div>
    </div>
  );
};
