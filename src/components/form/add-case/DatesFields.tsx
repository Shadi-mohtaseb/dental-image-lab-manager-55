
import { useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export function DatesFields({ form }: { form: any }) {
  // ضبط "تاريخ الاستلام" افتراضياً على اليوم إن لم يكن محدداً
  useEffect(() => {
    const currentValue = form.getValues("delivery_date");
    if (!currentValue) {
      const today = new Date();
      const isoToday = today.toISOString().split('T')[0];
      form.setValue("delivery_date", isoToday);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* حقل تاريخ الاستلام (إجباري مع إمكانية التعديل) */}
      <FormField
        control={form.control}
        name="delivery_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تاريخ الاستلام *</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ms-2 h-4 w-4 opacity-50" />
                    {field.value
                      ? format(new Date(field.value), "yyyy-MM-dd")
                      : <span>اختر تاريخ الاستلام</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // نزبط القيمة لكي ترسلها للاستمارة iso-date فقط (yyyy-MM-dd)
                      const d = date.toISOString().split('T')[0];
                      field.onChange(d);
                    }
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
      {/* حقل تاريخ التسليم (اختياري) */}
      <FormField
        control={form.control}
        name="submission_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تاريخ التسليم (اختياري)</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ms-2 h-4 w-4 opacity-50" />
                    {field.value
                      ? format(new Date(field.value), "yyyy-MM-dd")
                      : <span>اختر تاريخ التسليم (اختياري)</span>}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const d = date.toISOString().split('T')[0];
                      field.onChange(d);
                    } else {
                      field.onChange(""); // السماح بحذف التاريخ
                    }
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

