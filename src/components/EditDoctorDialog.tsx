
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
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "يرجى إدخال رقم صالح" }).min(0, "يرجى إدخال السعر")
  ),
});

type FormData = z.infer<typeof formSchema>;

export function EditDoctorDialog({ doctor }: { doctor: { id: string; name: string; price: number } }) {
  const [open, setOpen] = useState(false);
  const updateDoctor = useUpdateDoctor();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: doctor.name,
      price: doctor.price,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await updateDoctor.mutateAsync({
        id: doctor.id,
        name: data.name,
        price: data.price,
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
            تعديل اسم الطبيب أو سعر الطبيب (شيكل)
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
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السعر (شيكل) *</FormLabel>
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
