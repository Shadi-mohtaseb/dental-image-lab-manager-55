
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2, DollarSign, Calculator, Wallet } from "lucide-react";
import { useState } from "react";
import { usePartners } from "@/hooks/usePartners";
import { toast } from "@/hooks/use-toast";
import { usePartnerTransactions, useAddPartnerTransaction, useDeletePartnerTransaction } from "@/hooks/usePartnerTransactions";
import { useCompanyCapital, useCalculateCompanyCapital, useDistributeProfits } from "@/hooks/useCompanyCapital";
import EditPartnerTransactionDialog from "@/components/EditPartnerTransactionDialog";
import AddPartnerDialog from "@/components/AddPartnerDialog";
import WithdrawFromPersonalBalanceDialog from "@/components/WithdrawFromPersonalBalanceDialog";

const PartnershipAccounts = () => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editTxOpen, setEditTxOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const { data: partners = [], isLoading: loadingPartners } = usePartners();
  const { data: transactions = [], isLoading: loadingTx } = usePartnerTransactions();
  const { data: companyCapital } = useCompanyCapital();
  const addTx = useAddPartnerTransaction();
  const deleteTx = useDeletePartnerTransaction();
  const calculateCapital = useCalculateCompanyCapital();
  const distributeProfits = useDistributeProfits();

  const handleDeletePartner = async (partnerId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الشريك؟")) {
      const { error } = await import("@/integrations/supabase/client").then(({ supabase }) =>
        supabase.from("partners").delete().eq("id", partnerId)
      );
      if (!error) {
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
      toast({ title: "يرجى تعبئة كل الحقول المطلوبة", variant: "destructive" }); 
      return;
    }

    await addTx.mutateAsync({
      partner_id: partnerId,
      amount,
      transaction_type: type,
      transaction_date: date,
      description: desc,
      transaction_source: "manual",
    });

    setShowAddTransaction(false);
    form.reset();
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المعاملة؟")) {
      await deleteTx.mutateAsync(id);
    }
  };

  const handleEditTx = (tx: any) => {
    setSelectedTx(tx);
    setEditTxOpen(true);
  };

  const handleWithdraw = (partner: any) => {
    setSelectedPartner(partner);
    setWithdrawOpen(true);
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
        <div className="flex gap-2">
          <AddPartnerDialog />
          <Button
            onClick={() => setShowAddTransaction(!showAddTransaction)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة معاملة
          </Button>
        </div>
      </div>

      {/* Company Capital Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">رأس المال الإجمالي</p>
                <p className="text-2xl font-bold">{(companyCapital?.total_capital || 0).toFixed(2)} ₪</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <Button 
              onClick={() => calculateCapital.mutate()}
              disabled={calculateCapital.isPending}
              className="w-full"
            >
              <Calculator className="w-4 h-4 ml-2" />
              {calculateCapital.isPending ? "جاري الحساب..." : "إعادة حساب رأس المال"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Button 
              onClick={() => distributeProfits.mutate()}
              disabled={distributeProfits.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Users className="w-4 h-4 ml-2" />
              {distributeProfits.isPending ? "جاري التوزيع..." : "توزيع الأرباح"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Partners Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((partner) => (
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
                  <span className="text-gray-600">الرصيد الإجمالي:</span>
                  <span className="font-bold text-2xl text-gray-900">{Number(partner.total_amount).toFixed(2)} ₪</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">الرصيد الشخصي:</span>
                  <span className="font-semibold text-green-600">{Number(partner.personal_balance || 0).toFixed(2)} ₪</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-blue-600 flex-1"
                    onClick={() => handleWithdraw(partner)}
                    disabled={!partner.personal_balance || partner.personal_balance <= 0}
                  >
                    <Wallet className="w-4 h-4 ml-1" /> سحب
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600" 
                    onClick={() => handleDeletePartner(partner.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
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
                <TableHead>المصدر</TableHead>
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
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.transaction_source === "personal_withdrawal" ? "سحب شخصي" : 
                         transaction.transaction_source === "case_profit" ? "ربح حالة" : "يدوي"}
                      </Badge>
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

      {/* Dialogs */}
      <EditPartnerTransactionDialog
        open={editTxOpen}
        onOpenChange={(open) => {
          setEditTxOpen(open);
          if (!open) setSelectedTx(null);
        }}
        partners={partners}
        initialData={selectedTx}
      />

      <WithdrawFromPersonalBalanceDialog
        open={withdrawOpen}
        onOpenChange={(open) => {
          setWithdrawOpen(open);
          if (!open) setSelectedPartner(null);
        }}
        partner={selectedPartner}
      />
    </div>
  );
};

export default PartnershipAccounts;
