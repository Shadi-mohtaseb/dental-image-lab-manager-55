
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Calendar } from "lucide-react";

const DoctorsLog = () => {
  const stats = [
    { count: 5, label: "حالات متكملة", color: "text-green-600" },
    { count: 7, label: "حالات قيد التنفيذ", color: "text-blue-600" },
    { count: 4, label: "حالات مؤقتة", color: "text-yellow-600" },
    { count: 8, label: "حالات زيركون", color: "text-purple-600" },
    { count: 12, label: "إجمالي الحالات", color: "text-gray-600" },
  ];

  const doctors = [
    {
      name: "د. أحمد محمد",
      cases: [
        { date: "2025-06-12", count: 5, status: "جديد" },
        { date: "2025-06-13", count: 3, status: "مكتمل" },
        { date: "2025-06-15", count: 2, status: "قيد التنفيذ" },
      ],
    },
    {
      name: "د. سارة عبدالعزيز",
      cases: [
        { date: "2025-06-08", count: 2, status: "مكتمل" },
        { date: "2025-06-09", count: 4, status: "قيد التنفيذ" },
        { date: "2025-06-15", count: 1, status: "جديد" },
      ],
    },
    {
      name: "د. خالد العمري",
      cases: [
        { date: "2025-06-01", count: 1, status: "مكتمل" },
        { date: "2025-06-09", count: 2, status: "قيد التنفيذ" },
        { date: "2025-06-15", count: 4, status: "جديد" },
      ],
    },
  ];

  const recentSubmissions = [
    {
      doctor: "د. أحمد محمد",
      case: "حالة 1",
      date: "01-06-2025",
      status: "جديد",
    },
    {
      doctor: "د. سارة عبدالعزيز",
      case: "حالة 2",
      date: "08-06-2025",
      status: "مكتمل",
    },
    {
      doctor: "د. خالد العمري",
      case: "حالة 3",
      date: "05-06-2025",
      status: "قيد التنفيذ",
    },
    {
      doctor: "د. نوى السلام",
      case: "حالة 4",
      date: "28-05-2025",
      status: "مكتمل",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "جديد":
        return "bg-blue-100 text-blue-700";
      case "مكتمل":
        return "bg-green-100 text-green-700";
      case "قيد التنفيذ":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">سجل الأطباء</h1>
            <p className="text-gray-600">متابعة نشاط الأطباء وحالاتهم</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="جميع الأطباء" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأطباء</SelectItem>
              <SelectItem value="ahmed">د. أحمد محمد</SelectItem>
              <SelectItem value="sara">د. سارة عبدالعزيز</SelectItem>
              <SelectItem value="khalid">د. خالد العمري</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="doctor">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="اختر الطبيب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doctor">اختر الطبيب</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
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

      {/* Doctors' Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Doctors */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              الأطباء الأكثر نشاطاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {doctors.slice(0, 3).map((doctor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {doctor.name.split(' ')[1][0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{doctor.name}</div>
                      <div className="text-sm text-gray-500">
                        {doctor.cases.length} حالة هذا الشهر
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {doctor.cases.reduce((sum, case1) => sum + case1.count, 0)} حالة
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
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

      {/* Detailed Log */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المرضى</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doctors.map((doctor, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-primary">{doctor.name}</h3>
                  <Badge variant="outline">
                    {doctor.cases.length} زيارة
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {doctor.cases.map((case1, caseIndex) => (
                    <div key={caseIndex} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">تاريخ الزيارة</div>
                      <div className="font-semibold">{case1.date}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">عدد الحالات: {case1.count}</span>
                        <Badge className={getStatusColor(case1.status)} variant="outline">
                          {case1.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
