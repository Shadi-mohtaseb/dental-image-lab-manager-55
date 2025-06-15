
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function SubmissionAndDeliveryDatesFields({ form }: { form: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {/* تاريخ التسليم (اختياري) */}
      <FormField
        control={form.control}
        name="delivery_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تاريخ التسليم</FormLabel>
            <FormControl>
              <input
                type="date"
                className="input input-bordered w-full p-2 border rounded"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* تاريخ الاستلام (قابل للتعديل) */}
      <FormField
        control={form.control}
        name="submission_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تاريخ الاستلام</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full flex justify-between items-center",
                      !field.value && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    {field.value
                      ? format(new Date(field.value), "yyyy-MM-dd")
                      : <span>اختر التاريخ</span>}
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
