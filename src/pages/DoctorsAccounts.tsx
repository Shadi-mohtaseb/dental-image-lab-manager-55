
import { Search } from "lucide-react";
import { useDoctors } from "@/hooks/useDoctors";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddDoctorDialog } from "@/components/AddDoctorDialog";
import DoctorsAccountsTable from "@/components/doctors-accounts/DoctorsAccountsTable";
import DoctorsPaymentsTableSection from "@/components/doctors-accounts/DoctorsPaymentsTableSection";
import DoctorsPaymentsLogSection from "@/components/doctors-accounts/DoctorsPaymentsLogSection";

// صفحة حسابات الأطباء (مقسمة لأجزاء مركبة)
const DoctorsAccounts = () => {
  const { data: doctors = [], isLoading, error } = useDoctors();

  // جلب كل الحالات مرة واحدة حتى نمررها للمكونات
  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">جاري تحميل بيانات الأطباء...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg text-red-600">
            حدث خطأ أثناء تحميل بيانات الأطباء: {error.message}
          </div>
        </div>
      </div>
    );
  }

  // التأكد من أن البيانات تُطابق نوع Doctor
  const validDoctors = Array.isArray(doctors) ? doctors.filter(
    (d: any) =>
      d && typeof d.id === "string" && typeof d.name === "string" && "zircon_price" in d && "temp_price" in d
  ) : [];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">حسابات الأطباء</h1>
            <p className="text-gray-600">إدارة ومتابعة حسابات الأطباء المتعاملين</p>
          </div>
        </div>
        <AddDoctorDialog />
      </div>

      {/* جدول الأطباء */}
      <DoctorsAccountsTable doctors={validDoctors} cases={cases} />

      {/* تبويب دفعات الأطباء */}
      <DoctorsPaymentsTableSection />

      {/* سجل دفعات الأطباء */}
      <DoctorsPaymentsLogSection />
    </div>
  );
};

export default DoctorsAccounts;
