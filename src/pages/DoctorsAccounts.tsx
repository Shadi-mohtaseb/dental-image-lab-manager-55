
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

const DoctorsAccounts = () => {
  const [showAddPayment, setShowAddPayment] = useState(false);

  const doctorsStats = [
    {
      title: "إجمالي المستحقات",
      amount: "15000 ر.س",
      color: "text-blue-600",
    },
    {
      title: "المدفوعات",
      amount: "8000 ر.س",
      color: "text-green-600",
    },
    {
      title: "الرصيد المتبقي",
      amount: "7000 ر.س",
      color: "text-purple-600",
    },
  ];

  const payments = [
    {
      id: 1,
      date: "2025-06-01",
      doctor: "د. أحمد محمد",
      type: "نقدي",
      amount: "3000",
      status: "مؤكد",
      reference: "-",
    },
    {
      id: 2,
      date: "2025-06-05",
      doctor: "د. سارة عبدالعزيز",
      type: "شيك",
      amount: "5000",
      status: "معلق",
      reference: "123456",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">حسابات الأطباء</h1>
            <p className="text-gray-600">إدارة حسابات الأطباء والمدفوعات</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddPayment(!showAddPayment)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة دفعة جديدة
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {doctorsStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.title}</h3>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.amount}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Payment Form */}
      {showAddPayment && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>إضافة دفعة جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor">اختر الطبيب</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطبيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahmed">د. أحمد محمد</SelectItem>
                    <SelectItem value="sara">د. سارة عبدالعزيز</SelectItem>
                    <SelectItem value="khalid">د. خالد العمري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">نوع الدفعة</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="نوع الدفعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">المبلغ</Label>
                <Input placeholder="أدخل المبلغ" />
              </div>
              <div>
                <Label htmlFor="reference">رقم الشيك (اختياري)</Label>
                <Input placeholder="رقم الشيك" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Input placeholder="أدخل أي ملاحظات إضافية" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button className="bg-primary hover:bg-primary/90">
                إضافة الدفعة
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddPayment(false)}
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments History */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>اسم الطبيب</TableHead>
                <TableHead>نوع الدفعة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>رقم الشيك</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.doctor}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.type}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {payment.amount} ر.س
                  </TableCell>
                  <TableCell>{payment.reference}</TableCell>
                  <TableCell>
                    <Badge
                      variant={payment.status === "مؤكد" ? "default" : "secondary"}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
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

export default DoctorsAccounts;
