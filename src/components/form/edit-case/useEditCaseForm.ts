
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateCase } from "@/hooks/useCases";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

type CaseForm = {
  patient_name: string;
  doctor_id: string;
  work_type: string;
  tooth_number: string;
  teeth_count?: number | string;
  price?: number | string;
  shade?: string;
  zircon_block_type?: string;
  notes?: string;
  status: string;
  submission_date: string;
  delivery_date?: string | null;
};

export function useEditCaseForm(
  caseData: Tables<"cases"> | null,
  open: boolean,
  onUpdate?: (updatedCase: Tables<"cases">) => void,
  onOpenChange?: (open: boolean) => void
) {
  const updateCase = useUpdateCase();

  const form = useForm<CaseForm>({
    defaultValues: {
      patient_name: "",
      doctor_id: "",
      work_type: "",
      tooth_number: "",
      teeth_count: "",
      price: "",
      shade: "",
      zircon_block_type: "",
      notes: "",
      status: "في الانتظار",
      submission_date: "",
      delivery_date: "",
    },
  });

  // Reset form when case data or dialog state changes
  useEffect(() => {
    if (caseData && open) {
      form.reset({
        patient_name: caseData.patient_name,
        doctor_id: caseData.doctor_id || "",
        work_type: caseData.work_type || "",
        tooth_number: caseData.tooth_number || "",
        teeth_count: caseData.teeth_count ?? "",
        price: caseData.price ?? "",
        shade: caseData.shade || "",
        zircon_block_type: caseData.zircon_block_type || "",
        notes: caseData.notes || "",
        status: caseData.status,
        submission_date: caseData.submission_date || "",
        delivery_date: caseData.delivery_date || "",
      });
    }
  }, [caseData, open, form]);

  const onSubmit = async (values: CaseForm) => {
    if (!caseData) return;
    try {
      // إزالة الحقول غير الموجودة في جدول cases وتحويل الأرقام
      const { ...caseValues } = values;
      const payload = {
        id: caseData.id,
        patient_name: caseValues.patient_name,
        doctor_id: caseValues.doctor_id,
        work_type: caseValues.work_type,
        tooth_number: caseValues.tooth_number || null,
        teeth_count: caseValues.teeth_count !== "" && caseValues.teeth_count !== undefined ? Number(caseValues.teeth_count) : null,
        price: caseValues.price !== "" && caseValues.price !== undefined ? Number(caseValues.price) : null,
        shade: caseValues.shade || null,
        zircon_block_type: caseValues.zircon_block_type || null,
        notes: caseValues.notes || null,
        status: caseValues.status,
        submission_date: caseValues.submission_date,
        delivery_date: caseValues.delivery_date || null,
      };
      
      const updated = await updateCase.mutateAsync(payload);
      toast({
        title: "تم تحديث الحالة بنجاح",
        description: "تم حفظ التغييرات لجميع بيانات الحالة",
      });
      onUpdate?.(updated);
      onOpenChange?.(false);
    } catch (e) {
      console.error("خطأ في تحديث الحالة:", e);
      toast({
        title: "خطأ في تحديث الحالة",
        description: "حدث خطأ عند حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    if (caseData) {
      form.reset({
        patient_name: caseData.patient_name,
        doctor_id: caseData.doctor_id || "",
        work_type: caseData.work_type || "",
        tooth_number: caseData.tooth_number || "",
        teeth_count: caseData.teeth_count ?? "",
        price: caseData.price ?? "",
        shade: caseData.shade || "",
        zircon_block_type: caseData.zircon_block_type || "",
        notes: caseData.notes || "",
        status: caseData.status,
        submission_date: caseData.submission_date || "",
        delivery_date: caseData.delivery_date || "",
      });
    }
  };

  return {
    form,
    onSubmit,
    handleReset,
    isSubmitting: updateCase.isPending,
  };
}
