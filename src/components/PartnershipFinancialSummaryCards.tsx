
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Wallet, DollarSign, Users } from "lucide-react";

interface PartnershipFinancialSummaryCardsProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalDoctorsDebt: number;
  partnersCount: number;
  casesCount: number;
  expensesCount: number;
}
export default function PartnershipFinancialSummaryCards({
  totalRevenue,
  totalExpenses,
  netProfit,
  totalDoctorsDebt,
  partnersCount,
  casesCount,
  expensesCount
}: PartnershipFinancialSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <Card className="text-center">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <span className="flex items-center justify-center bg-blue-50 text-blue-500 rounded-full w-10 h-10 mb-2">
            <ArrowUp className="w-6 h-6" />
          </span>
          <span className="text-gray-500 text-sm">إجمالي الإيرادات</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{totalRevenue.toFixed(0)} ₪</span>
          <span className="text-xs text-blue-600 mt-1">من {casesCount} حالة</span>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <span className="flex items-center justify-center bg-red-50 text-red-500 rounded-full w-10 h-10 mb-2">
            <ArrowDown className="w-6 h-6" />
          </span>
          <span className="text-gray-500 text-sm">إجمالي المصاريف</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{totalExpenses.toFixed(0)} ₪</span>
          <span className="text-xs text-red-600 mt-1">{expensesCount} مصروف</span>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <span className="flex items-center justify-center bg-orange-50 text-orange-500 rounded-full w-10 h-10 mb-2">
            <Wallet className="w-6 h-6" />
          </span>
          <span className="text-gray-500 text-sm">إجمالي ديون الأطباء</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{totalDoctorsDebt.toFixed(0)} ₪</span>
          <span className="text-xs text-orange-600 mt-1">{totalDoctorsDebt > 0 ? "يجب تحصيلها" : "لا توجد ديون"}</span>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <span className="flex items-center justify-center bg-green-50 text-green-600 rounded-full w-10 h-10 mb-2">
            <DollarSign className="w-6 h-6" />
          </span>
          <span className="text-gray-500 text-sm">صافي الربح (رأس المال)</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{netProfit.toFixed(0)} ₪</span>
          <span className="text-xs text-green-600 mt-1">{netProfit > 0 ? "ربح صافي" : "لا يوجد ربح"}</span>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <span className="flex items-center justify-center bg-purple-50 text-purple-600 rounded-full w-10 h-10 mb-2">
            <Users className="w-6 h-6" />
          </span>
          <span className="text-gray-500 text-sm">عدد الشركاء</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{partnersCount}</span>
          <span className="text-xs text-purple-600 mt-1">{partnersCount} شريك نشط</span>
        </CardContent>
      </Card>
    </div>
  );
}
