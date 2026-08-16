type DueDateBadgeProps = {
  dueDate: string;
  isOverdue: boolean;
};

const BASE_CLASS = "text-[11px] font-semibold";

export const DueDateBadge = ({ dueDate, isOverdue }: DueDateBadgeProps) => {
  const colorClass = isOverdue ? "text-danger" : "text-text-secondary";

  return (
    <span className={`${BASE_CLASS} ${colorClass}`} data-overdue={isOverdue}>
      {dueDate}
    </span>
  );
};
