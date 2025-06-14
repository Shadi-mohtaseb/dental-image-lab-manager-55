
import React from "react";
import { DoctorStatsCard } from "@/components/doctors-log/DoctorStatsCard";
import { MostActiveDoctors } from "@/components/doctors-log/MostActiveDoctors";
import { RecentSubmissions } from "@/components/doctors-log/RecentSubmissions";
import { DoctorDetailedLog } from "@/components/doctors-log/DoctorDetailedLog";

/**
 * إعادة بناء صفحة سجل الأطباء بشكل بسيط لاستعادة الاستيراد في داشبورد الأطباء
 */
const mockDoctorStats = [
  { count: 24, label: "إجمالي الحالات", color: "text-blue-600" },
  { count: 5, label: "حالات قيد التنفيذ", color: "text-yellow-600" },
  { count: 2, label: "حالات متأخرة", color: "text-red-600" },
];

const mockActiveDoctors = [
  { id: "1", name: "د. أحمد حسن", caseCount: 9 },
  { id: "2", name: "د. سارة خالد", caseCount: 7 },
  { id: "3", name: "د. علي يوسف", caseCount: 6 },
];

const mockSubmissions = [
  { doctor: "د. أحمد حسن", case: "حالة زيركون", date: "2024-06-10", status: "تم التسليم" },
  { doctor: "د. علي يوسف", case: "حالة مؤقت", date: "2024-06-11", status: "قيد التنفيذ" },
  { doctor: "د. سارة خالد", case: "حالة زيركون", date: "2024-06-13", status: "متأخر" },
];

const mockDoctorsDetailed = [
  {
    id: "1",
    name: "د. أحمد حسن",
    caseCount: 3,
    recentCases: [
      { date: "2024-06-09", status: "تم التسليم", caseNumber: "1001", patient: "خالد حسين" },
      { date: "2024-06-07", status: "قيد التنفيذ", caseNumber: "1002", patient: "فاطمة أحمد" },
      { date: "2024-06-03", status: "متأخر", caseNumber: "1003", patient: "حسين صالح" },
    ]
  },
  {
    id: "2",
    name: "د. سارة خالد",
    caseCount: 2,
    recentCases: [
      { date: "2024-06-07", status: "تم التسليم", caseNumber: "1004", patient: "منى نبيل" },
      { date: "2024-06-02", status: "تم التسليم", caseNumber: "1005", patient: "سليم عارف" },
    ]
  },
  {
    id: "3",
    name: "د. علي يوسف",
    caseCount: 1,
    recentCases: []
  }
];

// Helper for badge color
const getStatusColor = (status: string): string => {
  if (status.includes("تم")) return "bg-green-100 text-green-700";
  if (status.includes("متأخر")) return "bg-red-100 text-red-700";
  if (status.includes("قيد")) return "bg-yellow-100 text-yellow-700";
  return "bg-gray-200 text-gray-600";
};

const DoctorsLog = () => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* الكروت الثلاثة العلوية للإحصائيات */}
      {mockDoctorStats.map((s) => (
        <DoctorStatsCard key={s.label} {...s} />
      ))}
      {/* الأطباء الأكثر نشاطاً & آخر التسليمات */}
      <div className="md:col-span-2">
        <MostActiveDoctors doctors={mockActiveDoctors} />
      </div>
      <div>
        <RecentSubmissions submissions={mockSubmissions} getStatusColor={getStatusColor} />
      </div>
      {/* جدول تفصيلي لكل طبيب */}
      <div className="md:col-span-3">
        <DoctorDetailedLog doctors={mockDoctorsDetailed} getStatusColor={getStatusColor} />
      </div>
    </div>
  );
};

export default DoctorsLog;
