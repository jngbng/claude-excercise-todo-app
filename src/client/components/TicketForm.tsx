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
import { INPUT_CLASS } from "@/client/components/ui/inputStyles";

const LABEL_CLASS = "mb-1 block text-xs font-semibold text-text-secondary";

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
    <p role="alert" className="mt-1 text-xs text-danger">
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
        <label htmlFor="ticket-title" className={LABEL_CLASS}>
          제목
        </label>
        <input
          id="ticket-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={`w-full ${INPUT_CLASS}`}
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <label htmlFor="ticket-description" className={LABEL_CLASS}>
          설명
        </label>
        <textarea
          id="ticket-description"
          value={description ?? ""}
          onChange={(event) => setDescription(event.target.value)}
          className={`w-full ${INPUT_CLASS}`}
        />
        <FieldError message={errors.description} />
      </div>

      <div>
        <label htmlFor="ticket-priority" className={LABEL_CLASS}>
          우선순위
        </label>
        <select
          id="ticket-priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value as TicketPriority)}
          className={`w-full ${INPUT_CLASS}`}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <div>
        <label htmlFor="ticket-planned-start-date" className={LABEL_CLASS}>
          시작예정일
        </label>
        <input
          id="ticket-planned-start-date"
          type="date"
          value={plannedStartDate ?? ""}
          onChange={(event) => setPlannedStartDate(event.target.value)}
          className={`w-full ${INPUT_CLASS}`}
        />
      </div>

      <div>
        <label htmlFor="ticket-due-date" className={LABEL_CLASS}>
          종료예정일
        </label>
        <input
          id="ticket-due-date"
          type="date"
          value={dueDate ?? ""}
          onChange={(event) => setDueDate(event.target.value)}
          className={`w-full ${INPUT_CLASS}`}
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
