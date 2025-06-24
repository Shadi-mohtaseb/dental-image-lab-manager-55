
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import EditDoctorPaymentDialog from "./EditDoctorPaymentDialog";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2, MessageCircle } from "lucide-react";
import { buildWhatsappLink } from "@/utils/whatsapp";

// أيقونة واتساب مطابقة للصورة (outline فقط وبخط أخضر)
const WhatsappOutlineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#22c55e"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className ?? "w-6 h-6"}
  >
    <rect x="2.5" y="2.5" width="19" height="19" rx="6" stroke="#a0edc1" fill="none" />
    <path d="M7 11.8C7 9.61177 8.78993 7.8 11 7.8C12.0417 7.8 13.0137 8.24376 13.7141 9.00336L13.8889 8.8M17 16.2C17 18.3882 15.2101 20.2 13 20.2C11.9583 20.2 10.9863 19.7562 10.2859 18.9966L10.1111 19.2M9 15.8C9 15.3582 9.33579 15 9.75 15H14.25C14.6642 15 15 15.3582 15 15.8V16.2C15 16.6418 14.6642 17 14.25 17H9.75C9.33579 17 9 16.6418 9 16.2V15.8Z" stroke="#22c55e" />
  </svg>
);

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

  // جلب الحالات لحساب المتبقي للطبيب
  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*");
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

  // حساب المتبقي للطبيب
  function getDoctorRemaining(doctor_id: string) {
    const doctorCases = cases.filter((c: any) => c.doctor_id === doctor_id);
    const totalCases = doctorCases.reduce((sum: number, c: any) => sum + (Number(c.price) || 0), 0);

    const doctorTxs = payments.filter((tx: any) => tx.doctor_id === doctor_id && tx.transaction_type === "دفعة");
    const totalPayments = doctorTxs.reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);

    return (totalCases - totalPayments);
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right w-[150px]">اسم الطبيب</TableHead>
            <TableHead className="text-center w-[100px]">المبلغ</TableHead>
            <TableHead className="text-center w-[110px]">طريقة الدفع</TableHead>
            <TableHead className="text-center w-[110px]">التاريخ</TableHead>
            <TableHead className="text-center w-[120px]">تاريخ صرف الشيك</TableHead>
            <TableHead className="text-center w-[130px]">ملاحظات</TableHead>
            <TableHead className="text-center w-[100px]">واتساب</TableHead>
            <TableHead className="text-center w-[150px]">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment: any) => {
            const doctor = getDoctor(payment.doctor_id);
            const hasPhone =
              doctor?.phone &&
              typeof doctor.phone === "string" &&
              doctor.phone.trim() !== "";

            // حساب المتبقي للطبيب
            const remaining = getDoctorRemaining(payment.doctor_id);

            // رسالة واتساب محدثة حسب المطلوب
            const waMessage = doctor
              ? `مرحبا ${doctor.name}\n\nتم استلام دفعة ${payment.payment_method ?? "نقدي"} بمبلغ ${Number(payment.amount).toFixed(2)}₪\n\nبتاريخ ${payment.transaction_date}\n\nالمبلغ المتبقي عليك : ${remaining.toFixed(2)}₪`
              : "";

            // تجهيز رابط الواتساب إذا توفر
            const waLink =
              hasPhone && waMessage
                ? buildWhatsappLink(doctor.phone, waMessage)
                : "";

            return (
              <TableRow key={payment.id}>
                <TableCell className="text-right w-[150px]">{doctor?.name ?? "-"}</TableCell>
                <TableCell className="text-center w-[100px]">{Number(payment.amount).toFixed(2)} ₪</TableCell>
                <TableCell className="text-center w-[110px]">
                  <Badge>{payment.payment_method ?? "بدون"}</Badge>
                </TableCell>
                <TableCell className="text-center w-[110px]">{payment.transaction_date}</TableCell>
                <TableCell className="text-center w-[120px]">
                  {payment.payment_method === "شيك" && payment.check_cash_date 
                    ? payment.check_cash_date 
                    : payment.payment_method === "شيك" 
                      ? <span className="text-gray-400">غير محدد</span>
                      : "-"
                  }
                </TableCell>
                <TableCell className="text-center w-[130px]">{payment.notes || "-"}</TableCell>
                {/* عمود واتساب */}
                <TableCell className="text-center w-[100px]">
                  {hasPhone && waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`إرسال عبر واتساب للطبيب ${doctor?.name}`}
                    >
                      <Button
                        size="icon"
                        variant="outline"
                        className="text-green-600 border-green-300 hover:bg-green-50"
                        type="button"
                      >
                        <MessageCircle />
                      </Button>
                    </a>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center w-[150px]">
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline"
                      onClick={() => { setSelectedPayment(payment); setEditOpen(true); }}>
                      <Edit />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600"
                      onClick={() => handleDelete(payment.id)}>
                      <Trash2 />
                    </Button>
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
