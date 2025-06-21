
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDoctors } from "@/hooks/useDoctors";

export function DoctorSelect({ form, name }: { form: any; name: string }) {
  const { data: doctors = [], isLoading } = useDoctors();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }: any) => (
        <FormItem>
          <FormLabel>الطبيب *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر الطبيب"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white z-50">
              {doctors?.map((doctor: any) => (
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
  );
}
