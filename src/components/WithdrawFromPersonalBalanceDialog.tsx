
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAddPartnerTransaction } from "@/hooks/usePartnerTransactions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: { id: string; name: string; personal_balance: number | null } | null;
}

export default function WithdrawFromPersonalBalanceDialog({ open, onOpenChange, partner }: Props) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const addTransaction = useAddPartnerTransaction();

  // Don't render anything if partner is null
  if (!partner) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);
    const currentBalance = partner.personal_balance || 0;

    if (withdrawAmount <= 0) {
      toast({
        title: "خطأ في المبلغ",
        description: "يجب أن يكون المبلغ أكبر من صفر",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > currentBalance) {
      toast({
        title: "رصيد غير كافي",
        description: "المبلغ المطلوب سحبه أكبر من الرصيد الشخصي المتاح",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // إضافة معاملة السحب
      await addTransaction.mutateAsync({
        partner_id: partner.id,
        amount: withdrawAmount,
        transaction_type: "withdraw",
        transaction_date: new Date().toISOString().split('T')[0],
        description: `سحب من الرصيد الشخصي: ${description}`,
        transaction_source: "personal_withdrawal",
      });

      // تحديث الرصيد الشخصي للشريك
      const { error } = await supabase
        .from("partners")
        .update({ 
          personal_balance: currentBalance - withdrawAmount,
          updated_at: new Date().toISOString()
        })
        .eq("id", partner.id);

      if (error) throw error;

      toast({
        title: "تم السحب بنجاح",
        description: `تم سحب ${withdrawAmount} من الرصيد الشخصي لـ ${partner.name}`,
      });

      setAmount("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error withdrawing from personal balance:", error);
      toast({
        title: "خطأ في السحب",
        description: "حدث خطأ أثناء عملية السحب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>سحب من الرصيد الشخصي - {partner.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            الرصيد الشخصي المتاح: <span className="font-bold text-green-600">{(partner.personal_balance || 0).toFixed(2)} ₪</span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">مبلغ السحب *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={partner.personal_balance || 0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="أدخل مبلغ السحب"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">وصف العملية</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف لعملية السحب"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري السحب..." : "تأكيد السحب"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
