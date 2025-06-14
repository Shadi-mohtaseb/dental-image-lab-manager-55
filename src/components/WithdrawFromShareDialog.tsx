
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAddPartnerTransaction } from "@/hooks/usePartnerTransactions";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: { id: string; name: string; remaining_share: number } | null;
}

export default function WithdrawFromShareDialog({ open, onOpenChange, partner }: Props) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const addTransaction = useAddPartnerTransaction();

  if (!partner) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);

    if (withdrawAmount <= 0) {
      toast({
        title: "خطأ في المبلغ",
        description: "يجب أن يكون المبلغ أكبر من صفر",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    await addTransaction.mutateAsync({
      partner_id: partner.id,
      amount: withdrawAmount,
      transaction_type: "withdraw",
      transaction_date: new Date().toISOString().split("T")[0],
      description: `سحب من الحصة: ${description ?? ""}`,
      transaction_source: "case_profit",
    });

    toast({
      title: "تم السحب من الحصة",
      description: `سُحب مبلغ ${withdrawAmount} من حصة الربح لـ ${partner.name}${withdrawAmount > partner.remaining_share ? " (تم السماح بتجاوز المتبقي)" : ""}`,
    });

    setAmount("");
    setDescription("");
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>سحب من حصة الربح - {partner.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            المتبقي من الحصة:{" "}
            <span className="font-bold text-blue-800">
              {Number(partner.remaining_share).toFixed(2)} ₪
            </span>
          </p>
          <p className="text-xs text-orange-600">
            يمكن السحب بدون حد أعلى حتى مع تجاوز المتبقي.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">مبلغ السحب *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={0.01}
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
