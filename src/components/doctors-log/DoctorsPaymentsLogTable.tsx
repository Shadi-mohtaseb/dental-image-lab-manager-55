
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import EditDoctorPaymentDialog from "./EditDoctorPaymentDialog";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";

// حل المشكلة: جلب جميع الأطباء وربط كل دفعة باسم الطبيب الخاص بها يدويًا.
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

  // جلب جميع الأطباء لربط الدفعة بالاسم يدويًا
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name");
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

  // دالة مساعد للبحث عن اسم الطبيب بحسب doctor_id
  const getDoctorName = (doctor_id: string) => {
    const doc = doctors.find((d: any) => d.id === doctor_id);
    return doc?.name ?? "-";
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم الطبيب</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>طريقة الدفع</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>ملاحظات</TableHead>
            <TableHead>إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment: any) => (
            <TableRow key={payment.id}>
              <TableCell>{getDoctorName(payment.doctor_id)}</TableCell>
              <TableCell>{Number(payment.amount).toFixed(2)} ₪</TableCell>
              <TableCell>
                <Badge>{payment.payment_method ?? "بدون"}</Badge>
              </TableCell>
              <TableCell>{payment.transaction_date}</TableCell>
              <TableCell>{payment.notes || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
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
          ))}
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
