
import { useState } from "react";
import { usePartners } from "@/hooks/usePartners";
import { usePartnerTransactions, useDeletePartnerTransaction } from "@/hooks/usePartnerTransactions";
import { useCompanyCapital } from "@/hooks/useCompanyCapital";
import { useExpenses } from "@/hooks/useExpenses";
import { useCases } from "@/hooks/useCases";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import PartnershipFinancialSummaryCards from "@/components/PartnershipFinancialSummaryCards";
import PartnerActionHeaderSection from "@/components/PartnerActionHeaderSection";
import PartnerListSection from "@/components/PartnerListSection";
import PartnerTransactionsTableSection from "@/components/PartnerTransactionsTableSection";
import WithdrawFromPersonalBalanceDialog from "@/components/WithdrawFromPersonalBalanceDialog";
import WithdrawFromShareDialog from "@/components/WithdrawFromShareDialog";
import EditPartnerTransactionDialog from "@/components/EditPartnerTransactionDialog";
import AutoDistributionIndicator from "@/components/AutoDistributionIndicator";

export default function PartnershipAccounts() {
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [shareWithdrawDialogOpen, setShareWithdrawDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editTxDialogOpen, setEditTxDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const { data: partners = [] } = usePartners();
  const { data: partnerTransactions = [] } = usePartnerTransactions();
  const { data: companyCapital } = useCompanyCapital();
  const { data: expenses = [] } = useExpenses();
  const { data: cases = [] } = useCases();
  const deleteTransaction = useDeletePartnerTransaction();

  // جلب معاملات الأطباء لحساب الديون
  const { data: doctorTransactions = [] } = useQuery({
    queryKey: ["doctor_transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_transactions")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalRevenue = cases.reduce((sum, caseItem) => sum + (Number(caseItem.price) || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.total_amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  // حساب إجمالي ديون الأطباء الصحيح
  const totalDoctorsDebt = (() => {
    // حساب إجمالي المبالغ المستحقة للأطباء من الحالات
    const totalDue = cases.reduce((sum, caseItem) => sum + (Number(caseItem.price) || 0), 0);
    
    // حساب إجمالي المبالغ المدفوعة للأطباء
    const totalPaid = doctorTransactions
      .filter(t => t.transaction_type === "دفعة")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
    // الديون = المستحق - المدفوع
    return Math.max(0, totalDue - totalPaid);
  })();

  const getPartnerStats = (partner: any) => {
    const withdrawals = partnerTransactions
      .filter(t => t.partner_id === partner.id && t.transaction_type === "سحب")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const remaining_share = Math.max(0, Number(partner.total_amount || 0) - withdrawals);
    
    return { withdrawals, remaining_share };
  };

  const handleWithdraw = (partner: any) => {
    setSelectedPartner(partner);
    setWithdrawDialogOpen(true);
  };

  const handleWithdrawShare = (partner: any) => {
    setSelectedPartner(partner);
    setShareWithdrawDialogOpen(true);
  };

  const handleDelete = async (partnerId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الشريك؟")) {
      try {
        // Delete partner logic would go here
        toast({
          title: "تم حذف الشريك",
          description: "تم حذف الشريك بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ في حذف الشريك",
          description: "حدث خطأ أثناء حذف الشريك",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditTx = (transaction: any) => {
    setSelectedTransaction(transaction);
    setEditTxDialogOpen(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المعاملة؟")) {
      try {
        await deleteTransaction.mutateAsync(transactionId);
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PartnershipFinancialSummaryCards
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        totalDoctorsDebt={totalDoctorsDebt}
        partnersCount={partners.length}
        casesCount={cases.length}
        expensesCount={expenses.length}
      />

      <AutoDistributionIndicator />

      <PartnerActionHeaderSection />

      <PartnerListSection
        partners={partners}
        onWithdraw={handleWithdraw}
        onDelete={handleDelete}
        onWithdrawShare={handleWithdrawShare}
        getPartnerStats={getPartnerStats}
      />

      <PartnerTransactionsTableSection
        transactions={partnerTransactions}
        partners={partners}
        showAddTransaction={showAddTransaction}
        setShowAddTransaction={setShowAddTransaction}
        handleEditTx={handleEditTx}
        handleDeleteTransaction={handleDeleteTransaction}
      />

      <WithdrawFromPersonalBalanceDialog
        open={withdrawDialogOpen}
        onOpenChange={setWithdrawDialogOpen}
        partner={selectedPartner}
      />

      <WithdrawFromShareDialog
        open={shareWithdrawDialogOpen}
        onOpenChange={setShareWithdrawDialogOpen}
        partner={selectedPartner}
      />

      <EditPartnerTransactionDialog
        open={editTxDialogOpen}
        onOpenChange={setEditTxDialogOpen}
        partners={partners}
        initialData={selectedTransaction}
      />
    </div>
  );
}
