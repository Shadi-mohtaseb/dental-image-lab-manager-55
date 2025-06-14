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
import { useCases } from "@/hooks/useCases";
import { useDoctors } from "@/hooks/useDoctors";
import { useExpenses } from "@/hooks/useExpenses";
import { usePartners } from "@/hooks/usePartners";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";

const Index = () => {
  const navigate = useNavigate();
  const { data: cases = [] } = useCases();
  const { data: doctors = [] } = useDoctors();
  const { data: expenses = [] } = useExpenses();
  const { data: partners = [] } = usePartners();
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();

  // Use the new summary everywhere
  const totalCases = cases.length;
  const activeDoctors = doctors.length;
  const activePartners = partners.length;
  const inProgressCases = cases.filter(c => c.status === 'قيد التنفيذ').length;
  const totalRevenue = summary?.totalRevenue || 0;
  const monthlyExpenses = summary?.totalExpenses || 0;
  const netProfit = summary?.netProfit || 0;

  const stats = [
    {
      title: "صافي الربح (رأس المال)",
      value: `${netProfit.toFixed(0)} ₪`,
      change: netProfit > 0 ? `ربح صافي` : "لا يوجد ربح",
      icon: DollarSign,
      color: netProfit > 0 ? "text-green-600" : "text-gray-600",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${totalRevenue.toFixed(0)} ₪`,
      change: `من ${totalCases} حالة`,
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "إجمالي المصاريف",
      value: `${monthlyExpenses.toFixed(0)} ₪`,
      change: `${expenses.length} مصروف`,
      icon: Receipt,
      color: "text-red-600",
    },
    {
      title: "عدد الشركاء",
      value: activePartners.toString(),
      change: `${activePartners} شريك نشط`,
      icon: Users,
      color: "text-purple-600",
    },
  ];

  // إجراءات سريعة
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

  // آخر النشاطات المترابطة
  const recentCases = cases.slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          مرحباً بك في نظام إدارة مختبر الأسنان
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('ar-SA')} - لوحة التحكم الرئيسية
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

      {/* Recent Activity & Financial Summary */}
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
              {recentCases.length > 0 ? (
                recentCases.map((caseItem) => (
                  <div key={caseItem.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">
                        حالة جديدة - {caseItem.work_type} - {caseItem.patient_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {caseItem.doctor?.name || 'غير محدد'} - رقم الحالة: {caseItem.case_number}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد حالات حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              ملخص الأداء المالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-gray-600">صافي الربح (رأس المال)</span>
                <span className={`text-lg font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netProfit.toFixed(2)} ₪
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">إجمالي الإيرادات</span>
                <span className="text-lg font-bold text-blue-600">{totalRevenue.toFixed(2)} ₪</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">إجمالي المصاريف</span>
                <span className="text-lg font-bold text-red-600">{monthlyExpenses.toFixed(2)} ₪</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">عدد الشركاء</span>
                <span className="text-lg font-bold text-purple-600">{activePartners}</span>
              </div>

              {partners.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">توزيع الأرباح:</p>
                  {partners.map((partner, index) => (
                    <div key={partner.id} className="flex justify-between text-sm">
                      <span>{partner.name}</span>
                      <span className="font-semibold">
                        {partner.partnership_percentage?.toFixed(1)}% = {Number(partner.total_amount).toFixed(2)} ₪
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
