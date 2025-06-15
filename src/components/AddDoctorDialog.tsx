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

const formSchema = z.object({
  name: z.string().min(2, "اسم الطبيب مطلوب"),
  phone: z.string().min(7, "رقم الهاتف مطلوب").max(20, "رقم الهاتف طويل جداً").optional(),
  zircon_price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال سعر الزيركون" }).min(0, "يرجى إدخال السعر")
  ),
  temp_price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال سعر المؤقت" }).min(0, "يرجى إدخال السعر")
  ),
});

type FormData = z.infer<typeof formSchema>;

export function AddDoctorDialog() {
  const [open, setOpen] = useState(false);
  const addDoctor = useAddDoctor();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      zircon_price: 0,
      temp_price: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addDoctor.mutateAsync({
        name: data.name,
        phone: data.phone ?? "",
        zircon_price: data.zircon_price,
        temp_price: data.temp_price,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          إضافة طبيب جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
            <FormField
              control={form.control}
              name="zircon_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر الزيركون (شيكل) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="temp_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سعر المؤقت (شيكل) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} placeholder="0" {...field} />
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
