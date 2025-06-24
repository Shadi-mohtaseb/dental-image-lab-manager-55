
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useDoctors } from "@/hooks/useDoctors";
import { Plus } from "lucide-react";

interface AddPaymentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function AddPaymentDialog({ open: controlledOpen, onOpenChange: controlledOnOpenChange, trigger }: AddPaymentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: doctors = [] } = useDoctors();
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  const form = useForm({
    defaultValues: {
      doctor_id: "",
      amount: "",
      payment_method: "نقدي",
      transaction_date: new Date().toISOString().slice(0, 10),
      check_cash_date: "",
      notes: "",
    },
  });
  const { register, handleSubmit, reset, watch, setValue } = form;
  const [loading, setLoading] = useState(false);

  const paymentMethod = watch("payment_method");

  const onSubmit = async (values: any) => {
    if (!values.doctor_id) {
      toast({ title: "يرجى اختيار الطبيب", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { amount, payment_method, transaction_date, check_cash_date, notes, doctor_id } = values;

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
      if (onOpenChange) onOpenChange(false);
      reset();
    } else {
      toast({ title: "حدث خطأ أثناء تسجيل الدفعة", variant: "destructive" });
    }
  };

  const TriggerButton = trigger || (
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      إضافة دفعة
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة دفعة جديدة</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>الطبيب *</Label>
            <Select onValueChange={(value) => setValue("doctor_id", value)} value={watch("doctor_id")}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الطبيب" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor: any) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>المبلغ *</Label>
            <Input type="number" min="0" step="0.01" {...register("amount", { required: true })} />
          </div>
          <div>
            <Label>طريقة الدفع</Label>
            <Select onValueChange={(value) => setValue("payment_method", value)} value={watch("payment_method")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="نقدي">نقدي</SelectItem>
                <SelectItem value="شيك">شيك</SelectItem>
                <SelectItem value="تحويل">تحويل</SelectItem>
              </SelectContent>
            </Select>
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
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "جاري الحفظ..." : "حفظ الدفعة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
