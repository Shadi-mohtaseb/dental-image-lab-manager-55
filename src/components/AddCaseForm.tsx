
import { Form } from "@/components/ui/form";
import { DoctorSelect } from "@/components/form/DoctorSelect";
import { WorkTypeSelect } from "@/components/form/WorkTypeSelect";
import { TeethDetailsFields } from "@/components/form/add-case/TeethDetailsFields";
import { ToothNumberField } from "@/components/form/add-case/ToothNumberField";
import { NotesField } from "@/components/form/add-case/NotesField";
import { PriceField } from "@/components/form/add-case/PriceField";
import { SubmissionAndDeliveryDatesFields } from "@/components/form/add-case/SubmissionAndDeliveryDatesFields";
import { StatusSelect } from "@/components/form/StatusSelect";
import { PatientNameField } from "@/components/form/add-case/PatientNameField";
import { WorkTypePriceField } from "@/components/form/add-case/WorkTypePriceField";
import { FormActions } from "@/components/form/add-case/FormActions";
import { useAddCaseForm } from "@/components/form/add-case/useAddCaseForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function AddCaseForm({ onSuccess }: { onSuccess: () => void }) {
  const { form, onSubmit, handleReset, isSubmitting } = useAddCaseForm(onSuccess);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* معلومات المريض الأساسية */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">معلومات المريض</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PatientNameField form={form} />
              <DoctorSelect form={form} name="doctor_id" />
            </div>
          </CardContent>
        </Card>

        {/* معلومات العمل */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تفاصيل العمل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WorkTypeSelect form={form} name="work_type" />
              <StatusSelect form={form} name="status" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToothNumberField form={form} />
              <TeethDetailsFields form={form} />
            </div>
          </CardContent>
        </Card>

        {/* معلومات التسعير */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">التسعير</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WorkTypePriceField form={form} />
              <PriceField form={form} />
            </div>
          </CardContent>
        </Card>

        {/* معلومات التواريخ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">التواريخ</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionAndDeliveryDatesFields form={form} />
          </CardContent>
        </Card>

        {/* ملاحظات إضافية */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            <NotesField form={form} />
          </CardContent>
        </Card>
        
        <FormActions onReset={handleReset} isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
}
