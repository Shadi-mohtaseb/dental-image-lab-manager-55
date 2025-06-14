
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type CasesFilterBarProps = {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  workTypeFilter: string;
  onWorkTypeFilterChange: (v: string) => void;
  totalCount: number;
};

const workTypes = [
  { label: "زيركون", color: "purple-500" },
  { label: "مؤقت", color: "orange-500" },
];

export function CasesFilterBar({
  searchTerm,
  onSearchTermChange,
  workTypeFilter,
  onWorkTypeFilterChange,
  totalCount,
}: CasesFilterBarProps) {
  return (
    <div className="p-6">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="بحث عن اسم الطبيب..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full"
          />
        </div>
        <Button variant="outline" className="gap-2" tabIndex={-1} disabled>
          <Search className="w-4 h-4" />
          بحث
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <span className="font-bold text-sm text-gray-600 mt-1">نوع العمل:</span>
        <Badge
          variant={!workTypeFilter ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-white"
          onClick={() => onWorkTypeFilterChange("")}
        >
          الكل ({totalCount})
        </Badge>
        {workTypes.map(({ label, color }) => (
          <Badge
            key={label}
            variant={workTypeFilter === label ? "default" : "outline"}
            className={`cursor-pointer hover:bg-${color} hover:text-white`}
            onClick={() => onWorkTypeFilterChange(label)}
          >
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
