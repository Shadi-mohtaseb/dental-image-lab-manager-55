
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
    .preprocess(val => (val === "" ? undefined : Number(val)), z.number({ invalid_type_error: "يرجى إدخال عدد الأسنان" }).min(1, "يرجى إدخال عدد الأسنان").optional()),
  tooth_number: z.string().optional(),
  status: z.enum(caseStatuses).default("قيد التنفيذ"),
  notes: z.string().optional(),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال سعر صالح" }).min(0, "يرجى إدخال السعر")
  ),
  work_type_price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال سعر صالح" }).min(0, "سعر نوع العمل مطلوب")
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
      teeth_count: undefined,
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
    const doctorId = form.watch("doctor_id");
    const workType = form.watch("work_type");
    
    if (doctorId && workType) {
      const workTypePrice = getDoctorWorkTypePrice(doctorId, workType);
      form.setValue("work_type_price", workTypePrice);
    }
  }, [form.watch("doctor_id"), form.watch("work_type"), doctorWorkTypePrices, workTypes]);

  // Update total price when work type price or number of teeth changes
  useEffect(() => {
    const workTypePrice = form.watch("work_type_price");
    const numberOfTeeth = form.watch("teeth_count");
    
    if (workTypePrice !== undefined) {
      let teethCount = 1;
      if (numberOfTeeth !== undefined && numberOfTeeth !== null) {
        const parsedTeeth = Number(numberOfTeeth);
        if (!isNaN(parsedTeeth) && parsedTeeth > 0) {
          teethCount = parsedTeeth;
        }
      }
      const totalPrice = workTypePrice * teethCount;
      form.setValue("price", totalPrice);
    }
  }, [form.watch("work_type_price"), form.watch("teeth_count")]);

  const onSubmit = async (data: FormData) => {
    try {
      const sanitizedData = {
        ...data,
        tooth_number: data.tooth_number || null,
        teeth_count: data.teeth_count || null,
        notes: data.notes || null,
        shade: data.shade || null,
        zircon_block_type: data.zircon_block_type || null,
        delivery_date: data.delivery_date || null,
        submission_date: data.submission_date,
      };

      await addCase.mutateAsync({
        patient_name: sanitizedData.patient_name,
        doctor_id: sanitizedData.doctor_id,
        work_type: sanitizedData.work_type,
        tooth_number: sanitizedData.tooth_number,
        teeth_count: sanitizedData.teeth_count,
        status: sanitizedData.status,
        notes: sanitizedData.notes,
        price: sanitizedData.price,
        shade: sanitizedData.shade,
        zircon_block_type: sanitizedData.zircon_block_type,
        delivery_date: sanitizedData.delivery_date,
        submission_date: sanitizedData.submission_date,
      });
      
      form.reset();
      form.setValue("submission_date", todayStr);
      onSuccess();
    } catch (error) {
      console.error("Error adding case:", error);
    }
  };

  const handleReset = () => {
    form.reset();
    form.setValue("submission_date", todayStr);
  };

  return {
    form,
    onSubmit,
    handleReset,
    isSubmitting: addCase.isPending,
  };
}
