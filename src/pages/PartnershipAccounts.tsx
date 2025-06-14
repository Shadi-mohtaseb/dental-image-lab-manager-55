import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { usePartners } from "@/hooks/usePartners";
import { toast } from "@/hooks/use-toast";

const PartnershipAccounts = () => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const { data: partners = [], isLoading, refetch } = usePartners();

  // عمليات السحب (حذف شريك)
  const handleDeletePartner = async (partnerId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الشريك؟")) {
      // حذف عبر Supabase
      const { error } = await import("@/integrations/supabase/client").then(({ supabase }) =>
        supabase.from("partners").delete().eq("id", partnerId)
      );
      if (!error) {
        refetch?.();
        toast({
          title: "تم حذف الشريك",
          description: "تم حذف الشريك بنجاح",
        });
      } else {
        toast({
          title: "خطأ في حذف الشريك",
          description: "حدث خطأ يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    }
  };

  // بيانات المعاملات مثال ثابت مؤقت: بإمكانك ربطها بجدول معاملات الشركاء الحقيقي لاحقًا
  const transactions = [
    {
      id: 1,
      date: "2025-06-10",
      partner: partners[0]?.name ?? "-",
      type: "إيداع",
      amount: "15000",
      description: "أرباح الشهر",
    },
    {
      id: 2,
      date: "2025-06-08",
      partner: partners[1]?.name ?? "-",
      type: "سحب",
      amount: "8000",
      description: "سحب أرباح",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">حسابات الشراكة</h1>
            <p className="text-gray-600">إدارة حسابات الشركاء والمعاملات المالية</p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddTransaction(!showAddTransaction)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة معاملة
        </Button>
      </div>

      {/* Partners Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((partner, index) => (
          <Card key={partner.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{partner.name}</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  نشط
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">النسبة:</span>
                  <span className="font-semibold text-primary">{partner.partnership_percentage?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الرصيد الحالي:</span>
                  <span className="font-bold text-2xl text-gray-900">{Number(partner.total_amount).toFixed(2)} ₪</span>
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end p-2">
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeletePartner(partner.id)}>
                <Trash2 className="w-4 h-4" /> حذف
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Transaction Form */}
      {showAddTransaction && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>إضافة معاملة مالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partner">الشريك</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الشريك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner1">الشريك الأول</SelectItem>
                    <SelectItem value="partner2">الشريك الثاني</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">نوع المعاملة</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="نوع المعاملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">إيداع</SelectItem>
                    <SelectItem value="withdraw">سحب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">المبلغ</Label>
                <Input placeholder="أدخل المبلغ" />
              </div>
              <div>
                <Label htmlFor="date">التاريخ</Label>
                <Input type="date" defaultValue="2025-06-10" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">الوصف</Label>
                <Input placeholder="أدخل وصف المعاملة" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button className="bg-primary hover:bg-primary/90">
                إضافة المعاملة
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddTransaction(false)}
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المعاملات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الشريك</TableHead>
                <TableHead>نوع المعاملة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.partner}</TableCell>
                  <TableCell>
                    <Badge
                      variant={transaction.type === "إيداع" ? "default" : "destructive"}
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {transaction.amount} ₪
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
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

export default PartnershipAccounts;
