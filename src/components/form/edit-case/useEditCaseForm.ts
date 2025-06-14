
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
      console.log("إعادة تحميل بيانات الحالة:", {
        number_of_teeth: caseData.number_of_teeth,
        price: caseData.price,
        work_type: caseData.work_type,
        doctor_id: caseData.doctor_id
      });
      
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

      // Force recalculate price after form reset
      setTimeout(() => {
        const doctorId = caseData.doctor_id;
        const workType = caseData.work_type;
        const numberOfTeeth = caseData.number_of_teeth;
        
        console.log("فرض إعادة حساب السعر:", {
          doctorId,
          workType,
          numberOfTeeth,
          doctorsAvailable: doctors.length > 0
        });

        if (doctorId && workType && doctors.length > 0 && numberOfTeeth) {
          const doctor: any = doctors.find((d: any) => d.id === doctorId);
          const pricePerTooth = getDoctorWorkTypePrice(doctor, workType);
          const teethCount = Number(numberOfTeeth);
          const totalPrice = pricePerTooth * teethCount;
          
          console.log("إجبار حساب السعر:", {
            doctor: doctor?.name,
            pricePerTooth,
            teethCount,
            totalPrice,
            calculation: `${pricePerTooth} × ${teethCount} = ${totalPrice}`
          });
          
          setValue("price", totalPrice);
        }
      }, 100);
    }
  }, [caseData, open, reset, doctors, setValue]);

  // Auto-calculate price when doctor, work type, or number of teeth changes
  useEffect(() => {
    const doctorId = watch("doctor_id");
    const workType = watch("work_type");
    const numberOfTeeth = watch("number_of_teeth");
    
    console.log("مراقبة تغيير القيم:", {
      doctorId,
      workType, 
      numberOfTeeth,
      numberOfTeethType: typeof numberOfTeeth,
      doctorsLength: doctors.length
    });
    
    if (doctorId && workType && doctors.length > 0) {
      const doctor: any = doctors.find((d: any) => d.id === doctorId);
      const pricePerTooth = getDoctorWorkTypePrice(doctor, workType);
      
      // تحويل عدد الأسنان إلى رقم صحيح
      let teethCount = 1;
      if (numberOfTeeth !== "" && numberOfTeeth !== null && numberOfTeeth !== undefined) {
        const parsedTeeth = Number(numberOfTeeth);
        if (!isNaN(parsedTeeth) && parsedTeeth > 0) {
          teethCount = parsedTeeth;
        }
      }
      
      const totalPrice = pricePerTooth * teethCount;
      
      console.log("تفاصيل حساب السعر:", {
        doctor: doctor?.name,
        pricePerTooth,
        teethCount,
        totalPrice,
        calculation: `${pricePerTooth} × ${teethCount} = ${totalPrice}`,
        currentPrice: watch("price")
      });
      
      // Only update if price has actually changed
      if (watch("price") !== totalPrice) {
        console.log("تحديث السعر من", watch("price"), "إلى", totalPrice);
        setValue("price", totalPrice);
      }
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
    isLoading: updateCase.isPending,
  };
}
