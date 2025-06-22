
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

export function AddCaseForm({ onSuccess }: { onSuccess: () => void }) {
  const { form, onSubmit, handleReset, isSubmitting } = useAddCaseForm(onSuccess);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* معلومات المريض والطبيب */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PatientNameField form={form} />
          <DoctorSelect form={form} name="doctor_id" />
        </div>

        {/* نوع العمل وتفاصيل الأسنان */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WorkTypeSelect form={form} name="work_type" />
          <TeethDetailsFields form={form} />
        </div>

        <ToothNumberField form={form} />
        <WorkTypePriceField form={form} />
        <SubmissionAndDeliveryDatesFields form={form} />
        <StatusSelect form={form} name="status" />
        <NotesField form={form} />
        <PriceField form={form} />
        
        <FormActions onReset={handleReset} isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
}
