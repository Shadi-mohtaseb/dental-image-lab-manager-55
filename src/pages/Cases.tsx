import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCases, useDeleteCase, useUpdateCase } from "@/hooks/useCases";
import { AddCaseDialog } from "@/components/AddCaseDialog";
import { EditCaseDialog } from "@/components/EditCaseDialog";
import { Tables } from "@/integrations/supabase/types";
import { CasesFilterBar } from "@/components/cases/CasesFilterBar";
import { CasesTable } from "@/components/cases/CasesTable";
import { toast } from "@/hooks/use-toast";

const Cases = () => {
  const navigate = useNavigate();
  const { data: cases = [], isLoading } = useCases();
  const deleteCase = useDeleteCase();
  const updateCase = useUpdateCase();
  const [searchTerm, setSearchTerm] = useState("");
  // Set "all" as the initial filter for selectedDoctorId
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");
  const [workTypeFilter, setWorkTypeFilter] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Tables<"cases"> | null>(null);

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

  // دالة تحديث الحالة عند الضغط على زر الحالة
  const handleStatusChange = async (
    caseItem: Tables<"cases">,
    targetStatus: Tables<"cases">["status"] // هذا هو التعديل، نستخدم النوع من enum مباشرةً
  ) => {
    try {
      await updateCase.mutateAsync({ id: caseItem.id, status: targetStatus });
      toast({
        title: "تم تغيير حالة التنفيذ",
        description: `تم تحديث الحالة إلى: ${targetStatus}`,
      });
    } catch (error) {
      toast({
        title: "حدث خطأ أثناء تحديث الحالة",
        description: (error as Error)?.message || "يرجى المحاولة لاحقًا",
        variant: "destructive",
      });
    }
  };

  // التصفية حسب البحث النصي للمريض أو dropdown للطبيب ونوع العمل
  const filteredCases = cases.filter((caseItem) => {
    // إذا تم اختيار طبيب من القائمة المنسدلة، نعتمد فقط على الـ id (أولوية أساسية).
    if (selectedDoctorId && selectedDoctorId !== "all") {
      const matchesDoctor = caseItem.doctor_id === selectedDoctorId;
      const matchesWorkType = !workTypeFilter || caseItem.work_type === workTypeFilter;
      return matchesDoctor && matchesWorkType;
    }
    // البحث النصي هنا سيتم على اسم المريض
    const matchesText = searchTerm
      ? (caseItem.patient_name || "").toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesWorkType = !workTypeFilter || caseItem.work_type === workTypeFilter;
    return matchesText && matchesWorkType;
  });

  if (isLoading) {
    return (
      <div className="relative min-h-[60vh] flex items-center justify-center animate-fade-in">
        {/* خلفية الصورة أثناء التحميل */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to top,rgba(255,255,255,.94) 60%,rgba(230,244,255,.82) 100%),url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80')",
          }}
        />
        <div className="text-lg bg-white bg-opacity-70 p-6 rounded-lg shadow-md">
          جاري تحميل الحالات...
        </div>
      </div>
    );
  }

  return (
    <div className="relative animate-fade-in min-h-screen">
      {/* خلفية صورة - ثابتة أسفل كل الصفحة */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(to top,rgba(255,255,255,.92) 70%,rgba(230,244,255,.76) 100%),url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80')",
        }}
        aria-hidden="true"
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {/* Icon and Title */}
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none"><path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">قائمة الحالات</h1>
            <p className="text-gray-600">إدارة ومتابعة جميع حالات المختبر</p>
          </div>
        </div>
        <AddCaseDialog />
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-0">
            <CasesFilterBar
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              selectedDoctorId={selectedDoctorId}
              onDoctorChange={setSelectedDoctorId}
              workTypeFilter={workTypeFilter}
              onWorkTypeFilterChange={setWorkTypeFilter}
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
                {"لا توجد نتائج مطابقة للبحث"}
              </div>
            ) : (
              <CasesTable
                cases={filteredCases}
                onView={handleViewCase}
                onEdit={(ci) => {
                  setSelectedCase(ci);
                  setEditOpen(true);
                }}
                onDelete={handleDeleteCase}
                onStatusChange={handleStatusChange}
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
    </div>
  );
};

export default Cases;
