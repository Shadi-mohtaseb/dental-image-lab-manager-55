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
// مكونات الحقول الجديدة
import { PatientInfoFields } from "@/components/form/add-case/PatientInfoFields";
import { TeethDetailsFields } from "@/components/form/add-case/TeethDetailsFields";
import { ToothNumberField } from "@/components/form/add-case/ToothNumberField";
import { DatesFields } from "@/components/form/add-case/DatesFields";
import { NotesField } from "@/components/form/add-case/NotesField";
import { PriceField } from "@/components/form/add-case/PriceField";
import { TeethCountField } from "@/components/form/add-case/TeethCountField";
import { ShadeSelectField } from "@/components/form/add-case/ShadeSelectField";
import { ZirconBlockTypeField } from "@/components/form/add-case/ZirconBlockTypeField";

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
  submission_date: z.string(),
  delivery_date: z.string().optional(),
  status: z.enum(caseStatuses).default("قيد التنفيذ"),
  notes: z.string().optional(),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال سعر صالح" }).min(0, "يرجى إدخال السعر")
  ),
  shade: z.string().optional(),
  zircon_block_type: z.string().optional(),
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_name: "",
      doctor_id: "",
      work_type: "زيركون",
      tooth_number: "",
      number_of_teeth: undefined,
      submission_date: new Date().toISOString().split('T')[0],
      delivery_date: "",
      status: "قيد التنفيذ",
      notes: "",
      price: 0,
      shade: "",
      zircon_block_type: "",
    },
  });

  // تحديث السعر عند تغيير الطبيب أو نوع العمل أو عدد الأسنان
  useEffect(() => {
    const doctorId = form.watch("doctor_id");
    const workType = form.watch("work_type");
    const numberOfTeeth = form.watch("number_of_teeth");
    const doctor: any = doctors.find((d: any) => d.id === doctorId);
    const pricePerTooth = getDoctorWorkTypePrice(doctor, workType);
    const teethCount = Number(numberOfTeeth) || 1;
    const totalPrice = pricePerTooth * teethCount;

    if (form.getValues("price") !== totalPrice) {
      form.setValue("price", totalPrice);
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
      await addCase.mutateAsync({
        patient_name: data.patient_name,
        doctor_id: data.doctor_id,
        work_type: data.work_type,
        tooth_number: data.tooth_number || null,
        number_of_teeth: data.number_of_teeth || null,
        submission_date: data.submission_date,
        delivery_date: data.delivery_date || null,
        status: data.status,
        notes: data.notes || null,
        price: data.price,
        shade: data.shade || null,
        zircon_block_type: data.zircon_block_type || null,
      });
      form.reset();
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
        <DatesFields form={form} />
        <StatusSelect form={form} name="status" />
        <NotesField form={form} />
        <PriceField form={form} />
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
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
