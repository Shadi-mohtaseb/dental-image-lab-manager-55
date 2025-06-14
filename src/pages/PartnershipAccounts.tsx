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
import FinancialSummary from "@/components/FinancialSummary";
import PartnerCard from "@/components/PartnerCard";
import AddPartnerTransactionDialog from "@/components/AddPartnerTransactionDialog";

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

  // حساب إجمالي الإيرادات والمصاريف من الشركة وصافي الربح:
  // نفترض جلبهم من useCompanyCapital وقيمتهم (companyCapital?.total_capital)
  // سنضع قيم افتراضية لو لم تتوفر.
  const totalRevenue = companyCapital?.total_revenue ?? 0;
  const totalExpenses = companyCapital?.total_expenses ?? 0;
  const netProfit = companyCapital?.total_capital ?? 0;

  // حساب معاملات السحب لكل شريك
  function getPartnerStats(partner) {
    const partnerTxs = transactions.filter(
      (tx) => tx.partner_id === partner.id && tx.transaction_type === "withdraw"
    );
    const withdrawals = partnerTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const remaining_share = Number(partner.total_amount) - withdrawals;
    return {
      withdrawals,
      remaining_share,
    };
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1- قسم الملخص المالي */}
      <FinancialSummary
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
      />

      {/* 2- إدارة الشركاء */}
      <div className="flex items-center justify-between mt-6">
        <h1 className="text-2xl font-bold text-gray-900 flex gap-2 items-center">
          <Users className="w-7 h-7 text-primary" /> الشركاء
        </h1>
        <AddPartnerDialog />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {partners.map((partner) => {
          const stats = getPartnerStats(partner);
          return (
            <PartnerCard
              key={partner.id}
              partner={{
                ...partner,
                withdrawals: stats.withdrawals,
                remaining_share: stats.remaining_share,
              }}
              onWithdraw={handleWithdraw}
              onDelete={handleDeletePartner}
            />
          );
        })}
      </div>

      {/* 3- عمليات السحب و المعاملات */}
      <div className="flex items-center justify-between mt-10">
        <h2 className="text-xl font-bold text-gray-700 flex gap-1 items-center">سجل المعاملات</h2>
        {/* نموذج إضافة المعاملة في مودال منفصل */}
        <Button
          onClick={() => setShowAddTransaction(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 ml-1" />
          إضافة معاملة
        </Button>
      </div>
      {/* شريط بحث بسيط وفلاتر */}
      <div className="flex flex-col md:flex-row gap-4 mt-2">
        <Input
          placeholder="بحث عن شريك/وصف"
          className="w-full max-w-xs"
          // ...حفظ وتطبيق البحث في الحالة
        />
        {/* إمكانية إضافة مزيد من الفلاتر في المستقبل */}
      </div>
      {/* جدول المعاملات (محسن) */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>جدول المعاملات المالية</CardTitle>
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
      {/* حوار إضافة المعاملة */}
      <AddPartnerTransactionDialog open={showAddTransaction} onOpenChange={setShowAddTransaction} />

      {/* 4- واجهات تعديل عمليات السحب الحالية */}
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
      {/* يمكنك إضافة المزيد من إحصاءات المعاملات وأقسام ثانوية هنا لاحقاً */}
    </div>
  );
};

export default PartnershipAccounts;
// ملاحظة: هذا الملف أصبح كبيرًا جدًا. أنصحك الآن بطلب إعادة تقسيم الملف إلى أجزاء أصغر.
