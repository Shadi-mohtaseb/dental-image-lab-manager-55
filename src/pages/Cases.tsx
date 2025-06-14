
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCases, useDeleteCase, useUpdateCase } from "@/hooks/useCases";
import { AddCaseDialog } from "@/components/AddCaseDialog";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import { Tables } from "@/integrations/supabase/types";
import { CasesFilterBar } from "@/components/cases/CasesFilterBar";
import { CasesTable } from "@/components/cases/CasesTable";

const Cases = () => {
  const navigate = useNavigate();
  const { data: cases = [], isLoading } = useCases();
  const deleteCase = useDeleteCase();
  const updateCase = useUpdateCase();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Tables<"cases"> | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "قيد التنفيذ":
        return "bg-blue-100 text-blue-700";
      case "تجهيز العمل":
        return "bg-yellow-100 text-yellow-700";
      case "اختبار القوي":
        return "bg-orange-100 text-orange-700";
      case "تم التسليم":
        return "bg-green-100 text-green-700";
      case "المراجعة النهائية":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleViewCase = (caseId: string) => {
    navigate(`/case/${caseId}`);
  };

  const handleDeleteCase = async (caseId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحالة؟")) {
      await deleteCase.mutateAsync(caseId);
    }
  };

  const handleUpdateCase = (updated: Tables<"cases">) => {
    setEditOpen(false);
    setSelectedCase(null);
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch =
      caseItem.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.case_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">جاري تحميل الحالات...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon and Title */}
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none"><path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">قائمة الحالات</h1>
            <p className="text-gray-600">إدارة ومتابعة جميع حالات المختبر</p>
          </div>
        </div>
        <AddCaseDialog />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-0">
          <CasesFilterBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            totalCount={cases.length}
          />
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>جميع الحالات ({filteredCases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter ? "لا توجد نتائج مطابقة للبحث" : "لا توجد حالات مسجلة حتى الآن"}
            </div>
          ) : (
            <CasesTable
              cases={filteredCases}
              onView={handleViewCase}
              onEdit={(ci) => { setSelectedCase(ci); setEditOpen(true); }}
              onDelete={handleDeleteCase}
              getStatusColor={getStatusColor}
            />
          )}
        </CardContent>
      </Card>

      {/* نافذة التعديل */}
      <EditCaseDialog
        caseData={selectedCase}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedCase(null);
        }}
        onUpdate={handleUpdateCase}
      />
    </div>
  );
};

export default Cases;
