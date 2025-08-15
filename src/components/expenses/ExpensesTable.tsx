import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

interface ExpensesTableProps {
  expenses: any[];
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">لا توجد مصاريف مسجلة</p>
          <p className="text-sm text-muted-foreground">ابدأ بإضافة أول مصروف</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          قائمة المصاريف ({expenses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>نوع المصروف</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {format(new Date(expense.purchase_date), "dd/MM/yyyy", {
                      locale: ar,
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {expense.expense_types?.name || "غير محدد"}
                  </TableCell>
                  <TableCell className="text-red-600 font-bold">
                    {expense.total_amount.toLocaleString()} ₪
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {expense.notes || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}