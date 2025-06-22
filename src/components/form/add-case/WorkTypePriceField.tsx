
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function WorkTypePriceField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
      name="work_type_price"
      render={({ field }) => (
        <FormItem>
          <FormLabel>سعر نوع العمل (شيكل) *</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="سعر الوحدة لنوع العمل"
              {...field}
              onChange={(e) => {
                const value = e.target.value === "" ? 0 : Number(e.target.value);
                field.onChange(value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
