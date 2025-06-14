
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function ToothNumberField({ form }: { form: any }) {
  return (
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
  );
}
