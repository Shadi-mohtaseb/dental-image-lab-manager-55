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
import { usePartnerTransactions, useAddPartnerTransaction, useDeletePartnerTransaction } from "@/hooks/usePartnerTransactions";
import EditPartnerTransactionDialog from "@/components/EditPartnerTransactionDialog";

const PartnershipAccounts = () => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editTxOpen, setEditTxOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const { data: partners = [], isLoading: loadingPartners } = usePartners();
  const { data: transactions = [], isLoading: loadingTx } = usePartnerTransactions();
  const addTx = useAddPartnerTransaction();
  const deleteTx = useDeletePartnerTransaction();

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

  // إضافة معاملة، وتوزيع مبلغ الإيداع أو السحب على جميع الشركاء (ثلث لكل شريك)
  const handleAddTransaction = async (e: any) => {
    e.preventDefault();
    const form = e.target;
    const partnerId = form.partner.value;
    const type = form.type.value;
    const amountRaw = form.amount.value;
    const date = form.date.value;
    const desc = form.description.value;
    const amount = Number(amountRaw);

    if (!partnerId || !type || !amount || !date) {
      toast({ title: "يرجى تعبئة كل الحقول المطلوبة", variant: "destructive" }); return;
    }

    // إدراج معاملة رئيسية
    await addTx.mutateAsync({
      partner_id: partnerId,
      amount,
      transaction_type: type,
      transaction_date: date,
      description: desc,
    });

    // توزيع مبلغ الإيداع أو السحب على جميع الشركاء بنسبة الثلث (أو بالتساوي)
    if (type === "deposit" || type === "withdraw") {
      const otherPartners = partners.filter(p => p.id !== partnerId);
      const partnersToAffect = [partnerId, ...otherPartners.slice(0, 2)];
      const distributedAmount = amount / 3;
      for (let pid of partnersToAffect) {
        // لا تضيف للمعاملة الأصلية مرتين
        if (pid === partnerId) continue;
        await addTx.mutateAsync({
          partner_id: pid,
          amount: distributedAmount,
          transaction_type: type,
          transaction_date: date,
          description: `[توزيع تلقائي] ${desc || ""}`,
        });
      }
    }

    setShowAddTransaction(false);
    form.reset();
  };

  // الحذف
  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المعاملة؟")) {
      await deleteTx.mutateAsync(id);
    }
  };

  // فتح التعديل
  const handleEditTx = (tx: any) => {
    setSelectedTx(tx);
    setEditTxOpen(true);
  };

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
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddTransaction}>
              <div>
                <Label htmlFor="partner">الشريك</Label>
                <Select name="partner" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الشريك" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">نوع المعاملة</Label>
                <Select name="type" required>
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
                <Input name="amount" placeholder="أدخل المبلغ" type="number" min="0" step="any" required />
              </div>
              <div>
                <Label htmlFor="date">التاريخ</Label>
                <Input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">الوصف</Label>
                <Input name="description" placeholder="أدخل وصف المعاملة" />
              </div>
              <div className="flex gap-3 mt-6 md:col-span-2">
                <Button className="bg-primary hover:bg-primary/90" type="submit">
                  إضافة المعاملة
                </Button>
                <Button variant="outline" onClick={() => setShowAddTransaction(false)} type="button">
                  إلغاء
                </Button>
              </div>
            </form>
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
              {(transactions ?? []).map((transaction) => {
                const partner = partners.find((p) => p.id === transaction.partner_id);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.transaction_date}</TableCell>
                    <TableCell>{partner?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.transaction_type === "deposit" ? "default" : "destructive"}>
                        {transaction.transaction_type === "deposit" ? "إيداع" : "سحب"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {Number(transaction.amount).toFixed(2)} ₪
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditTx(transaction)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600"
                          onClick={() => handleDeleteTransaction(transaction.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* نافذة التعديل */}
      <EditPartnerTransactionDialog
        open={editTxOpen}
        onOpenChange={(open) => {
          setEditTxOpen(open);
          if (!open) setSelectedTx(null);
        }}
        partners={partners}
        initialData={selectedTx}
      />
    </div>
  );
};

export default PartnershipAccounts;
