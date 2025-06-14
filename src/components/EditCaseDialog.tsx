
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useUpdateCase } from "@/hooks/useCases";
import { useDoctors } from "@/hooks/useDoctors";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { DoctorSelect } from "@/components/form/DoctorSelect";
import { WorkTypeSelect } from "@/components/form/WorkTypeSelect";
import { ShadeSelectField } from "@/components/form/add-case/ShadeSelectField";
import { ZirconBlockTypeField } from "@/components/form/add-case/ZirconBlockTypeField";
import { StatusSelect } from "@/components/form/StatusSelect";

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

export type EditCaseDialogProps = {
  caseData: Tables<"cases"> | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdate?: (updatedCase: Tables<"cases">) => void;
};

export function EditCaseDialog({ caseData, open, onOpenChange, onUpdate }: EditCaseDialogProps) {
  const { data: doctors = [] } = useDoctors();
  const { register, handleSubmit, reset, control, setValue, watch } = useForm<CaseForm>({
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
  const updateCase = useUpdateCase();

  // لإيجاد السعر المناسب لنوع العمل للطبيب المختار
  const getDoctorWorkTypePrice = (doctor: any, workType: string) => {
    if (!doctor) return 0;
    if (workType === "زيركون") return Number(doctor.zircon_price) || 0;
    if (workType === "مؤقت") return Number(doctor.temp_price) || 0;
    return 0;
  };

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

  // تحديث السعر تلقائياً عند تغيير الطبيب أو نوع العمل أو عدد الأسنان
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
      // تحويل price و number_of_teeth لأرقام صحيحة إن وجد
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
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "خطأ في تحديث الحالة",
        description: "حدث خطأ عند حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <Form
          // @ts-ignore
          onSubmit={handleSubmit(onSubmit)}
        >
          <DialogHeader>
            <DialogTitle>تعديل بيانات الحالة بالكامل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* اسم المريض */}
            <FormField
              control={control}
              name="patient_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المريض *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* الطبيب */}
            <DoctorSelect form={{ control, setValue }} name="doctor_id" />
            {/* نوع العمل */}
            <WorkTypeSelect form={{ control, setValue }} name="work_type" />
            {/* عدد الأسنان */}
            <FormField
              control={control}
              name="number_of_teeth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد الأسنان</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="مثال: 3"
                      {...field}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        field.onChange(value ? Number(value) : "");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* السعر */}
            <FormField
              control={control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السعر (شيكل) - يتم حسابه تلقائياً</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0"
                      {...field}
                      readOnly
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* اللون */}
            <ShadeSelectField form={{ control, setValue }} />
            {/* نوع بلوك الزيركون */}
            <ZirconBlockTypeField form={{ control, setValue }} />
            {/* أرقام الأسنان */}
            <FormField
              control={control}
              name="tooth_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>أرقام الأسنان</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: 12 11 21" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* التواريخ */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
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
                control={control}
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
            {/* الحالة */}
            <StatusSelect form={{ control, setValue }} name="status" />
            {/* الملاحظات */}
            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">حفظ التغييرات</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
