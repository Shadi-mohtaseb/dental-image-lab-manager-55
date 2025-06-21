
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddCase } from "@/hooks/useCases";
import { StatusSelect } from "./form/StatusSelect";
import { Button } from "@/components/ui/button";
import { useDoctors } from "@/hooks/useDoctors";
import { useEffect } from "react";
import { format } from "date-fns";
// إعادة استيراد المكونات المساعدة بشكل صحيح
import { PatientInfoFields } from "@/components/form/add-case/PatientInfoFields";
import { TeethDetailsFields } from "@/components/form/add-case/TeethDetailsFields";
import { ToothNumberField } from "@/components/form/add-case/ToothNumberField";
import { NotesField } from "@/components/form/add-case/NotesField";
import { PriceField } from "@/components/form/add-case/PriceField";
import { SubmissionAndDeliveryDatesFields } from "@/components/form/add-case/SubmissionAndDeliveryDatesFields";
import { useDoctorWorkTypePrices } from "@/hooks/useDoctorWorkTypePrices";
import { useWorkTypesData } from "@/components/work-types/useWorkTypesData";
import { Input } from "@/components/ui/input";

import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// إزالة caseStatuses المحفوظ مسبقاً وجعله ديناميكي
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
  number_of_teeth: z
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

export function AddCaseForm({ onSuccess }: { onSuccess: () => void }) {
  const addCase = useAddCase();
  const { data: doctors = [] } = useDoctors();
  const { data: doctorWorkTypePrices = [] } = useDoctorWorkTypePrices();
  const { workTypes } = useWorkTypesData();

  // للحصول على سعر نوع العمل للطبيب المحدد
  const getDoctorWorkTypePrice = (doctorId: string, workType: string) => {
    if (!doctorId || !workType || !Array.isArray(doctorWorkTypePrices)) return 0;
    
    // البحث عن نوع العمل المطابق للاسم
    const workTypeObj = workTypes?.find((wt: any) => wt.name === workType);
    if (!workTypeObj) return 0;
    
    // البحث عن السعر المحدد لهذا الطبيب ونوع العمل
    const priceRecord = doctorWorkTypePrices.find((price: any) =>
      price.doctor_id === doctorId && price.work_type_id === workTypeObj.id
    );
    
    return priceRecord?.price || 0;
  };

  // إعداد تاريخ اليوم كنص (YYYY-MM-DD)
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_name: "",
      doctor_id: "",
      work_type: "",
      tooth_number: "",
      number_of_teeth: undefined,
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

  // تحديث سعر نوع العمل عند تغيير الطبيب أو نوع العمل
  useEffect(() => {
    const doctorId = form.watch("doctor_id");
    const workType = form.watch("work_type");
    
    if (doctorId && workType) {
      const workTypePrice = getDoctorWorkTypePrice(doctorId, workType);
      form.setValue("work_type_price", workTypePrice);
    }
  }, [form.watch("doctor_id"), form.watch("work_type"), doctorWorkTypePrices, workTypes]);

  // تحديث السعر الإجمالي عند تغيير سعر نوع العمل أو عدد الأسنان
  useEffect(() => {
    const workTypePrice = form.watch("work_type_price");
    const numberOfTeeth = form.watch("number_of_teeth");
    
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
  }, [form.watch("work_type_price"), form.watch("number_of_teeth")]);

  const onSubmit = async (data: FormData) => {
    try {
      const sanitizedData = {
        ...data,
        tooth_number: data.tooth_number || null,
        number_of_teeth: data.number_of_teeth || null,
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
        number_of_teeth: sanitizedData.number_of_teeth,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PatientInfoFields form={form} />
        <TeethDetailsFields form={form} />
        <ToothNumberField form={form} />
        
        {/* حقل سعر نوع العمل */}
        <FormField
          control={form.control}
          name="work_type_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>سعر نوع العمل (شيكل) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="سعر الوحدة لنوع العمل"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : Number(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <SubmissionAndDeliveryDatesFields form={form} />
        <StatusSelect form={form} name="status" />
        <NotesField form={form} />
        <PriceField form={form} />
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              form.setValue("submission_date", todayStr);
            }}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={addCase.isPending}>
            {addCase.isPending ? "جاري الإضافة..." : "إضافة الحالة"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
