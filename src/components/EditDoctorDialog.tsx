
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
import { useUpdateDoctor } from "@/hooks/useDoctors";
import { Edit } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "اسم الطبيب مطلوب"),
  phone: z.string().min(7, "رقم الهاتف مطلوب").max(20, "رقم الهاتف طويل جداً").optional(),
});

type FormData = z.infer<typeof formSchema>;

export function EditDoctorDialog({
  doctor,
}: {
  doctor: { id: string; name: string; phone?: string };
}) {
  const [open, setOpen] = useState(false);
  const updateDoctor = useUpdateDoctor();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: doctor.name,
      phone: doctor.phone ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateDoctor.mutateAsync({
        id: doctor.id,
        name: data.name,
        phone: data.phone ?? "",
        zircon_price: 0, // قيمة افتراضية للتوافق مع النظام
        temp_price: 0, // قيمة افتراضية للتوافق مع النظام
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating doctor:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" title="تعديل">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الطبيب</DialogTitle>
          <DialogDescription>
            تعديل اسم الطبيب ورقم الهاتف
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={updateDoctor.isPending}>
                {updateDoctor.isPending ? "جاري التعديل..." : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
