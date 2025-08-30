import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useDoctorByToken } from "@/hooks/useDoctorByToken";
import { DoctorSummaryCards } from "@/components/doctor-dashboard/DoctorSummaryCards";
import { DoctorAdvancedSearch, SearchFilters } from "@/components/doctor-dashboard/DoctorAdvancedSearch";
import { DoctorCasesTable } from "@/components/doctor-dashboard/DoctorCasesTable";
import { DoctorTransactionsTable } from "@/components/doctor-dashboard/DoctorTransactionsTable";
import { DoctorPDFExport } from "@/components/doctor-dashboard/DoctorPDFExport";

const DoctorDashboard = () => {
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get("token") || "";
  
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    patientName: "",
    invoiceNumber: "",
    fromDate: "",
    toDate: ""
  });

  const { data: doctorData, isLoading, error } = useDoctorByToken(accessToken);

  // حساب الإحصائيات
  const summary = useMemo(() => {
    if (!doctorData) return { totalCases: 0, totalPayments: 0, totalTeeth: 0, remainingBalance: 0 };

    const totalCases = doctorData.cases.length;
    const totalDue = doctorData.cases.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
    const totalPayments = doctorData.transactions
      .filter(t => t.transaction_type === "دفعة")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
    const totalTeeth = doctorData.cases.reduce((sum, c) => {
      const teethCount = c.teeth_count || (c.tooth_number ? parseInt(c.tooth_number) : 1);
      return sum + (isNaN(teethCount) ? 1 : teethCount);
    }, 0);

    const remainingBalance = totalDue - totalPayments;

    return {
      totalCases,
      totalPayments,
      totalTeeth,
      remainingBalance
    };
  }, [doctorData]);

  // فلترة البيانات حسب البحث
  const filteredCases = useMemo(() => {
    if (!doctorData) return [];
    
    return doctorData.cases.filter(caseItem => {
      const matchesPatientName = !searchFilters.patientName || 
        caseItem.patient_name?.toLowerCase().includes(searchFilters.patientName.toLowerCase());
      
      const matchesInvoiceNumber = !searchFilters.invoiceNumber || 
        caseItem.id?.includes(searchFilters.invoiceNumber) ||
        caseItem.tooth_number?.includes(searchFilters.invoiceNumber);
      
      const matchesFromDate = !searchFilters.fromDate || 
        new Date(caseItem.submission_date) >= new Date(searchFilters.fromDate);
      
      const matchesToDate = !searchFilters.toDate || 
        new Date(caseItem.submission_date) <= new Date(searchFilters.toDate);

      return matchesPatientName && matchesInvoiceNumber && matchesFromDate && matchesToDate;
    });
  }, [doctorData, searchFilters]);

  const activeFiltersCount = Object.values(searchFilters).filter(value => value.trim() !== "").length;

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleClearFilters = () => {
    setSearchFilters({
      patientName: "",
      invoiceNumber: "",
      fromDate: "",
      toDate: ""
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg text-muted-foreground">جاري تحميل بيانات الطبيب...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctorData) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-destructive mt-20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-destructive mb-2">الرابط غير صالح</h2>
              <p className="text-muted-foreground mb-6">
                عذراً، الرابط المستخدم غير صالح أو منتهي الصلاحية. 
                يرجى التواصل مع إدارة المختبر للحصول على رابط جديد.
              </p>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 print:p-0">
      <div className="container mx-auto max-w-7xl print:max-w-none">
        {/* Header */}
        <div className="mb-6 print:mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2 print:text-2xl">
                لوحة تحكم الطبيب
              </h1>
              <p className="text-muted-foreground">
                مرحباً د. {doctorData.name}، هنا يمكنك مراجعة جميع بياناتك ومعاملاتك
              </p>
            </div>
            <div className="print:hidden">
              <DoctorPDFExport doctorData={doctorData} summary={summary} />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <DoctorSummaryCards {...summary} />

        {/* Advanced Search */}
        <div className="print:hidden">
          <DoctorAdvancedSearch
            onSearch={handleSearch}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Cases Table */}
        <div className="mb-6">
          <DoctorCasesTable cases={filteredCases} />
        </div>

        {/* Transactions Table */}
        <div className="mb-6">
          <DoctorTransactionsTable transactions={doctorData.transactions} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8 print:mt-4">
          <p>تم إنشاء هذا التقرير في {new Date().toLocaleDateString('ar-SA')}</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;