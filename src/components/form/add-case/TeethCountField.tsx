
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function TeethCountField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
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
              value={field.value || ""}
              onChange={e => {
                // فقط أرقام موجبة
                const value = e.target.value.replace(/[^0-9]/g, "");
                field.onChange(value ? Number(value) : "");
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
