import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddCase } from "@/hooks/useCases";
import { useDoctors } from "@/hooks/useDoctors";
import { FileText } from "lucide-react";

const workTypes = ["زيركون", "مؤقت"] as const;

const caseStatuses = [
  "قيد التنفيذ",
  "تجهيز العمل",
  "اختبار القوي",
  "المراجعة النهائية",
  "تم التسليم",
  "معلق",
  "ملغي"
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

export function AddCaseDialog() {
  const [open, setOpen] = useState(false);
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
    // فقط عدّل السعر إذا لم يغير المستخدم حقله يدويًا بنفس القيمة (منع حلقة لا نهائية)
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
      const caseNumber = `C${Date.now().toString().slice(-6)}`;

      await addCase.mutateAsync({
        case_number: caseNumber,
        patient_name: data.patient_name,
        doctor_id: data.doctor_id,
        work_type: data.work_type,
        tooth_number: data.tooth_number || null,
        submission_date: data.submission_date,
        delivery_date: data.delivery_date || null,
        status: data.status,
        notes: data.notes || null,
        price: data.price,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding case:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <FileText className="w-4 h-4 mr-2" />
          إضافة حالة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة حالة جديدة</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل الحالة الطبية الجديدة
          </DialogDescription>
        </DialogHeader>
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

            <FormField
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الطبيب *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الطبيب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor: any) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="work_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع العمل *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع العمل" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحالة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {caseStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                onClick={() => setOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={addCase.isPending}>
                {addCase.isPending ? "جاري الإضافة..." : "إضافة الحالة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
