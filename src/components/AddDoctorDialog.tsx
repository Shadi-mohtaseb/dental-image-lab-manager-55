
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
import { useAddDoctor } from "@/hooks/useDoctors";
import { UserPlus } from "lucide-react";
import { useWorkTypesData } from "@/components/work-types/useWorkTypesData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, "اسم الطبيب مطلوب"),
  phone: z.string().min(7, "رقم الهاتف مطلوب").max(20, "رقم الهاتف طويل جداً").optional(),
  workTypePrices: z.record(z.string(), z.number().min(0, "السعر يجب أن يكون صفر أو أكثر")),
});

type FormData = z.infer<typeof formSchema>;

export function AddDoctorDialog() {
  const [open, setOpen] = useState(false);
  const addDoctor = useAddDoctor();
  const { workTypes, isLoading: loadingWorkTypes } = useWorkTypesData();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      workTypePrices: {},
    },
  });

  // تهيئة الأسعار الافتراضية عند تحميل أنواع العمل
  useState(() => {
    if (workTypes.length > 0) {
      const defaultPrices: Record<string, number> = {};
      workTypes.forEach((workType: any) => {
        defaultPrices[workType.id] = 0;
      });
      form.setValue("workTypePrices", defaultPrices);
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      // إضافة الطبيب مع الأسعار الحديثة (سيتم التعامل مع هذا في الخطاف)
      await addDoctor.mutateAsync({
        name: data.name,
        phone: data.phone ?? "",
        zircon_price: 0, // قيمة مؤقتة للتوافق مع النظام القديم
        temp_price: 0, // قيمة مؤقتة للتوافق مع النظام القديم
        workTypePrices: data.workTypePrices,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  if (loadingWorkTypes) {
    return (
      <Button className="bg-blue-600 hover:bg-blue-700" disabled>
        <UserPlus className="w-4 h-4 mr-2" />
        جاري التحميل...
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          إضافة طبيب جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة طبيب جديد</DialogTitle>
          <DialogDescription>
            أدخل اسم الطبيب، رقم الهاتف، وأسعار العمل بالشيكل لكل نوع
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الطبيب *</FormLabel>
                  <FormControl>
                    <Input placeholder="د. أحمد محمد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="05XXXXXXXX"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">أسعار أنواع العمل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workTypes.map((workType: any) => (
                  <FormField
                    key={workType.id}
                    control={form.control}
                    name={`workTypePrices.${workType.id}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{workType.name} (شيكل)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0} 
                            step={0.01} 
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={addDoctor.isPending}>
                {addDoctor.isPending ? "جاري الإضافة..." : "إضافة الطبيب"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
