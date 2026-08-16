import { INPUT_CLASS } from "@/client/components/ui/inputStyles";

export const SearchInput = () => {
  return (
    <input
      type="text"
      disabled
      placeholder="검색 (2차 구현 예정)"
      className={INPUT_CLASS}
    />
  );
};
