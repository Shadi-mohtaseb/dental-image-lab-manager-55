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
  Wallet
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCases } from "@/hooks/useCases";
import { useDoctors } from "@/hooks/useDoctors";
import { useExpenses } from "@/hooks/useExpenses";
import { usePartners } from "@/hooks/usePartners";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { usePartnerTransactions } from "@/hooks/usePartnerTransactions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddCaseDialog } from "@/components/AddCaseDialog";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [addCaseDialogOpen, setAddCaseDialogOpen] = useState(false);
  
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

  // حساب مجموع ديون الأطباء (إجمالي الحالات - الدفعات)
  function computeDoctorsDebt() {
    const doctorsCases = doctors.reduce((acc, doc) => {
      const doctorCasesSum = cases
        .filter((c) => c.doctor_id === doc.id)
        .reduce((sum, c) => sum + (Number(c.price) || 0), 0);
      acc[doc.id] = doctorCasesSum;
      return acc;
    }, {} as Record<string, number>);

    const doctorsPaid = doctorTransactions.reduce((acc, tx) => {
      if (tx.doctor_id && tx.transaction_type === "دفعة") {
        acc[tx.doctor_id] = (acc[tx.doctor_id] || 0) + Number(tx.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    const doctorsDebtList = Object.keys(doctorsCases).map(doctorId => ({
      doctorId,
      debt: (doctorsCases[doctorId] || 0) - (doctorsPaid[doctorId] || 0),
    }));

    const totalDoctorsDebt = doctorsDebtList.reduce((sum, d) => sum + (d.debt > 0 ? d.debt : 0), 0);
    return totalDoctorsDebt;
  }

  const { data: doctorTransactions = [] } = useQuery({
    queryKey: ['doctor_transactions'],
    queryFn: async () => {
      let { data, error } = await supabase
        .from("doctor_transactions")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const totalDoctorsDebt = computeDoctorsDebt();

  const stats = [
    {
      title: "صافي الربح (رأس المال)",
      value: `${netProfit.toFixed(0)} ₪`,
      change: netProfit > 0 ? `ربح صافي` : "لا يوجد ربح",
      icon: DollarSign,
      color: netProfit > 0 ? "text-green-600" : "text-gray-600",
    },
    {
      title: "إجمالي ديون الأطباء",
      value: `${totalDoctorsDebt.toFixed(0)} ₪`,
      change: totalDoctorsDebt > 0 ? "يجب تحصيلها" : "لا توجد ديون",
      icon: Wallet,
      color: totalDoctorsDebt > 0 ? "text-orange-600" : "text-gray-600",
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

  // إجراءات سريعة - تم تحديث خلفية بطاقة إدارة الحسابات
  const quickActions = [
    {
      title: "إضافة حالة جديدة",
      description: "تسجيل حالة جديدة للمريض",
      icon: FileText,
      action: () => setAddCaseDialogOpen(true),
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "إدارة الحسابات",
      description: "عرض وإدارة حسابات الشراكة",
      icon: Users,
      action: () => navigate("/partnership-accounts"),
      color: "bg-green-500 hover:bg-green-600",
      backgroundImage: "/lovable-uploads/0cf8c4a4-9777-4faf-a046-2d9e762d3334.png",
    },
    {
      title: "تسجيل مصروف",
      description: "إضافة مصروف جديد للمختبر",
      icon: Receipt,
      action: () => navigate("/expenses"),
      color: "bg-purple-500 hover:bg-purple-600",
      backgroundImage: "/lovable-uploads/3421c3fe-329d-49e9-8ac1-db92d367c889.png",
    },
    {
      title: "سجل الأطباء",
      description: "مراجعة نشاط الأطباء",
      icon: UserPlus,
      action: () => navigate("/doctors-log"),
      color: "bg-orange-500 hover:bg-orange-600",
      backgroundImage: "/lovable-uploads/ab6ebe21-8447-4660-94c0-b863597b6faf.png",
    },
  ];

  // آخر النشاطات المترابطة
  const recentCases = cases.slice(0, 3);

  // --- تعديل التاريخ هنا: ---
  const todayGregorian = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  // إذا أردت عرضها بالعربي هندسيًا لكن مع أرقام إنجليزية:
  // const todayGregorian = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          مرحباً بك في نظام إدارة مختبر الأسنان
        </h1>
        <p className="text-gray-600">
          {todayGregorian} - لوحة التحكم الرئيسية
        </p>
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
                className={`${action.color} text-white h-auto p-6 flex flex-col items-center gap-3 hover:scale-105 transition-transform relative overflow-hidden`}
                style={action.backgroundImage ? {
                  backgroundImage: `url('${action.backgroundImage}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                } : {}}
              >
                {action.backgroundImage && (
                  <div className="absolute inset-0 bg-black/40 z-0"></div>
                )}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <action.icon className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm opacity-90">{action.description}</div>
                  </div>
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
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-right">رقم الحالة</th>
                        <th className="px-4 py-2 text-right">اسم المريض</th>
                        <th className="px-4 py-2 text-right">الطبيب</th>
                        <th className="px-4 py-2 text-right">نوع العمل</th>
                        <th className="px-4 py-2 text-right">التاريخ</th>
                        <th className="px-4 py-2 text-right">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCases.map((caseItem) => (
                        <tr key={caseItem.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">#{caseItem.id.slice(0, 8)}</td>
                          <td className="px-4 py-2">{caseItem.patient_name}</td>
                          <td className="px-4 py-2">{caseItem.doctor?.name || "غير محدد"}</td>
                          <td className="px-4 py-2">{caseItem.work_type}</td>
                          <td className="px-4 py-2">
                            {new Date(caseItem.created_at).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              caseItem.status === "تم التسليم" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {caseItem.status || "في الانتظار"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد حالات حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Case Dialog */}
      <AddCaseDialog />
    </div>
  );
};

export default Index;
