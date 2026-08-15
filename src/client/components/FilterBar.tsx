import { Button } from "@/client/components/ui/Button";

type FilterKey = "thisWeek" | "overdue";
type ActiveFilter = "all" | FilterKey;

type FilterBarProps = {
  activeFilter: ActiveFilter;
  onFilterChange: (filter: ActiveFilter) => void;
  counts: { thisWeek: number; overdue: number };
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "thisWeek", label: "이번주 업무" },
  { key: "overdue", label: "일정 초과" },
];

export const FilterBar = ({ activeFilter, onFilterChange, counts }: FilterBarProps) => {
  const handleClick = (filter: FilterKey) => {
    onFilterChange(activeFilter === filter ? "all" : filter);
  };

  return (
    <div className="flex items-center gap-2">
      {FILTERS.map(({ key, label }) => (
        <Button
          key={key}
          variant={activeFilter === key ? "primary" : "secondary"}
          onClick={() => handleClick(key)}
        >
          {label} ({counts[key]})
        </Button>
      ))}
    </div>
  );
};
