import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { WorkTypeSelect } from "../WorkTypeSelect";
import { TeethCountField } from "./TeethCountField";

export function TeethDetailsFields({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <WorkTypeSelect form={form} name="work_type" />
      <TeethCountField form={form} />
    </div>
  );
}
