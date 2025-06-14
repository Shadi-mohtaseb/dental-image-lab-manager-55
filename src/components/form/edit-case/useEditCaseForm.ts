
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
  number_of_teeth?: number | string;
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
          number_of_teeth: caseData.number_of_teeth ?? "",
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

  // Reset form when case data or dialog state changes
  useEffect(() => {
    if (caseData) {
      reset({
        patient_name: caseData.patient_name,
        doctor_id: caseData.doctor_id || "",
        work_type: caseData.work_type || "",
        tooth_number: caseData.tooth_number || "",
        number_of_teeth: caseData.number_of_teeth ?? "",
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

  // Auto-calculate price when doctor, work type, or number of teeth changes
  useEffect(() => {
    const doctorId = watch("doctor_id");
    const workType = watch("work_type");
    const numberOfTeeth = watch("number_of_teeth");
    
    if (doctorId && workType && doctors.length > 0) {
      const doctor: any = doctors.find((d: any) => d.id === doctorId);
      const pricePerTooth = getDoctorWorkTypePrice(doctor, workType);
      const teethCount = Number(numberOfTeeth) || 1;
      const totalPrice = pricePerTooth * teethCount;
      setValue("price", totalPrice);
    }
  }, [watch("doctor_id"), watch("work_type"), watch("number_of_teeth"), doctors, setValue, watch]);

  const onSubmit = async (values: any) => {
    if (!caseData) return;
    try {
      // Convert price and number_of_teeth to numbers if they exist
      const payload = {
        ...values,
        id: caseData.id,
        price: values.price !== "" ? Number(values.price) : null,
        number_of_teeth: values.number_of_teeth !== "" ? Number(values.number_of_teeth) : null,
      };
      const updated = await updateCase.mutateAsync(payload);
      toast({
        title: "تم تحديث الحالة بنجاح",
        description: "تم حفظ التغييرات لجميع بيانات الحالة",
      });
      onUpdate?.(updated);
      onOpenChange?.(false);
    } catch (e) {
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
    isLoading: updateCase.isPending,
  };
}
