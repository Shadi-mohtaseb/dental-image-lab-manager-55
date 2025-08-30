import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  DollarSign, 
  Activity,
  Calculator
} from "lucide-react";

interface DoctorSummaryCardsProps {
  totalCases: number;
  totalPayments: number;
  totalTeeth: number;
  remainingBalance: number;
}

export function DoctorSummaryCards({
  totalCases,
  totalPayments,
  totalTeeth,
  remainingBalance
}: DoctorSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الحالات</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{totalCases}</div>
          <p className="text-xs text-muted-foreground">حالة</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {totalPayments.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">ريال سعودي</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الأسنان</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalTeeth}</div>
          <p className="text-xs text-muted-foreground">سن</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الرصيد المتبقي</CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {Math.abs(remainingBalance).toFixed(2)}
          </div>
          <Badge variant={remainingBalance > 0 ? "destructive" : "default"}>
            {remainingBalance > 0 ? "مديون" : "مسدد"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}