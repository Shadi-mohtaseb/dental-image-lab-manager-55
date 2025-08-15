import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useExpenseTypesData } from "@/components/expense-types/useExpenseTypesData";
import { Card, CardContent } from "@/components/ui/card";

interface ExpensesFilterBarProps {
  onSearch: (query: string) => void;
  onFilterByType: (typeId: string | null) => void;
  onFilterByDateRange: (startDate: string | null, endDate: string | null) => void;
  searchQuery: string;
  selectedType: string | null;
  startDate: string | null;
  endDate: string | null;
}

export function ExpensesFilterBar({
  onSearch,
  onFilterByType,
  onFilterByDateRange,
  searchQuery,
  selectedType,
  startDate,
  endDate
}: ExpensesFilterBarProps) {
  const { expenseTypes } = useExpenseTypesData();
  const [localStartDate, setLocalStartDate] = useState(startDate || "");
  const [localEndDate, setLocalEndDate] = useState(endDate || "");

  const handleDateRangeChange = () => {
    onFilterByDateRange(
      localStartDate || null,
      localEndDate || null
    );
  };

  const clearFilters = () => {
    onSearch("");
    onFilterByType(null);
    onFilterByDateRange(null, null);
    setLocalStartDate("");
    setLocalEndDate("");
  };

  const hasActiveFilters = searchQuery || selectedType || startDate || endDate;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* شريط البحث */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في جميع المصاريف..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* فلاتر */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* تصفية حسب النوع */}
            <Select value={selectedType || ""} onValueChange={(value) => onFilterByType(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="نوع المصروف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الأنواع</SelectItem>
                {expenseTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* تاريخ البداية */}
            <Input
              type="date"
              placeholder="من تاريخ"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              onBlur={handleDateRangeChange}
            />

            {/* تاريخ النهاية */}
            <Input
              type="date"
              placeholder="إلى تاريخ"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              onBlur={handleDateRangeChange}
            />

            {/* زر مسح الفلاتر */}
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                مسح الفلاتر
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}