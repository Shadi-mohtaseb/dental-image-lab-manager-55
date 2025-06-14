
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DoctorSelect } from "../DoctorSelect";

export function PatientInfoFields({ form }: { form: any }) {
  return (
    <>
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
    </>
  );
}
