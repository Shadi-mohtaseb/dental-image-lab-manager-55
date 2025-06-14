
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { usePartners } from "@/hooks/usePartners";
import { useAddPartnerTransaction } from "@/hooks/usePartnerTransactions";
import { Plus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function AddPartnerTransactionDialog({ open, onOpenChange }: Props) {
  const { data: partners = [] } = usePartners();
  const addTx = useAddPartnerTransaction();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const form = e.target;
    const partnerId = form.partner.value;
    const type = form.type.value;
    const amountRaw = form.amount.value;
    const date = form.date.value;
    const desc = form.description.value;
    const amount = Number(amountRaw);

    if (!partnerId || !type || !amount || !date) {
      return;
    }

    setIsLoading(true);
    await addTx.mutateAsync({
      partner_id: partnerId,
      amount,
      transaction_type: type,
      transaction_date: date,
      description: desc,
      transaction_source: "manual",
    });

    setIsLoading(false);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة معاملة مالية</DialogTitle>
        </DialogHeader>
        <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
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
          <div>
            <Label htmlFor="description">الوصف</Label>
            <Input name="description" placeholder="أدخل وصف المعاملة" />
          </div>
          <div className="flex gap-3 mt-6">
            <Button className="bg-primary hover:bg-primary/90" type="submit" disabled={isLoading}>
              {isLoading ? "جاري الإضافة..." : "إضافة المعاملة"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
