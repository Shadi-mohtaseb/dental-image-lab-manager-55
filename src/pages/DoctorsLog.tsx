
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Calendar } from "lucide-react";
import { useDoctors } from "@/hooks/useDoctors";
import { useCases } from "@/hooks/useCases";
import { useState } from "react";

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
    const complete = cases.filter(c => c.status === "تم التسليم" || c.status === "مكتمل").length;
    const inProgress = cases.filter(c => c.status === "قيد التنفيذ").length;
    const temp = cases.filter(c => c.work_type === "مؤقتة").length;
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
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.count}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* الأطباء الأكثر نشاطًا */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              الأطباء الأكثر نشاطاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDoctorStats.slice(0, 3).map((doctor, index) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {doctor.name?.split(' ')[1]?.[0] || doctor.name[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{doctor.name}</div>
                      <div className="text-sm text-gray-500">
                        {doctor.caseCount} حالة هذا الشهر
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {doctor.caseCount} حالة
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* آخر التسليمات */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              آخر التسليمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.map((submission, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-semibold">{submission.doctor}</div>
                    <div className="text-sm text-gray-500">
                      {submission.case} - آخر زيارة {submission.date}
                    </div>
                  </div>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* السجل المفصل */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المرضى حسب الطبيب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDoctorStats.map((doctor) => (
              <div key={doctor.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-primary">{doctor.name}</h3>
                  <Badge variant="outline">
                    {doctor.caseCount} زيارة
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {doctor.recentCases.length === 0 ? (
                    <div className="col-span-3 text-gray-400 text-center">لا يوجد حالات حديثة لهذا الطبيب</div>
                  ) : (
                    doctor.recentCases.map((case1, caseIndex) => (
                      <div key={caseIndex} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">تاريخ الزيارة</div>
                        <div className="font-semibold">{case1.date ? new Date(case1.date).toLocaleDateString("en-GB") : "-"}</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm">المريض: {case1.patient}</span>
                          <Badge className={getStatusColor(case1.status)} variant="outline">
                            {case1.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorsLog;
