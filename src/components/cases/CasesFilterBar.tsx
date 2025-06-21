
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDoctors } from "@/hooks/useDoctors";
import { useWorkTypesData } from "@/components/work-types/useWorkTypesData";

type CasesFilterBarProps = {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  selectedDoctorId: string;
  onDoctorChange: (v: string) => void;
  workTypeFilter: string;
  onWorkTypeFilterChange: (v: string) => void;
  totalCount: number;
};

export function CasesFilterBar({
  searchTerm,
  onSearchTermChange,
  selectedDoctorId,
  onDoctorChange,
  workTypeFilter,
  onWorkTypeFilterChange,
  totalCount
}: CasesFilterBarProps) {
  const { data: doctors = [], isLoading } = useDoctors();
  const { workTypes, isLoading: loadingWorkTypes } = useWorkTypesData();

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
        <span className="font-bold text-sm text-gray-600">الطبيب :</span>
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
        {loadingWorkTypes ? (
          <span className="text-sm text-gray-500">جاري التحميل...</span>
        ) : (
          workTypes?.map((workType: any) => (
            <Badge 
              key={workType.id} 
              variant={workTypeFilter === workType.name ? "default" : "outline"} 
              className="cursor-pointer hover:bg-primary hover:text-white" 
              onClick={() => onWorkTypeFilterChange(workType.name)}
            >
              {workType.name}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
