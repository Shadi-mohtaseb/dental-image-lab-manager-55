
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useUpdatePartnerTransaction } from "@/hooks/usePartnerTransactions";
import { useEffect } from "react";
import { PartnerTransaction } from "@/hooks/usePartnerTransactions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partners: { id: string; name: string }[];
  initialData: PartnerTransaction | null;
}

export default function EditPartnerTransactionDialog({ open, onOpenChange, partners, initialData }: Props) {
  const updateTx = useUpdatePartnerTransaction();
  const form = useForm({
    defaultValues: {
      partner_id: "",
      amount: "",
      transaction_type: "",
      transaction_date: "",
      description: "",
      transaction_source: "manual",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        partner_id: initialData.partner_id,
        amount: initialData.amount.toString(),
        transaction_type: initialData.transaction_type,
        transaction_date: initialData.transaction_date,
        description: initialData.description ?? "",
        transaction_source: initialData.transaction_source ?? "manual",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: any) => {
    if (!initialData) return;
    
    try {
      await updateTx.mutateAsync({
        id: initialData.id,
        partner_id: data.partner_id,
        amount: Number(data.amount),
        transaction_type: data.transaction_type,
        transaction_date: data.transaction_date,
        description: data.description,
        transaction_source: data.transaction_source,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل معاملة الشريك</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>الشريك</Label>
            <Select
              value={form.watch("partner_id")}
              onValueChange={val => form.setValue("partner_id", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الشريك" />
              </SelectTrigger>
              <SelectContent>
                {partners.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>نوع المعاملة</Label>
            <Select
              value={form.watch("transaction_type")}
              onValueChange={val => form.setValue("transaction_type", val)}
            >
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
            <Label>المبلغ</Label>
            <Input
              type="number"
              step="any"
              value={form.watch("amount")}
              onChange={e => form.setValue("amount", e.target.value)}
            />
          </div>
          
          <div>
            <Label>التاريخ</Label>
            <Input
              type="date"
              value={form.watch("transaction_date")}
              onChange={e => form.setValue("transaction_date", e.target.value)}
            />
          </div>
          
          <div>
            <Label>مصدر المعاملة</Label>
            <Select
              value={form.watch("transaction_source")}
              onValueChange={val => form.setValue("transaction_source", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="مصدر المعاملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">يدوي</SelectItem>
                <SelectItem value="case_profit">ربح حالة</SelectItem>
                <SelectItem value="personal_withdrawal">سحب شخصي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>الوصف</Label>
            <Textarea
              value={form.watch("description")}
              onChange={e => form.setValue("description", e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={updateTx.isPending}>
              {updateTx.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
