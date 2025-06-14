import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddCase } from "@/hooks/useCases";
import { DoctorSelect } from "./form/DoctorSelect";
import { WorkTypeSelect } from "./form/WorkTypeSelect";
import { StatusSelect } from "./form/StatusSelect";
import { Button } from "@/components/ui/button";
import { useDoctors } from "@/hooks/useDoctors";
import { useEffect } from "react";

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

// تم اضافة price للحالة
const formSchema = z.object({
  patient_name: z.string().min(2, "اسم المريض مطلوب"),
  doctor_id: z.string().min(1, "اختيار الطبيب مطلوب"),
  work_type: z.enum(workTypes, { required_error: "نوع العمل مطلوب" }),
  tooth_number: z.string().optional(),
  submission_date: z.string(),
  delivery_date: z.string().optional(),
  status: z.enum(caseStatuses).default("قيد التنفيذ"),
  notes: z.string().optional(),
  number_of_teeth: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال عدد أسنان صالح" }).min(1, "يرجى إدخال عدد الأسنان")
  ),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال سعر صالح" }).min(0, "يرجى إدخال السعر")
  ),
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
      number_of_teeth: 1,
      submission_date: new Date().toISOString().split('T')[0],
      delivery_date: "",
      status: "قيد التنفيذ",
      notes: "",
      price: 0,
    },
  });

  // تحديث السعر عند تغيير الطبيب أو نوع العمل أو عدد الأسنان
  useEffect(() => {
    const doctorId = form.watch("doctor_id");
    const workType = form.watch("work_type");
    const numberOfTeeth = form.watch("number_of_teeth") || 1;

    const doctor: any = doctors.find((d: any) => d.id === doctorId);
    const pricePerTooth = getDoctorWorkTypePrice(doctor, workType);
    const autoPrice = pricePerTooth * numberOfTeeth;

    if (form.getValues("price") !== autoPrice) {
      form.setValue("price", autoPrice);
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
        submission_date: data.submission_date,
        delivery_date: data.delivery_date || null,
        status: data.status,
        notes: data.notes || null,
        price: data.price,
        number_of_teeth: data.number_of_teeth,
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
        <FormField
          control={form.control}
          name="patient_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المريض *</FormLabel>
              <FormControl>
                <Input placeholder="محمد أحمد" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DoctorSelect form={form} name="doctor_id" />

        <div className="grid grid-cols-2 gap-4">
          <WorkTypeSelect form={form} name="work_type" />
          <FormField
            control={form.control}
            name="number_of_teeth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عدد الأسنان *</FormLabel>
                <FormControl>
                  <Input type="number" min={1} placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tooth_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم السن</FormLabel>
              <FormControl>
                <Input placeholder="12" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="submission_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ التسليم *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="delivery_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ الاستلام</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <StatusSelect form={form} name="status" />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات</FormLabel>
              <FormControl>
                <Textarea placeholder="ملاحظات إضافية" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>السعر (شيكل) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
