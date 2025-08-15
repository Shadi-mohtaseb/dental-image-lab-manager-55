import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ar } from "date-fns/locale";

interface ExpensesSummaryCardsProps {
  expenses: any[];
}

export function ExpensesSummaryCards({ expenses }: ExpensesSummaryCardsProps) {
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // حساب إجمالي المصاريف لهذا الشهر
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.purchase_date);
    return expenseDate >= monthStart && expenseDate <= monthEnd;
  });

  const totalCurrentMonth = currentMonthExpenses.reduce((sum, expense) => sum + expense.total_amount, 0);

  // أعلى بند صرف لهذا الشهر
  const highestExpense = currentMonthExpenses.reduce((max, expense) => 
    expense.total_amount > (max?.total_amount || 0) ? expense : max
  , null);

  const currentMonthName = format(currentDate, "MMMM yyyy", { locale: ar });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            إجمالي مصاريف {currentMonthName}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {totalCurrentMonth.toLocaleString()} ₪
          </div>
          <p className="text-xs text-muted-foreground">
            {currentMonthExpenses.length} عملية شراء
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            أعلى بند صرف هذا الشهر
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {highestExpense ? `${highestExpense.total_amount.toLocaleString()} ₪` : "0 ₪"}
          </div>
          <p className="text-xs text-muted-foreground">
            {highestExpense ? highestExpense.expense_types?.name || "غير محدد" : "لا توجد مصاريف"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}