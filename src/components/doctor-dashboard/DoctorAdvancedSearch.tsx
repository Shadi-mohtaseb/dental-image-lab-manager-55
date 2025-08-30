import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

export interface SearchFilters {
  patientName: string;
  invoiceNumber: string;
  fromDate: string;
  toDate: string;
}

interface DoctorAdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export function DoctorAdvancedSearch({ 
  onSearch, 
  activeFiltersCount, 
  onClearFilters 
}: DoctorAdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    patientName: "",
    invoiceNumber: "",
    fromDate: "",
    toDate: ""
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      patientName: "",
      invoiceNumber: "",
      fromDate: "",
      toDate: ""
    });
    onClearFilters();
  };

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          البحث المتقدم
        </CardTitle>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {activeFiltersCount} مرشح نشط
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              مسح الكل
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">اسم المريض</Label>
            <Input
              id="patientName"
              placeholder="اكتب اسم المريض..."
              value={filters.patientName}
              onChange={(e) => handleInputChange("patientName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">رقم الفاتورة/السن</Label>
            <Input
              id="invoiceNumber"
              placeholder="رقم الفاتورة أو السن..."
              value={filters.invoiceNumber}
              onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromDate">من تاريخ</Label>
            <Input
              id="fromDate"
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleInputChange("fromDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="toDate">إلى تاريخ</Label>
            <Input
              id="toDate"
              type="date"
              value={filters.toDate}
              onChange={(e) => handleInputChange("toDate", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            بحث
          </Button>
          <Button variant="outline" onClick={handleClear}>
            مسح الكل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}