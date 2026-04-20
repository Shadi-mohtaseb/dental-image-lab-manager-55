import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

interface SortableHeaderProps {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  className?: string;
}

export function SortableHeader({ label, active, direction, onClick, className }: SortableHeaderProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 select-none hover:text-primary transition-colors cursor-pointer font-semibold",
        active && "text-primary",
        className
      )}
    >
      <span>{label}</span>
      {active && direction === "asc" ? (
        <ArrowUp className="w-3.5 h-3.5" />
      ) : active && direction === "desc" ? (
        <ArrowDown className="w-3.5 h-3.5" />
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
      )}
    </button>
  );
}

export function useSortDirection(initial: SortDirection = "desc") {
  // helper - kept for future flexibility
  return initial;
}
