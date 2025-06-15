
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import EditDoctorPaymentDialog from "./EditDoctorPaymentDialog";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2, Whatsapp } from "lucide-react";
import { buildWhatsappLink } from "@/utils/whatsapp";

export default function DoctorsPaymentsLogTable() {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // جلب جميع دفعات الأطباء بدون join
  const { data: payments = [] } = useQuery({
    queryKey: ["doctor_transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // جلب جميع الأطباء لربط الدفعة بالاسم ورقم الهاتف يدويًا
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, phone");
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الدفعة؟")) {
      const { error } = await supabase
        .from("doctor_transactions")
        .delete()
        .eq("id", id);
      if (!error) {
        toast({ title: "تم حذف الدفعة بنجاح" });
        queryClient.invalidateQueries({ queryKey: ["doctor_transactions"] });
      } else {
        toast({ title: "حدث خطأ أثناء الحذف", variant: "destructive" });
      }
    }
  };

  // دوال مساعدة
  const getDoctor = (doctor_id: string) => {
    return doctors.find((d: any) => d.id === doctor_id);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right w-[180px]">اسم الطبيب</TableHead>
            <TableHead className="text-center w-[110px]">المبلغ</TableHead>
            <TableHead className="text-center w-[130px]">طريقة الدفع</TableHead>
            <TableHead className="text-center w-[130px]">التاريخ</TableHead>
            <TableHead className="text-center w-[160px]">ملاحظات</TableHead>
            <TableHead className="text-center w-[180px]">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment: any) => {
            const doctor = getDoctor(payment.doctor_id);
            const hasPhone =
              doctor?.phone &&
              typeof doctor.phone === "string" &&
              doctor.phone.trim() !== "";

            // إعداد رسالة افتراضية للواتساب
            const waMessage = doctor
              ? `تم تسجيل دفعة بمبلغ ${Number(payment.amount).toFixed(2)}₪ بتاريخ ${payment.transaction_date} للطبيب ${doctor.name}.`
              : "";

            // تجهيز رابط الواتساب إذا توفر
            const waLink =
              hasPhone && waMessage
                ? buildWhatsappLink(doctor.phone, waMessage)
                : "";

            return (
              <TableRow key={payment.id}>
                <TableCell className="text-right w-[180px]">{doctor?.name ?? "-"}</TableCell>
                <TableCell className="text-center w-[110px]">{Number(payment.amount).toFixed(2)} ₪</TableCell>
                <TableCell className="text-center w-[130px]">
                  <Badge>{payment.payment_method ?? "بدون"}</Badge>
                </TableCell>
                <TableCell className="text-center w-[130px]">{payment.transaction_date}</TableCell>
                <TableCell className="text-center w-[160px]">{payment.notes || "-"}</TableCell>
                <TableCell className="text-center w-[180px]">
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline"
                      onClick={() => { setSelectedPayment(payment); setEditOpen(true); }}>
                      <Edit />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600"
                      onClick={() => handleDelete(payment.id)}>
                      <Trash2 />
                    </Button>
                    {hasPhone && waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`إرسال رسالة واتساب للطبيب ${doctor?.name}`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          type="button"
                          tabIndex={-1}
                          asChild
                        >
                          <Whatsapp />
                        </Button>
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <EditDoctorPaymentDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedPayment(null);
        }}
        payment={selectedPayment}
      />
    </div>
  );
}
