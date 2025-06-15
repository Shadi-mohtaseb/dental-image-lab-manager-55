import { useDoctors } from "@/hooks/useDoctors";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DoctorPaymentDialog from "./DoctorPaymentDialog";
import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { buildWhatsappLink } from "@/utils/whatsapp";
import { MessageCircle } from "lucide-react";

interface DoctorsPaymentsTableProps {}

export default function DoctorsPaymentsTable({ }: DoctorsPaymentsTableProps) {
  const { data: doctors = [], isLoading } = useDoctors();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // جلب جميع الدفعات للطبيب
  const { data: doctorPayments = [] } = useQuery({
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

  // جلب جميع الحالات
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

  // حساب المستحق والمدفوع والمتبقي لكل طبيب
  function getDoctorAmounts(doctorId: string) {
    // المستحق = مجموع أسعار الحالات لهذا الطبيب
    const doctorCases = cases.filter((c: any) => c.doctor_id === doctorId);
    const totalCases = doctorCases.reduce((sum: number, c: any) => sum + (Number(c.price) || 0), 0);

    // المدفوع = مجموع الدفعات من جدول doctor_transactions
    const doctorTxs = doctorPayments.filter((tx: any) => tx.doctor_id === doctorId && tx.transaction_type === "دفعة");
    const totalPayments = doctorTxs.reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);

    // الباقي
    return {
      totalCases,
      totalPayments,
      remaining: totalCases - totalPayments,
    };
  }

  // رسالة واتساب للدفعة
  function getPaymentMsg(doc: any, remaining: number) {
    return `مرحبًا ${doc?.name}\nنود تذكيركم بأن مبلغ المستحق المتبقي عليك هو: ${remaining.toFixed(2)} ₪. إذا كان لديكم أي استفسار يرجى التواصل معنا. شكرًا لتعاملكم معنا`;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h2 className="text-lg font-bold mb-3">دفعات الأطباء</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right w-[180px]">اسم الطبيب</TableHead>
            <TableHead className="text-right w-[140px]">إجمالي المستحق</TableHead>
            <TableHead className="text-right w-[140px]">المدفوع</TableHead>
            <TableHead className="text-center w-[170px]">الدين/المتبقي</TableHead>
            <TableHead className="text-center w-[130px]">إضافة دفعة</TableHead>
            <TableHead className="text-center w-[88px]">واتساب</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doc: any) => {
            const { totalCases, totalPayments, remaining } = getDoctorAmounts(doc.id);
            return (
              <TableRow key={doc.id} className="align-middle">
                <TableCell className="text-blue-900 font-semibold text-right w-[180px]">{doc.name}</TableCell>
                <TableCell className="text-right w-[140px]">{totalCases.toFixed(2)} ₪</TableCell>
                <TableCell className="text-right w-[140px]">{totalPayments.toFixed(2)} ₪</TableCell>
                <TableCell className={`text-center w-[170px]`}>
                  <Badge variant={remaining > 0 ? "destructive" : "default"} className={remaining > 0 ? "bg-red-500 text-white" : "bg-green-100 text-green-700"}>
                    {remaining > 0 ? `${remaining.toFixed(2)} ₪ دين` : "لا يوجد دين"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center w-[130px]">
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setDialogOpen(true);
                    }}
                  >
                    إضافة دفعة
                  </Button>
                </TableCell>
                <TableCell className="text-center w-[88px]">
                  {doc.phone ? (
                    <a
                      href={buildWhatsappLink(doc.phone, getPaymentMsg(doc, remaining))}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="إرسال عبر واتساب"
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {/* نموذج إضافة دفعة */}
      <DoctorPaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        doctor={selectedDoctor}
      />
    </div>
  );
}
