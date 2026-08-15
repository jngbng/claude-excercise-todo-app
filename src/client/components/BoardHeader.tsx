import { Button } from "@/client/components/ui/Button";
import { SearchInput } from "@/client/components/SearchInput";

type BoardHeaderProps = {
  onCreateClick: () => void;
};

export const BoardHeader = ({ onCreateClick }: BoardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <SearchInput />
      <Button variant="primary" onClick={onCreateClick}>
        새 업무
      </Button>
    </div>
  );
};
