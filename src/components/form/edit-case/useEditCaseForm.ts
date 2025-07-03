
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDoctors } from "@/hooks/useDoctors";
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
  const { data: doctors = [] } = useDoctors();
  const updateCase = useUpdateCase();

  const form = useForm<CaseForm>({
    defaultValues: caseData
      ? {
          patient_name: caseData.patient_name,
          doctor_id: caseData.doctor_id || "",
          work_type: caseData.work_type,
          tooth_number: caseData.tooth_number || "",
          teeth_count: caseData.teeth_count ?? "",
          price: caseData.price ?? "",
          shade: caseData.shade || "",
          zircon_block_type: caseData.zircon_block_type || "",
          notes: caseData.notes || "",
          status: caseData.status,
          submission_date: caseData.submission_date || "",
          delivery_date: caseData.delivery_date || "",
        }
      : {},
  });

  const { register, handleSubmit, reset, control, setValue, watch } = form;

  // Function to get doctor work type price
  const getDoctorWorkTypePrice = (doctor: any, workType: string) => {
    if (!doctor) return 0;
    if (workType === "زيركون") return Number(doctor.zircon_price) || 0;
    if (workType === "مؤقت") return Number(doctor.temp_price) || 0;
    return 0;
  };

  // Function to recalculate price manually
  const recalculatePrice = () => {
    const doctorId = watch("doctor_id");
    const workType = watch("work_type");
    const teethCount = watch("teeth_count");
    
    console.log("إعادة حساب السعر يدوياً:", {
      doctorId,
      workType,
      teethCount,
      doctorsLength: doctors.length
    });

    if (doctorId && workType && doctors.length > 0) {
      const doctor: any = doctors.find((d: any) => d.id === doctorId);
      const pricePerTooth = getDoctorWorkTypePrice(doctor, workType);
      
      let numberOfTeeth = 1;
      if (teethCount !== "" && teethCount !== null && teethCount !== undefined) {
        const parsedTeeth = Number(teethCount);
        if (!isNaN(parsedTeeth) && parsedTeeth > 0) {
          numberOfTeeth = parsedTeeth;
        }
      }
      
      const totalPrice = pricePerTooth * numberOfTeeth;
      
      console.log("نتيجة إعادة الحساب:", {
        doctor: doctor?.name,
        pricePerTooth,
        numberOfTeeth,
        totalPrice
      });
      
      setValue("price", totalPrice);
      
      toast({
        title: "تم إعادة حساب السعر",
        description: `السعر الجديد: ${totalPrice} شيكل`,
      });
    } else {
      toast({
        title: "تعذر حساب السعر",
        description: "تأكد من اختيار الطبيب ونوع العمل",
        variant: "destructive",
      });
    }
  };

  // Reset form when case data or dialog state changes
  useEffect(() => {
    if (caseData) {
      console.log("إعادة تحميل بيانات الحالة:", {
        teeth_count: caseData.teeth_count,
        price: caseData.price,
        work_type: caseData.work_type,
        doctor_id: caseData.doctor_id
      });
      
      reset({
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
  }, [caseData, open, reset]);

  const onSubmit = async (values: any) => {
    if (!caseData) return;
    try {
      // Convert price and teeth_count to numbers if they exist
      const payload = {
        ...values,
        id: caseData.id,
        price: values.price !== "" ? Number(values.price) : null,
        teeth_count: values.teeth_count !== "" ? Number(values.teeth_count) : null,
      };
      
      console.log("إرسال البيانات المحدثة:", payload);
      
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

  return {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    onSubmit,
    recalculatePrice,
    isLoading: updateCase.isPending,
  };
}
