
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useUpdateExpense } from "@/hooks/useExpenses";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";

const schema = z.object({
  item_name: z.string().min(2, "اسم المنتج مطلوب"),
  description: z.string().optional(),
  quantity: z.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
  unit_price: z.number().min(0, "السعر يجب أن يكون موجباً"),
  purchase_date: z.string(),
  notes: z.string().optional(),
});

export function EditExpenseDialog({ open, onOpenChange, expenseData }) {
  const updateExpense = useUpdateExpense();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      item_name: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      purchase_date: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (expenseData) {
      form.reset({ ...expenseData });
    }
  }, [expenseData, form]);

  const onSubmit = async (data) => {
    if (!expenseData) return;
    const res = await updateExpense.mutateAsync({
      ...expenseData,
      ...data,
      total_amount: data.quantity * data.unit_price,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل المصروف</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المنتج *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكمية *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر للوحدة *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ الشراء *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={updateExpense.isPending}>
                {updateExpense.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
