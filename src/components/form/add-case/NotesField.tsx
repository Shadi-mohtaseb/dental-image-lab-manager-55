
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export function NotesField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>ملاحظات</FormLabel>
          <FormControl>
            <Textarea placeholder="ملاحظات إضافية" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
