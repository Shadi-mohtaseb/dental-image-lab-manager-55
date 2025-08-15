import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddExpense } from "@/hooks/useExpenses";
import { useExpenseTypesData } from "@/components/expense-types/useExpenseTypesData";
import { ExpenseTypesDialog } from "@/components/expense-types/ExpenseTypesDialog";

const formSchema = z.object({
  expense_type_id: z.string().min(1, "نوع المصروف مطلوب"),
  total_amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال المبلغ" }).min(0.01, "المبلغ يجب أن يكون أكبر من صفر")
  ),
  purchase_date: z.string().min(1, "تاريخ المصروف مطلوب"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddExpenseFormProps {
  onSuccess: () => void;
}

export function AddExpenseForm({ onSuccess }: AddExpenseFormProps) {
  const { expenseTypes } = useExpenseTypesData();
  const addExpense = useAddExpense();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expense_type_id: "",
      total_amount: undefined,
      purchase_date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addExpense.mutateAsync({
        expense_type_id: data.expense_type_id,
        total_amount: data.total_amount,
        purchase_date: data.purchase_date,
        notes: data.notes || "",
      });
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="purchase_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ المصروف *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expense_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع المصروف *</FormLabel>
              <div className="flex gap-2">
                <FormControl className="flex-1">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المصروف" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <ExpenseTypesDialog />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المبلغ (شيكل) *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0} 
                  step={0.01} 
                  placeholder="0.00" 
                  {...field} 
                  value={field.value || ""}
                />
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
                <Textarea placeholder="ملاحظات إضافية..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button type="submit" disabled={addExpense.isPending}>
            {addExpense.isPending ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </div>
      </form>
    </Form>
  );
}