
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "اسم الطبيب مطلوب"),
  phone: z.string().min(7, "رقم الهاتف مطلوب").max(20, "رقم الهاتف طويل جداً").optional(),
  workTypePrices: z.record(z.string(), z.number().min(0, "السعر يجب أن يكون صفر أو أكثر")),
});

type FormData = z.infer<typeof formSchema>;

export function AddDoctorDialog() {
  const [open, setOpen] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState<string>("");
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
        workTypePrices: data.workTypePrices,
      });
      form.reset();
      setSelectedWorkType("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  const handleWorkTypeSelect = (workTypeId: string) => {
    setSelectedWorkType(workTypeId);
  };

  const getCurrentWorkTypePrice = (workTypeId: string): number => {
    return form.watch("workTypePrices")[workTypeId] || 0;
  };

  const updateWorkTypePrice = (workTypeId: string, price: number) => {
    const currentPrices = form.getValues("workTypePrices");
    form.setValue("workTypePrices", {
      ...currentPrices,
      [workTypeId]: price
    });
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
                {/* قائمة منسدلة لاختيار نوع العمل */}
                <div>
                  <FormLabel>اختر نوع العمل لتعديل سعره</FormLabel>
                  <Select value={selectedWorkType} onValueChange={handleWorkTypeSelect}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="اختر نوع العمل" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {workTypes.map((workType: any) => (
                        <SelectItem key={workType.id} value={workType.id}>
                          {workType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* عرض حقل السعر للنوع المحدد */}
                {selectedWorkType && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <FormLabel className="text-base font-medium">
                      سعر {workTypes.find((wt: any) => wt.id === selectedWorkType)?.name} (شيكل)
                    </FormLabel>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="0"
                      value={getCurrentWorkTypePrice(selectedWorkType)}
                      onChange={(e) => updateWorkTypePrice(selectedWorkType, Number(e.target.value) || 0)}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* عرض جميع الأسعار المحددة */}
                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium text-gray-600">ملخص الأسعار المحددة:</FormLabel>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {workTypes.map((workType: any) => {
                      const price = getCurrentWorkTypePrice(workType.id);
                      return (
                        <div key={workType.id} className="flex justify-between items-center text-sm p-2 bg-white rounded border">
                          <span>{workType.name}</span>
                          <span className="font-bold text-green-600">{price} شيكل</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setSelectedWorkType("");
                }}
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
