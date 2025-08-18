
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface DoctorPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: any;
}

export default function DoctorPaymentDialog({ open, onOpenChange, doctor }: DoctorPaymentDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      amount: "",
      payment_method: "نقدي",
      transaction_date: new Date().toISOString().slice(0, 10),
      check_cash_date: "",
      notes: "",
    },
  });
  const { register, handleSubmit, reset, watch } = form;
  const [loading, setLoading] = useState(false);

  const paymentMethod = watch("payment_method");

  const onSubmit = async (values: any) => {
    if (!doctor?.id) {
      toast({ title: "لم يتم تحديد الطبيب", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { amount, payment_method, transaction_date, check_cash_date, notes } = values;
    // تحويل doctor_id إلى uuid صريح إذا كان موجوداً
    const doctor_id =
      typeof doctor.id === "string" && doctor.id.length === 36
        ? doctor.id
        : String(doctor.id);

    const { error } = await supabase.from("doctor_transactions").insert({
      doctor_id,
      amount: Number(amount),
      payment_method,
      transaction_type: "دفعة",
      transaction_date,
      check_cash_date: payment_method === "شيك" && check_cash_date ? check_cash_date : null,
      notes,
      status: "مؤكد",
    });
    setLoading(false);

    if (!error) {
      toast({ title: "تم تسجيل الدفعة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["doctor_transactions"] });
      
      // إعادة حساب وتوزيع الأرباح تلقائياً
      const { error: updateError } = await supabase.rpc("update_company_capital");
      if (!updateError) {
        await supabase.rpc("distribute_profits_to_partners");
        queryClient.invalidateQueries({ queryKey: ["company_capital"] });
        queryClient.invalidateQueries({ queryKey: ["partners"] });
      }
      
      onOpenChange(false);
      reset();
    } else {
      toast({ title: "حدث خطأ أثناء تسجيل الدفعة", variant: "destructive" });
    }
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة دفعة للطبيب: {doctor.name}</DialogTitle>
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
          {paymentMethod === "شيك" && (
            <div>
              <Label>تاريخ صرف الشيك</Label>
              <Input type="date" {...register("check_cash_date")} />
            </div>
          )}
          <div>
            <Label>ملاحظات</Label>
            <Input type="text" {...register("notes")} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ الدفعة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
