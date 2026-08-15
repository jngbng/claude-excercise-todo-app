type DueDateBadgeProps = {
  dueDate: string;
};

const BASE_CLASS = "text-xs font-medium";

const isOverdue = (dueDate: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
};

export const DueDateBadge = ({ dueDate }: DueDateBadgeProps) => {
  const colorClass = isOverdue(dueDate) ? "text-danger" : "text-text-secondary";

  return <span className={`${BASE_CLASS} ${colorClass}`}>{dueDate}</span>;
};
