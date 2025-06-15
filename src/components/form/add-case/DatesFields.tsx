
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function DatesFields({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* حقل تاريخ الاستلام (إجباري، افتراضي اليوم) */}
      <FormField
        control={form.control}
        name="delivery_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تاريخ الاستلام *</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                // اجعل القيمة الافتراضية لتاريخ اليوم من defaultValues وليس هنا!
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* حقل تاريخ التسليم (اختياري) */}
      <FormField
        control={form.control}
        name="submission_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تاريخ التسليم</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
