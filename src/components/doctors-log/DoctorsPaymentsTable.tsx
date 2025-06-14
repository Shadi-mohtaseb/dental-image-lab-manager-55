
import { useDoctors } from "@/hooks/useDoctors";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DoctorPaymentDialog from "./DoctorPaymentDialog";
import { useState } from "react";

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

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h2 className="text-lg font-bold mb-3">دفعات الأطباء</h2>
      <table className="min-w-full table-auto mb-2">
        <thead>
          <tr>
            <th className="py-2 px-3 text-right">اسم الطبيب</th>
            <th className="py-2 px-3 text-right">إجمالي المستحق</th>
            <th className="py-2 px-3 text-right">المدفوع</th>
            <th className="py-2 px-3 text-right">الدين/المتبقي</th>
            <th className="py-2 px-3 text-right">إضافة دفعة</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc: any) => {
            const { totalCases, totalPayments, remaining } = getDoctorAmounts(doc.id);
            return (
              <tr key={doc.id}>
                <td className="py-2 px-3">{doc.name}</td>
                <td className="py-2 px-3">{totalCases.toFixed(2)} ₪</td>
                <td className="py-2 px-3">{totalPayments.toFixed(2)} ₪</td>
                <td className="py-2 px-3">
                  <Badge variant={remaining > 0 ? "destructive" : "default"}>
                    {remaining > 0 ? `${remaining.toFixed(2)} ₪ دين` : "لا يوجد دين"}
                  </Badge>
                </td>
                <td className="py-2 px-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setDialogOpen(true);
                    }}
                  >
                    إضافة دفعة
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* نموذج إضافة دفعة */}
      <DoctorPaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        doctor={selectedDoctor}
      />
    </div>
  );
}

