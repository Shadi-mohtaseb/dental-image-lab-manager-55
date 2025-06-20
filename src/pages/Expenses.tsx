
import { format } from "date-fns";
import { ar } from "date-fns/locale/ar";
import { Receipt, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/useExpenses";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { toast } from "@/hooks/use-toast";

// صفحة المصاريف
const Expenses = () => {
  const { data: expenses, isLoading, error } = useExpenses();

  // جلب أنواع المصاريف
  const { data: expenseTypes = [] } = useQuery({
    queryKey: ["expense_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_types" as any)
        .select("*")
        .order("name");
      if (error) {
        console.error("Error fetching expense types:", error);
        return [];
      }
      return data || [];
    },
  });

  // دالة للحصول على اسم نوع المصروف
  const getExpenseTypeName = (typeId: string) => {
    const type = expenseTypes.find((t: any) => t.id === typeId);
    return type?.name || "غير محدد";
  };

  const handleDelete = async (expenseId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      try {
        const { error } = await supabase
          .from("expenses")
          .delete()
          .eq("id", expenseId);

        if (error) {
          throw error;
        }

        toast({
          title: "تم حذف المصروف بنجاح",
          description: "تم حذف المصروف من النظام",
        });
      } catch (error: any) {
        console.error("Error deleting expense:", error);
        toast({
          title: "خطأ في حذف المصروف",
          description: "حدث خطأ أثناء حذف المصروف، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">جاري تحميل بيانات المصاريف...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg text-red-600">
            حدث خطأ أثناء تحميل بيانات المصاريف: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">المصاريف</h1>
            <p className="text-gray-600">إدارة وتسجيل المصاريف المختلفة</p>
          </div>
        </div>
        <AddExpenseDialog />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            قائمة المصاريف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>تاريخ الشراء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses?.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.description || expense.item_name}
                    </TableCell>
                    <TableCell>
                      {expense.quantity || 1}
                    </TableCell>
                    <TableCell className="text-red-600 font-bold">
                      {expense.total_amount.toLocaleString()} ₪
                    </TableCell>
                    <TableCell>
                      {format(new Date(expense.purchase_date), "dd/MM/yyyy", {
                        locale: ar,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <EditExpenseDialog expenseData={expense} />
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
