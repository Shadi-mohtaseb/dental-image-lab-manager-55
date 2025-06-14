
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const shadeOptions = [
  "A1", "A2", "A3", "A3.5", "A4",
  "B1", "B2", "B3", "B4",
  "C1", "C2", "C3", "C4",
  "D2", "D3", "D4"
];

export function ShadeSelectField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
      name="shade"
      render={({ field }) => (
        <FormItem>
          <FormLabel>اللون</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="اختر اللون" />
              </SelectTrigger>
              <SelectContent>
                {shadeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
