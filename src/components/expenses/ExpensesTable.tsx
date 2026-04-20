import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Trash2 } from "lucide-react";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { useDeleteExpense } from "@/hooks/useExpenses";
import { SortableHeader, SortDirection } from "@/components/ui/sortable-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExpensesTableProps {
  expenses: any[];
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  const deleteExpense = useDeleteExpense();
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const sortedExpenses = useMemo(() => {
    if (!sortDir) return expenses;
    return [...expenses].sort((a, b) => {
      const da = new Date(a.purchase_date || 0).getTime();
      const db = new Date(b.purchase_date || 0).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });
  }, [expenses, sortDir]);

  const toggleSort = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteExpense.mutateAsync(expenseId);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };
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
                <TableHead>
                  <SortableHeader label="التاريخ" active={!!sortDir} direction={sortDir} onClick={toggleSort} />
                </TableHead>
                <TableHead>نوع المصروف</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>ملاحظات</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExpenses.map((expense) => (
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
                  <TableCell>
                    <div className="flex items-center gap-2 justify-center">
                      <EditExpenseDialog expense={expense} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا المصروف؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(expense.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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