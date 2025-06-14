
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم الطبيب</TableHead>
            <TableHead>إجمالي المستحق</TableHead>
            <TableHead>المدفوع</TableHead>
            <TableHead>الدين/المتبقي</TableHead>
            <TableHead>إضافة دفعة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doc: any) => {
            const { totalCases, totalPayments, remaining } = getDoctorAmounts(doc.id);
            return (
              <TableRow key={doc.id}>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{totalCases.toFixed(2)} ₪</TableCell>
                <TableCell>{totalPayments.toFixed(2)} ₪</TableCell>
                <TableCell>
                  <Badge variant={remaining > 0 ? "destructive" : "default"}>
                    {remaining > 0 ? `${remaining.toFixed(2)} ₪ دين` : "لا يوجد دين"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setDialogOpen(true);
                    }}
                  >
                    إضافة دفعة
                  </Button>
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
