
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface EditDoctorPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
}

export default function EditDoctorPaymentDialog({ open, onOpenChange, payment }: EditDoctorPaymentDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      amount: "",
      payment_method: "",
      transaction_date: "",
      notes: "",
    },
  });
  const { register, handleSubmit, reset, setValue } = form;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (payment && open) {
      setValue("amount", payment.amount?.toString() || "");
      setValue("payment_method", payment.payment_method || "نقدي");
      setValue("transaction_date", payment.transaction_date || new Date().toISOString().slice(0, 10));
      setValue("notes", payment.notes || "");
    }
  }, [payment, open, setValue]);

  if (!payment) return null;

  const onSubmit = async (values: any) => {
    setLoading(true);
    const { amount, payment_method, transaction_date, notes } = values;
    const { error } = await supabase.from("doctor_transactions").update({
      amount: Number(amount),
      payment_method,
      transaction_date,
      notes
    }).eq("id", payment.id);
    setLoading(false);

    if (!error) {
      toast({ title: "تم تحديث الدفعة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["doctor_transactions"] });
      onOpenChange(false);
      reset();
    } else {
      toast({ title: "حدث خطأ أثناء تحديث الدفعة", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل الدفعة للطبيب: {payment?.doctors?.name}</DialogTitle>
          <DialogDescription>يمكنك تعديل تفاصيل الدفعة هنا.</DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>المبلغ</Label>
            <Input type="number" min="0" step="0.01" {...register("amount", { required: true })} />
          </div>
          <div>
            <Label>طريقة الدفع</Label>
            <select className="bg-white border rounded-md px-2 py-1 w-full" {...register("payment_method")}>
              <option value="نقدي">نقدي</option>
              <option value="شيك">شيك</option>
              <option value="تحويل">تحويل</option>
            </select>
          </div>
          <div>
            <Label>تاريخ الدفع</Label>
            <Input type="date" {...register("transaction_date")} />
          </div>
          <div>
            <Label>ملاحظات</Label>
            <Input type="text" {...register("notes")} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
