
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { format } from "date-fns";
import { useAddCase } from "@/hooks/useCases";
import { useDoctorWorkTypePrices } from "@/hooks/useDoctorWorkTypePrices";
import { useWorkTypesData } from "@/components/work-types/useWorkTypesData";

const caseStatuses = [
  "قيد التنفيذ",
  "تجهيز العمل",
  "اختبار القوي",
  "المراجعة النهائية",
  "تم التسليم",
  "معلق",
  "ملغي",
] as const;

const formSchema = z.object({
  patient_name: z.string().min(2, "اسم المريض مطلوب"),
  doctor_id: z.string().min(1, "اختيار الطبيب مطلوب"),
  work_type: z.string().min(1, "نوع العمل مطلوب"),
  teeth_count: z
    .preprocess(val => (val === "" || val === undefined ? 1 : Number(val)), z.number().min(1, "عدد الأسنان يجب أن يكون أكبر من صفر").optional().default(1)),
  tooth_number: z.string().optional(),
  status: z.enum(caseStatuses).default("قيد التنفيذ"),
  notes: z.string().optional(),
  price: z.preprocess(
    (val) => (val === "" || val === undefined ? 0 : Number(val)),
    z.number().min(0, "يرجى إدخال السعر")
  ),
  work_type_price: z.preprocess(
    (val) => (val === "" || val === undefined ? 0 : Number(val)),
    z.number().min(0, "سعر نوع العمل مطلوب")
  ),
  shade: z.string().optional(),
  zircon_block_type: z.string().optional(),
  delivery_date: z.string().optional(),
  submission_date: z.string().min(1, "تاريخ الاستلام مطلوب"),
});

type FormData = z.infer<typeof formSchema>;

export function useAddCaseForm(onSuccess: () => void) {
  const addCase = useAddCase();
  const { data: doctorWorkTypePrices = [] } = useDoctorWorkTypePrices();
  const { workTypes } = useWorkTypesData();

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_name: "",
      doctor_id: "",
      work_type: "",
      tooth_number: "",
      teeth_count: 1,
      status: "قيد التنفيذ",
      notes: "",
      price: 0,
      work_type_price: 0,
      shade: "",
      zircon_block_type: "",
      delivery_date: "",
      submission_date: todayStr,
    },
  });

  const getDoctorWorkTypePrice = (doctorId: string, workType: string) => {
    if (!doctorId || !workType || !Array.isArray(doctorWorkTypePrices)) return 0;
    
    const workTypeObj = workTypes?.find((wt: any) => wt.name === workType);
    if (!workTypeObj) return 0;
    
    const priceRecord = doctorWorkTypePrices.find((price: any) =>
      price.doctor_id === doctorId && price.work_type_id === workTypeObj.id
    );
    
    return priceRecord?.price || 0;
  };

  // Update work type price when doctor or work type changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "doctor_id" || name === "work_type") {
        const doctorId = value.doctor_id;
        const workType = value.work_type;
        
        if (doctorId && workType) {
          const workTypePrice = getDoctorWorkTypePrice(doctorId, workType);
          const currentWorkTypePrice = form.getValues("work_type_price");
          
          if (workTypePrice !== currentWorkTypePrice) {
            form.setValue("work_type_price", workTypePrice, { shouldValidate: false });
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [doctorWorkTypePrices, workTypes, form]);

  // Update total price when work type price or number of teeth changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "work_type_price" || name === "teeth_count") {
        const workTypePrice = value.work_type_price || 0;
        const numberOfTeeth = value.teeth_count || 1;
        
        const totalPrice = workTypePrice * numberOfTeeth;
        const currentPrice = form.getValues("price");
        
        if (totalPrice !== currentPrice) {
          form.setValue("price", totalPrice, { shouldValidate: false });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Submitting case data:", data);
      
      const sanitizedData = {
        patient_name: data.patient_name,
        doctor_id: data.doctor_id,
        work_type: data.work_type,
        tooth_number: data.tooth_number || null,
        teeth_count: data.teeth_count || 1,
        status: data.status,
        notes: data.notes || null,
        price: data.price,
        shade: data.shade || null,
        zircon_block_type: data.zircon_block_type || null,
        delivery_date: data.delivery_date || null,
        submission_date: data.submission_date,
      };

      await addCase.mutateAsync(sanitizedData);
      
      form.reset();
      form.setValue("submission_date", todayStr);
      form.setValue("teeth_count", 1);
      onSuccess();
    } catch (error) {
      console.error("Error adding case:", error);
    }
  };

  const handleReset = () => {
    form.reset();
    form.setValue("submission_date", todayStr);
    form.setValue("teeth_count", 1);
  };

  return {
    form,
    onSubmit,
    handleReset,
    isSubmitting: addCase.isPending,
  };
}
