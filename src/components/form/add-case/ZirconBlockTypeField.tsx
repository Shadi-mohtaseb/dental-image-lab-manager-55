
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const zirconBlockOptions = [
  "Amann Girrbach",
  "Aidite",
  "VITA",
  "Ivoclar",
  "Upcera",
  "ليبخة أخرى"
];

export function ZirconBlockTypeField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
      name="zircon_block_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>نوع بلوك الزيركون</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="اختر نوع البلوك" />
              </SelectTrigger>
              <SelectContent>
                {zirconBlockOptions.map((option) => (
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
