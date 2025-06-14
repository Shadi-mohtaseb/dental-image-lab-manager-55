
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function PriceField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
      name="price"
      render={({ field }) => (
        <FormItem>
          <FormLabel>السعر (شيكل) *</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="0"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
