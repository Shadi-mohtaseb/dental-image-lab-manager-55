
import { TeethCountField } from "./TeethCountField";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function TeethDetailsFields({
  form
}: {
  form: any;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <TeethCountField form={form} />
      {/* حقل اللون كنص */}
      <FormField 
        control={form.control} 
        name="shade" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>اللون</FormLabel>
            <FormControl>
              <Input placeholder="اكتب اللون (مثال: A2)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
      {/* حقل نوع بلوك الزيركون كنص */}
      <FormField 
        control={form.control} 
        name="zircon_block_type" 
        render={({ field }) => (
          <FormItem>
            <FormLabel>نوع المادة</FormLabel>
            <FormControl>
              <Input placeholder="اكتب نوع البلوك" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} 
      />
    </div>
  );
}
