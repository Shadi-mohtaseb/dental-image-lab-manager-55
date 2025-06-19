
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkTypesManagementDialog } from "@/components/work-types/WorkTypesManagementDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function WorkTypeSelect({ form, name }: { form: any; name: string }) {
  // جلب أنواع العمل من قاعدة البيانات
  const { data: workTypes = [] } = useQuery({
    queryKey: ["work_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_types" as any)
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }: any) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            نوع العمل *
            <WorkTypesManagementDialog />
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع العمل" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {workTypes.map((type: any) => (
                <SelectItem key={type.id} value={type.name}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
