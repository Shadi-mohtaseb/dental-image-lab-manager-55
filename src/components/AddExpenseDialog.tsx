
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddExpense } from "@/hooks/useExpenses";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  description: z.string().min(1, "وصف المصروف مطلوب"),
  total_amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال المبلغ" }).min(0, "المبلغ يجب أن يكون أكبر من صفر")
  ),
  purchase_date: z.string().min(1, "تاريخ الشراء مطلوب"),
  expense_type_id: z.string().min(1, "نوع المصروف مطلوب"),
  quantity: z.preprocess(
    (val) => (val === "" ? 1 : Number(val)),
    z.number().min(1, "الكمية يجب أن تكون أكبر من صفر").optional()
  ),
});

type FormData = z.infer<typeof formSchema>;

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const addExpense = useAddExpense();

  // جلب أنواع المصاريف
  const { data: expenseTypes = [] } = useQuery({
    queryKey: ["expense_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_types" as any)
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      total_amount: 0,
      purchase_date: new Date().toISOString().split('T')[0],
      expense_type_id: "",
      quantity: 1,
    },
  });

  const selectedExpenseType = form.watch("expense_type_id");
  const selectedType = expenseTypes.find((type: any) => type.id === selectedExpenseType);
  const isMaterial = selectedType?.name === "مادة";

  const onSubmit = async (data: FormData) => {
    try {
      await addExpense.mutateAsync({
        description: data.description,
        total_amount: data.total_amount,
        purchase_date: data.purchase_date,
        expense_type_id: data.expense_type_id,
        quantity: isMaterial ? data.quantity : 1,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          إضافة مصروف جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة مصروف جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل المصروف الجديد
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="expense_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المصروف *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المصروف" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseTypes.map((type: any) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف المصروف *</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: أدوات مكتبية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isMaterial && (
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكمية</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="total_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ الإجمالي (شيكل) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={addExpense.isPending}>
                {addExpense.isPending ? "جاري الإضافة..." : "إضافة المصروف"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
