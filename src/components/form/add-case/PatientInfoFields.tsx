
import { DoctorSelect } from "../DoctorSelect";
import { WorkTypeSelect } from "../WorkTypeSelect";

export function PatientInfoFields({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DoctorSelect form={form} name="doctor_id" />
      <WorkTypeSelect form={form} name="work_type" />
    </div>
  );
}
