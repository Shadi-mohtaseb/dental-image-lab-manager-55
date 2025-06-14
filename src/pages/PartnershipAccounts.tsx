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
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import WithdrawFromShareDialog from "@/components/WithdrawFromShareDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wallet } from "lucide-react";

const PartnershipAccounts = () => {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editTxOpen, setEditTxOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [withdrawShareOpen, setWithdrawShareOpen] = useState(false);
  const [selectedPartnerShare, setSelectedPartnerShare] = useState(null);

  const { data: partners = [], isLoading: loadingPartners } = usePartners();
  const { data: transactions = [], isLoading: loadingTx } = usePartnerTransactions();
  const addTx = useAddPartnerTransaction();
  const deleteTx = useDeletePartnerTransaction();
  const calculateCapital = useCalculateCompanyCapital();
  const distributeProfits = useDistributeProfits();

  const { data: doctors = [] } = useDoctors();
  const { data: cases = [] } = useCases();

  const { data: doctorTransactions = [] } = useQuery({
    queryKey: ['doctor_transactions'],
    queryFn: async () => {
      let { data, error } = await supabase
        .from("doctor_transactions")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  // احسب مجموع ديون الأطباء بنفس منطق الصفحة الرئيسية
  function computeDoctorsDebt() {
    const doctorsCases = doctors.reduce((acc, doc) => {
      const doctorCasesSum = cases
        .filter((c) => c.doctor_id === doc.id)
        .reduce((sum, c) => sum + (Number(c.price) || 0), 0);
      acc[doc.id] = doctorCasesSum;
      return acc;
    }, {} as Record<string, number>);

    const doctorsPaid = doctorTransactions.reduce((acc, tx) => {
      if (tx.doctor_id && tx.transaction_type === "دفعة") {
        acc[tx.doctor_id] = (acc[tx.doctor_id] || 0) + Number(tx.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    const doctorsDebtList = Object.keys(doctorsCases).map(doctorId => ({
      doctorId,
      debt: (doctorsCases[doctorId] || 0) - (doctorsPaid[doctorId] || 0),
    }));

    const totalDoctorsDebt = doctorsDebtList.reduce((sum, d) => sum + (d.debt > 0 ? d.debt : 0), 0);
    return totalDoctorsDebt;
  }

  const totalDoctorsDebt = computeDoctorsDebt();

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

  const handleWithdrawShare = (partner: any) => {
    setSelectedPartnerShare(partner);
    setWithdrawShareOpen(true);
  };

  const { data: summary, isLoading: loadingSummary } = useFinancialSummary();

  // استخدم 0 إذا لم تكن القيم متوفرة
  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const netProfit = summary?.netProfit ?? 0;

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

      {/* عرض مجموع ديون الأطباء */}
      <div className="bg-orange-50 p-4 rounded-lg flex items-center gap-3 border border-orange-200">
        <Wallet className="text-orange-600" />
        <span className="font-bold text-orange-800 text-lg">
          مجموع ديون الأطباء الحالية: {totalDoctorsDebt.toFixed(2)} ₪
        </span>
      </div>

      {/* 2- إدارة الشركاء */}
      <section>
        <div className="flex items-center justify-between mt-6 mb-2">
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
                onWithdrawShare={handleWithdrawShare}
              />
            );
          })}
        </div>
      </section>

      {/* 3- عمليات السحب و المعاملات */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
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
          />
        </div>
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
        <AddPartnerTransactionDialog open={showAddTransaction} onOpenChange={setShowAddTransaction} />
      </section>
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
      <WithdrawFromShareDialog
        open={withdrawShareOpen}
        onOpenChange={(open) => {
          setWithdrawShareOpen(open);
          if (!open) setSelectedPartnerShare(null);
        }}
        partner={selectedPartnerShare}
      />
      {/* يمكنك إضافة المزيد من إحصاءات المعاملات وأقسام ثانوية هنا لاحقاً */}
    </div>
  );
};

export default PartnershipAccounts;
// ملاحظة: هذا الملف أصبح كبيرًا جدًا. أنصحك الآن بطلب إعادة تقسيم الملف إلى أجزاء أصغر.
