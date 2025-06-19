
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, Edit, Trash2, Search } from "lucide-react";
import { useExpenses, useDeleteExpense } from "@/hooks/useExpenses";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { ExpenseTypesDialog } from "@/components/expense-types/ExpenseTypesDialog";

const Expenses = () => {
  const {
    data: expenses = [],
    isLoading
  } = useExpenses();
  const deleteExpense = useDeleteExpense();
  const [searchTerm,setSearchTerm] = useState("");
  const [editExpenseOpen, setEditExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.total_amount), 0);
  
  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      await deleteExpense.mutateAsync(expenseId);
    }
  };
  
  const handleEditExpense = expense => {
    setSelectedExpense(expense);
    setEditExpenseOpen(true);
  };
  
  const filteredExpenses = expenses.filter(expense => expense.item_name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  if (isLoading) {
    return <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">جاري تحميل المصاريف...</div>
        </div>
      </div>;
  }
  
  return <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة مصاريف المختبر</h1>
            <p className="text-gray-600">تتبع وإدارة جميع مصاريف المختبر</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExpenseTypesDialog />
          <AddExpenseDialog />
        </div>
      </div>

      {/* Total Expenses */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6 text-center py-[67px]">
          <h3 className="text-lg font-semibold mb-2">إجمالي المصاريف</h3>
          <p className="text-3xl font-bold">{totalExpenses.toFixed(2)} ₪</p>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="بحث في المصاريف..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full" />
            </div>
            <Button variant="outline" className="gap-2">
              <Search className="w-4 h-4" />
              بحث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المصاريف ({filteredExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? <div className="text-center py-8 text-gray-500">
              {searchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا توجد مصاريف مسجلة حتى الآن"}
            </div> : <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم المادة</TableHead>
                  <TableHead className="text-right">نوع المصروف</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">الكمية</TableHead>
                  <TableHead className="text-right">الإجمالي</TableHead>
                  <TableHead className="text-right">تاريخ الشراء</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map(expense => <TableRow key={expense.id}>
                    <TableCell className="font-semibold">{expense.item_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{'expense_type' in expense ? (expense as any).expense_type || "عام" : "عام"}</Badge>
                    </TableCell>
                    <TableCell>{Number(expense.unit_price).toFixed(2)} ₪</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.quantity}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {Number(expense.total_amount).toFixed(2)} ₪
                    </TableCell>
                    <TableCell>{new Date(expense.purchase_date).toLocaleDateString('en-GB')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleEditExpense(expense)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteExpense(expense.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>}
        </CardContent>
      </Card>

      {/* نافذة التعديل */}
      <EditExpenseDialog open={editExpenseOpen} onOpenChange={open => {
      setEditExpenseOpen(open);
      if (!open) setSelectedExpense(null);
    }} expenseData={selectedExpense} />
    </div>;
};

export default Expenses;
