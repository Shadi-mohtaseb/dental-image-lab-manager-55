
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddExpense } from "@/hooks/useExpenses";
import { useExpenseTypesData } from "@/components/expense-types/useExpenseTypesData";
import { Receipt } from "lucide-react";

const formSchema = z.object({
  item_name: z.string().min(2, "اسم المنتج مطلوب"),
  expense_type_id: z.string().min(1, "نوع المصروف مطلوب"),
  description: z.string().optional(),
  quantity: z.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
  unit_price: z.number().min(0, "السعر يجب أن يكون موجباً"),
  purchase_date: z.string(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const addExpense = useAddExpense();
  const { expenseTypes, isLoading: typesLoading } = useExpenseTypesData();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_name: "",
      expense_type_id: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      purchase_date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const selectedExpenseType = form.watch("expense_type_id");
  const selectedType = expenseTypes.find(type => type.id === selectedExpenseType);
  const showQuantityField = selectedType?.name === "مادة";

  const onSubmit = async (data: FormData) => {
    try {
      const totalAmount = data.quantity * data.unit_price;
      await addExpense.mutateAsync({
        item_name: data.item_name,
        description: data.description || null,
        quantity: data.quantity,
        unit_price: data.unit_price,
        total_amount: totalAmount,
        purchase_date: data.purchase_date,
        notes: data.notes || null,
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
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Receipt className="w-4 h-4 mr-2" />
          إضافة مصروف جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة مصروف جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل المصروف لإضافته إلى النظام
          </DialogDescription>
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
                    <Input placeholder="مواد طبية" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المصروف" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typesLoading ? (
                        <SelectItem value="" disabled>جاري التحميل...</SelectItem>
                      ) : expenseTypes.length === 0 ? (
                        <SelectItem value="" disabled>لا توجد أنواع مصروفات</SelectItem>
                      ) : (
                        expenseTypes.map((type: any) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                      )}
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
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف المنتج" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              {showQuantityField && (
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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    <Textarea placeholder="ملاحظات إضافية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 gap-2">
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
