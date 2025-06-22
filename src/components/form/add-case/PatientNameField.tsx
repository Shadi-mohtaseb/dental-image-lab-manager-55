
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function PatientNameField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
      name="patient_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>اسم المريض *</FormLabel>
          <FormControl>
            <Input placeholder="أدخل اسم المريض" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
