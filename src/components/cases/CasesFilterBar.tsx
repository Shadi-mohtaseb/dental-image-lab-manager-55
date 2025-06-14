import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDoctors } from "@/hooks/useDoctors";

type CasesFilterBarProps = {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  selectedDoctorId: string;
  onDoctorChange: (v: string) => void;
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
  selectedDoctorId,
  onDoctorChange,
  workTypeFilter,
  onWorkTypeFilterChange,
  totalCount,
}: CasesFilterBarProps) {
  const { data: doctors = [], isLoading } = useDoctors();

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex gap-4 items-center flex-wrap">
        <div>
          <Input
            placeholder="بحث نصي عن اسم المريض..."
            value={searchTerm}
            onChange={e => onSearchTermChange(e.target.value)}
            className="min-w-[200px] max-w-[270px]"
          />
        </div>
        <span className="font-bold text-sm text-gray-600">أو اختر الطبيب:</span>
        <Select value={selectedDoctorId} onValueChange={onDoctorChange}>
          <SelectTrigger className="w-48 min-w-[150px]">
            <SelectValue placeholder="كل الأطباء" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل ({totalCount})</SelectItem>
            {doctors.map((doctor: any) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <span className="font-bold text-sm text-gray-600 mt-1">نوع العمل:</span>
        <Badge
          variant={!workTypeFilter ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-white"
          onClick={() => onWorkTypeFilterChange("")}
        >
          الكل
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
