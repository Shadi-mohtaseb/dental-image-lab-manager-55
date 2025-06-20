
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkTypesData } from "@/components/work-types/useWorkTypesData";

export function WorkTypeSelect({ form, name }: { form: any; name: string }) {
  const { workTypes, isLoading } = useWorkTypesData();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }: any) => (
        <FormItem>
          <FormLabel>نوع العمل *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "جاري التحميل..." : "اختر نوع العمل"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {workTypes?.map((type: any) => (
                <SelectItem key={type.id} value={type.name}>
                  {type.name}
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
