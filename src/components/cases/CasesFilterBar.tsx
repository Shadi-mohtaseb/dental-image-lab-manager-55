
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type CasesFilterBarProps = {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  workTypeFilter: string;
  onWorkTypeFilterChange: (v: string) => void;
  totalCount: number;
};

const statuses = [
  { label: "قيد التنفيذ", color: "blue-500" },
  { label: "تم التسليم", color: "green-500" },
  { label: "تجهيز العمل", color: "yellow-500" },
  { label: "اختبار القوي", color: "orange-500" },
  { label: "المراجعة النهائية", color: "purple-500" },
  { label: "معلق", color: "gray-500" },
  { label: "ملغي", color: "red-500" },
];

const workTypes = [
  { label: "زيركون", color: "purple-500" },
  { label: "مؤقت", color: "orange-500" },
];

export function CasesFilterBar({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  workTypeFilter,
  onWorkTypeFilterChange,
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
      <div className="flex gap-2 flex-wrap mb-2">
        <span className="font-bold text-sm text-gray-600 mt-1">الحالة:</span>
        <Badge
          variant={!statusFilter ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-white"
          onClick={() => onStatusFilterChange("")}
        >
          الكل
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
