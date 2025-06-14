
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type CasesFilterBarProps = {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  totalCount: number;
};

const statuses = [
  { label: "قيد التنفيذ", color: "blue-500" },
  { label: "تم التسليم", color: "green-500" },
  { label: "زيركون", color: "purple-500" },
  { label: "مؤقت", color: "orange-500" },
];

export function CasesFilterBar({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
}: CasesFilterBarProps) {
  return (
    <div className="p-6">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="بحث عن مريض أو طبيب أو رقم الحالة..."
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
        <Badge
          variant={!statusFilter ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-white"
          onClick={() => onStatusFilterChange("")}
        >
          الكل ({totalCount})
        </Badge>
        {statuses.map(({ label, color }) => (
          <Badge
            key={label}
            variant={statusFilter === label ? "default" : "outline"}
            className={`cursor-pointer hover:bg-${color} hover:text-white`}
            onClick={() => onStatusFilterChange(label)}
          >
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
