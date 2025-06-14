
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useUpdateCase } from "@/hooks/useCases";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type EditCaseDialogProps = {
  caseData: Tables<"cases"> | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdate?: (updatedCase: Tables<"cases">) => void;
};

export function EditCaseDialog({ caseData, open, onOpenChange, onUpdate }: EditCaseDialogProps) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: caseData ? {
      patient_name: caseData.patient_name,
      work_type: caseData.work_type,
      tooth_number: caseData.tooth_number || "",
      notes: caseData.notes || "",
      status: caseData.status,
    } : undefined,
  });
  const updateCase = useUpdateCase();

  // reset form values when modal opens and caseData changes
  useEffect(() => {
    if (caseData) {
      reset({
        patient_name: caseData.patient_name,
        work_type: caseData.work_type,
        tooth_number: caseData.tooth_number || "",
        notes: caseData.notes || "",
        status: caseData.status,
      });
    }
  }, [caseData, open, reset]);

  const onSubmit = async (values: any) => {
    if (!caseData) return;
    try {
      const updated = await updateCase.mutateAsync({
        id: caseData.id,
        ...values,
      });
      toast({
        title: "تم تحديث الحالة بنجاح",
        description: "تم حفظ التغييرات",
      });
      onUpdate?.(updated);
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "خطأ في تحديث الحالة",
        description: "حدث خطأ عند حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الحالة</DialogTitle>
          </DialogHeader>
          <div>
            <label className="block mb-1 text-right">اسم المريض</label>
            <Input {...register("patient_name", { required: true })} />
          </div>
          <div>
            <label className="block mb-1 text-right">نوع العمل</label>
            <Input {...register("work_type", { required: true })} />
          </div>
          <div>
            <label className="block mb-1 text-right">رقم/تفاصيل الأسنان</label>
            <Input {...register("tooth_number")} />
          </div>
          <div>
            <label className="block mb-1 text-right">الحالة</label>
            <Input {...register("status", { required: true })} />
          </div>
          <div>
            <label className="block mb-1 text-right">ملاحظات</label>
            <Textarea {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">حفظ التغييرات</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
