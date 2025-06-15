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
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const workTypes = ["زيركون", "مؤقت"] as const;
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
  work_type: z.enum(workTypes, { required_error: "نوع العمل مطلوب" }),
  number_of_teeth: z
    .preprocess(val => (val === "" ? undefined : Number(val)), z.number({ invalid_type_error: "يرجى إدخال عدد الأسنان" }).min(1, "يرجى إدخال عدد الأسنان").optional()),
  tooth_number: z.string().optional(),
  status: z.enum(caseStatuses).default("قيد التنفيذ"),
  notes: z.string().optional(),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال سعر صالح" }).min(0, "يرجى إدخال السعر")
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

  // لإيجاد السعر المناسب لنوع العمل للطبيب المختار
  const getDoctorWorkTypePrice = (doctor: any, workType: string) => {
    if (!doctor) return 0;
    if (workType === "زيركون") return Number(doctor.zircon_price) || 0;
    if (workType === "مؤقت") return Number(doctor.temp_price) || 0;
    return 0;
  };

  // إعداد تاريخ اليوم كنص (YYYY-MM-DD)
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_name: "",
      doctor_id: "",
      work_type: "زيركون",
      tooth_number: "",
      number_of_teeth: undefined,
      status: "قيد التنفيذ",
      notes: "",
      price: 0,
      shade: "",
      zircon_block_type: "",
      delivery_date: "", // قيمة فارغة (اختياري)
      submission_date: todayStr, // إجباري - مملوء افتراضيًا
    },
  });

  // تحديث السعر عند تغيير الطبيب أو نوع العمل أو عدد الأسنان
  useEffect(() => {
    const doctorId = form.watch("doctor_id");
    const workType = form.watch("work_type");
    const numberOfTeeth = form.watch("number_of_teeth");
    if (doctorId && workType && doctors.length > 0) {
      const doctor: any = doctors.find((d: any) => d.id === doctorId);
      const pricePerTooth = getDoctorWorkTypePrice(doctor, workType);
      let teethCount = 1;
      if (numberOfTeeth !== undefined && numberOfTeeth !== null) {
        const parsedTeeth = Number(numberOfTeeth);
        if (!isNaN(parsedTeeth) && parsedTeeth > 0) {
          teethCount = parsedTeeth;
        }
      }
      const totalPrice = pricePerTooth * teethCount;
      if (form.getValues("price") !== totalPrice) {
        form.setValue("price", totalPrice);
      }
    }
    // eslint-disable-next-line
  }, [
    form.watch("doctor_id"),
    form.watch("work_type"),
    form.watch("number_of_teeth"),
    doctors,
  ]);

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
        submission_date: data.submission_date, // دائماً إجباري
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
      // أعد تعيين submission_date للقيمة الافتراضية
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
        {/* تم حذف DatesFields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* تاريخ التسليم (اختياري) */}
          <FormField
            control={form.control}
            name="delivery_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ التسليم</FormLabel>
                <FormControl>
                  <input
                    type="date"
                    className="input input-bordered w-full p-2 border rounded"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* تاريخ الاستلام (قابل للتعديل) */}
          <FormField
            control={form.control}
            name="submission_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ الاستلام</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full flex justify-between items-center",
                          !field.value && "text-muted-foreground"
                        )}
                        type="button"
                      >
                        {field.value
                          ? format(new Date(field.value), "yyyy-MM-dd")
                          : <span>اختر التاريخ</span>}
                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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

// انتهى
