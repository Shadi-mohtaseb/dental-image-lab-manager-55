
import React from "react";
import { DoctorStatsCard } from "@/components/doctors-log/DoctorStatsCard";
import { DoctorAccountTable } from "@/components/doctors-log/DoctorAccountTable";
import { MostActiveDoctors } from "@/components/doctors-log/MostActiveDoctors";
import { RecentSubmissions } from "@/components/doctors-log/RecentSubmissions";
import { useDoctors } from "@/hooks/useDoctors";
import { useCases } from "@/hooks/useCases";

// Helper for badge color
const getStatusColor = (status: string): string => {
  if (status.includes("تم")) return "bg-green-100 text-green-700";
  if (status.includes("متأخر")) return "bg-red-100 text-red-700";
  if (status.includes("قيد")) return "bg-yellow-100 text-yellow-700";
  return "bg-gray-200 text-gray-600";
};

const DoctorsLog = () => {
  const { data: doctors = [], isLoading: isLoadingDoctors } = useDoctors();
  const { data: cases = [], isLoading: isLoadingCases } = useCases();

  // إحصائيات عامة:
  const totalCases = cases.length;
  const casesInProgress = cases.filter(
    (c: any) => c.status === "قيد التنفيذ" || c.status === "تجهيز العمل" || c.status === "اختبار القوي" || c.status === "المراجعة النهائية"
  ).length;
  const lateCases = cases.filter(
    (c: any) => c.status === "متأخر" || (c.status !== "تم التسليم" && c.delivery_date && new Date(c.delivery_date) < new Date())
  ).length;

  const stats = [
    { count: totalCases, label: "إجمالي الحالات", color: "text-blue-600" },
    { count: casesInProgress, label: "حالات قيد التنفيذ", color: "text-yellow-600" },
    { count: lateCases, label: "حالات متأخرة", color: "text-red-600" },
  ];

  // الأطباء الأكثر نشاطاً (حسب عدد الحالات المرتبطة بكل طبيب)
  const activeDoctors = doctors
    .map((doc) => ({
      id: doc.id,
      name: doc.name,
      caseCount: cases.filter((c: any) => c.doctor_id === doc.id).length,
    }))
    .sort((a, b) => b.caseCount - a.caseCount)
    .slice(0, 3);

  // التسليمات الأخيرة (آخر حالات تمت إضافتها)
  const submissions = cases
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((c: any) => ({
      doctor: doctors.find((d) => d.id === c.doctor_id)?.name ?? "غير معروف",
      case: c.work_type,
      date: c.delivery_date || c.created_at,
      status: c.status,
    }));

  if (isLoadingDoctors || isLoadingCases) {
    return (
      <div className="flex justify-center items-center h-40 text-lg">جاري التحميل ...</div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* إحصائيات مختصرة في الأعلى */}
      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <DoctorStatsCard key={s.label} {...s} />
        ))}
      </div>

      {/* جدول كشف حساب الأطباء */}
      <DoctorAccountTable doctors={doctors} cases={cases} />

      {/* قسم الأطباء الأكثر نشاطاً والتسليمات الأخيرة */}
      <div className="grid md:grid-cols-2 gap-4">
        <MostActiveDoctors doctors={activeDoctors} />
        <RecentSubmissions submissions={submissions} getStatusColor={getStatusColor} />
      </div>
    </div>
  );
};

export default DoctorsLog;
