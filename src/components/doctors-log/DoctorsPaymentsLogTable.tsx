import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import EditDoctorPaymentDialog from "./EditDoctorPaymentDialog";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2, Youtube } from "lucide-react";
import { buildWhatsappLink } from "@/utils/whatsapp";

// SVG خاص بأيقونة واتساب (مأخوذ من أيقونات المصادر الحرة)
const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className ?? "w-4 h-4"}
  >
    <path
      d="M16.7 13.24a4 4 0 0 1-2.11-.57l-.36-.21a9.51 9.51 0 0 1-3.61-3.61l-.19-.35A4 4 0 0 1 7 7.31V7.3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1c.1.77.34 1.53.67 2.22.12.22.2.46.39.56l.23.13A7.45 7.45 0 0 0 14.13 13l.14.21a.94.94 0 0 1-.14 1.1 1 1 0 0 1-.67.26Zm-4.6 5.08a9 9 0 1 1 5.62-16A9 9 0 0 1 12.1 18.32ZM21 12.07A9 9 0 1 1 12.09 3a9 9 0 0 1 8.91 9.07ZM12 2v1m0 18v1m10-10h-1m-18 0H2"
    />
    <circle cx="12" cy="12" r="9" />
    <path
      d="M16.7 13.24a4 4 0 0 1-2.11-.57l-.36-.21a9.51 9.51 0 0 1-3.61-3.61l-.19-.35A4 4 0 0 1 7 7.31V7.3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1c.1.77.34 1.53.67 2.22.12.22.2.46.39.56l.23.13A7.45 7.45 0 0 0 14.13 13l.14.21a.94.94 0 0 1-.14 1.1 1 1 0 0 1-.67.26Z"
      fill="currentColor"
    />
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
            <TableHead className="text-center w-[120px]">واتساب</TableHead>
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
                {/* عمود واتساب */}
                <TableCell className="text-center w-[120px]">
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
                        <WhatsappIcon />
                      </Button>
                    </a>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </TableCell>
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
