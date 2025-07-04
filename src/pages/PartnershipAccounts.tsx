import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2, DollarSign, Calculator, Wallet, ArrowUp, ArrowDown } from "lucide-react";
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
import { useDoctors } from "@/hooks/useDoctors";
import { useCases } from "@/hooks/useCases";
import PartnershipFinancialSummaryCards from "@/components/PartnershipFinancialSummaryCards";
import { useExpenses } from "@/hooks/useExpenses";
import PartnerActionHeaderSection from "@/components/PartnerActionHeaderSection";
import PartnerListSection from "@/components/PartnerListSection";
import PartnerTransactionsTableSection from "@/components/PartnerTransactionsTableSection";

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
  const { data: expenses = [] } = useExpenses();

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

  const { data: summary, isLoading: loadingSummary } = useFinancialSummary();
  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const netProfit = summary?.netProfit ?? 0;
  const partnersCount = partners.length;

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
      {/* بطاقات الملخص المالي الرئيسية: أصبحت مكون منفصل */}
      <PartnershipFinancialSummaryCards
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        totalDoctorsDebt={totalDoctorsDebt}
        partnersCount={partnersCount}
        casesCount={cases.length}
        expensesCount={expenses?.length ?? 0}
      />

      {/* 2- إدارة الشركاء */}
      <section>
        <PartnerActionHeaderSection />
        <PartnerListSection
          partners={partners}
          onWithdraw={handleWithdraw}
          onDelete={handleDeletePartner}
          onWithdrawShare={handleWithdrawShare}
          getPartnerStats={getPartnerStats}
        />
      </section>

      {/* 3- عمليات السحب و المعاملات */}
      <PartnerTransactionsTableSection
        transactions={transactions}
        partners={partners}
        showAddTransaction={showAddTransaction}
        setShowAddTransaction={setShowAddTransaction}
        handleEditTx={handleEditTx}
        handleDeleteTransaction={handleDeleteTransaction}
      />

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
    </div>
  );
};

export default PartnershipAccounts;
// ملاحظة: هذا الملف أصبح كبيرًا جدًا. أنصحك الآن بطلب إعادة تقسيم الملف إلى أجزاء أصغر.
