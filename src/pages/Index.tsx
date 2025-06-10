
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Receipt,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "إجمالي الحالات",
      value: "248",
      change: "+12%",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "الأطباء النشطون",
      value: "15",
      change: "+2",
      icon: UserPlus,
      color: "text-green-600",
    },
    {
      title: "الإيرادات الشهرية",
      value: "125,000 ر.س",
      change: "+8%",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "الحالات الجارية",
      value: "32",
      change: "+5",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  const quickActions = [
    {
      title: "إضافة حالة جديدة",
      description: "تسجيل حالة جديدة للمريض",
      icon: FileText,
      action: () => navigate("/cases"),
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "إدارة الحسابات",
      description: "عرض وإدارة حسابات الشراكة",
      icon: Users,
      action: () => navigate("/partnership-accounts"),
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "تسجيل مصروف",
      description: "إضافة مصروف جديد للمختبر",
      icon: Receipt,
      action: () => navigate("/expenses"),
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "سجل الأطباء",
      description: "مراجعة نشاط الأطباء",
      icon: UserPlus,
      action: () => navigate("/doctors-log"),
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          مرحباً بك في نظام إدارة مختبر الأسنان
        </h1>
        <p className="text-gray-600">
          10 يونيو 2025 - لوحة التحكم الرئيسية
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="animate-slide-up hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.color} flex items-center gap-1`}>
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            الإجراءات السريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white h-auto p-6 flex flex-col items-center gap-3 hover:scale-105 transition-transform`}
              >
                <action.icon className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">حالة جديدة - زيركون</p>
                  <p className="text-xs text-gray-500">د. أحمد محمد - منذ ساعتين</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">تم تسليم الحالة A23</p>
                  <p className="text-xs text-gray-500">د. سارة عبدالعزيز - منذ 4 ساعات</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">دفعة جديدة - 5000 ر.س</p>
                  <p className="text-xs text-gray-500">د. خالد العمري - أمس</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              ملخص الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">معدل إنجاز الحالات</span>
                <span className="text-lg font-bold text-green-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">رضا العملاء</span>
                <span className="text-lg font-bold text-blue-600">96%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "96%" }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">الوقت المتوسط للإنجاز</span>
                <span className="text-lg font-bold text-purple-600">3.2 أيام</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
