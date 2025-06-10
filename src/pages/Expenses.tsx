
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

const Expenses = () => {
  const [showAddExpense, setShowAddExpense] = useState(false);

  const totalExpenses = "2550 ر.س";

  const expenses = [
    {
      id: 1,
      date: "2025-05-15",
      item: "زيركون",
      description: "مواد خام",
      quantity: "5",
      unitPrice: "200 ر.س",
      total: "1000 ر.س",
    },
    {
      id: 2,
      date: "2025-05-20",
      item: "مادة طبع",
      description: "مواد استهلاكية",
      quantity: "3",
      unitPrice: "150 ر.س",
      total: "450 ر.س",
    },
    {
      id: 3,
      date: "2025-06-01",
      item: "أدوات حفر",
      description: "أدوات العمل",
      quantity: "10",
      unitPrice: "50 ر.س",
      total: "500 ر.س",
    },
    {
      id: 4,
      date: "2025-06-05",
      item: "مواد تنظيف",
      description: "مواد نظافة وتعقيم",
      quantity: "2",
      unitPrice: "300 ر.س",
      total: "600 ر.س",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة مصاريف المختبر</h1>
            <p className="text-gray-600">تتبع وإدارة جميع مصاريف المختبر</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddExpense(!showAddExpense)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة مصروف جديد
        </Button>
      </div>

      {/* Total Expenses */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">إجمالي المصاريف</h3>
          <p className="text-3xl font-bold">{totalExpenses}</p>
        </CardContent>
      </Card>

      {/* Add Expense Form */}
      {showAddExpense && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>إضافة مصروف جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item">اسم المادة</Label>
                <Input placeholder="أدخل اسم المادة" />
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input placeholder="السعر" />
              </div>
              <div>
                <Label htmlFor="quantity">الكمية</Label>
                <Input placeholder="الكمية" />
              </div>
              <div>
                <Label htmlFor="date">تاريخ الشراء</Label>
                <Input type="date" defaultValue="2025-06-10" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Input placeholder="أدخل أي ملاحظات إضافية" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button className="bg-primary hover:bg-primary/90">
                إضافة المصروف
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddExpense(false)}
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المصاريف</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المادة</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>تاريخ الشراء</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-semibold">{expense.item}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.unitPrice}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.quantity}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {expense.total}
                  </TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
