
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

const formSchema = z.object({
  description: z.string().min(1, "وصف المصروف مطلوب"),
  item_name: z.string().min(1, "اسم العنصر مطلوب"),
  total_amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال المبلغ" }).min(0, "المبلغ يجب أن يكون أكبر من صفر")
  ),
  unit_price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال سعر الوحدة" }).min(0, "سعر الوحدة يجب أن يكون أكبر من صفر")
  ),
  purchase_date: z.string().min(1, "تاريخ الشراء مطلوب"),
  quantity: z.preprocess(
    (val) => (val === "" ? 1 : Number(val)),
    z.number().min(1, "الكمية يجب أن تكون أكبر من صفر").optional()
  ),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const addExpense = useAddExpense();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      item_name: "",
      total_amount: 0,
      unit_price: 0,
      purchase_date: new Date().toISOString().split('T')[0],
      quantity: 1,
      notes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addExpense.mutateAsync({
        description: data.description,
        item_name: data.item_name,
        total_amount: data.total_amount,
        unit_price: data.unit_price,
        purchase_date: data.purchase_date,
        quantity: data.quantity || 1,
        notes: data.notes || "",
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
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم العنصر *</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: أدوات مكتبية" {...field} />
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
                  <FormLabel>وصف المصروف *</FormLabel>
                  <FormControl>
                    <Input placeholder="تفاصيل إضافية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="unit_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر الوحدة (شيكل) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Input placeholder="ملاحظات إضافية" {...field} />
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
