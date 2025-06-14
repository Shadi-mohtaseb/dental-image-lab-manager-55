import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Calendar } from "lucide-react";
import { useDoctors } from "@/hooks/useDoctors";
import { useCases } from "@/hooks/useCases";
import { useState } from "react";
import { DoctorStatsCard } from "@/components/doctors-log/DoctorStatsCard";
import { MostActiveDoctors } from "@/components/doctors-log/MostActiveDoctors";
import { RecentSubmissions } from "@/components/doctors-log/RecentSubmissions";
import { DoctorDetailedLog } from "@/components/doctors-log/DoctorDetailedLog";

// ربط سجل الأطباء بالبيانات الفعلية من Supabase
const DoctorsLog = () => {
  const { data: doctors = [], isLoading: doctorsLoading } = useDoctors();
  const { data: cases = [], isLoading: casesLoading } = useCases();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | "all">("all");

  // ترتيب الأطباء حسب عدد الحالات (الأكثر نشاطًا)
  const doctorStats = useMemo(() => {
    if (!doctors || !cases) return [];
    return doctors.map(doctor => {
      const relatedCases = cases.filter(cs => cs.doctor_id === doctor.id);
      return {
        ...doctor,
        caseCount: relatedCases.length,
        recentCases: relatedCases
          .sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime())
          .slice(0, 3)
          .map(cs => ({
            date: cs.submission_date,
            status: cs.status,
            caseNumber: cs.case_number,
            patient: cs.patient_name,
          })),
      };
    }).sort((a, b) => b.caseCount - a.caseCount);
  }, [doctors, cases]);

  // إحصائيات عامة
  const stats = useMemo(() => {
    const zircon = cases.filter(c => c.work_type === "زيركون").length;
    const complete = cases.filter(c => c.status === "تم التسليم" ).length;
    const inProgress = cases.filter(c => c.status === "قيد التنفيذ").length;
    const temp = cases.filter(c => c.work_type === "مؤقت").length;
    return [
      { count: complete, label: "حالات مكتملة", color: "text-green-600" },
      { count: inProgress, label: "حالات قيد التنفيذ", color: "text-blue-600" },
      { count: temp, label: "حالات مؤقتة", color: "text-yellow-600" },
      { count: zircon, label: "حالات زيركون", color: "text-purple-600" },
      { count: cases.length, label: "إجمالي الحالات", color: "text-gray-600" },
    ];
  }, [cases]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "جديد":
        return "bg-blue-100 text-blue-700";
      case "مكتمل":
      case "تم التسليم":
        return "bg-green-100 text-green-700";
      case "قيد التنفيذ":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // الحالات التي تم تسليمها مؤخراً (احدث 4)
  const recentSubmissions = useMemo(() => {
    const sorted = [...cases].sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime());
    return sorted.slice(0, 4).map(c => ({
      doctor: doctors.find(d => d.id === c.doctor_id)?.name || "غير معروف",
      case: c.patient_name,
      date: c.submission_date ? new Date(c.submission_date).toLocaleDateString("en-GB") : "-",
      status: c.status,
    }));
  }, [cases, doctors]);

  // الفلترة حسب الطبيب المختار
  const filteredDoctorStats = useMemo(() => {
    if (selectedDoctorId === "all") return doctorStats;
    return doctorStats.filter(doc => doc.id === selectedDoctorId);
  }, [doctorStats, selectedDoctorId]);

  if (casesLoading || doctorsLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <span className="text-lg">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">سجل الأطباء</h1>
            <p className="text-gray-600">متابعة نشاط الأطباء وحالاتهم الحقيقية</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedDoctorId} onValueChange={val => setSelectedDoctorId(val as string)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="جميع الأطباء" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأطباء</SelectItem>
              {doctors.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* إحصائيات عامة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <DoctorStatsCard
            key={index}
            count={stat.count}
            label={stat.label}
            color={stat.color}
          />
        ))}
      </div>

      {/* الأطباء الأكثر نشاطًا وآخر التسليمات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MostActiveDoctors doctors={filteredDoctorStats} />
        <RecentSubmissions submissions={recentSubmissions} getStatusColor={getStatusColor} />
      </div>

      {/* السجل المفصل */}
      <DoctorDetailedLog doctors={filteredDoctorStats} getStatusColor={getStatusColor} />
    </div>
  );
};

export default DoctorsLog;
