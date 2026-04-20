
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import EditDoctorPaymentDialog from "./EditDoctorPaymentDialog";
import { toast } from "@/hooks/use-toast";
import { Edit, Trash2, MessageCircle, Search } from "lucide-react";
import { buildWhatsappLink } from "@/utils/whatsapp";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortableHeader, SortDirection } from "@/components/ui/sortable-header";

export default function DoctorsPaymentsLogTable() {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");

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

  const getDoctor = (doctor_id: string) => doctors.find((d: any) => d.id === doctor_id);

  function getDoctorRemaining(doctor_id: string) {
    const doctorCases = cases.filter((c: any) => c.doctor_id === doctor_id);
    const totalCases = doctorCases.reduce((sum: number, c: any) => sum + (Number(c.price) || 0), 0);
    const doctorTxs = payments.filter((tx: any) => tx.doctor_id === doctor_id && tx.transaction_type === "دفعة");
    const totalPayments = doctorTxs.reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);
    return totalCases - totalPayments;
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((payment: any) => {
      const doctor = getDoctor(payment.doctor_id);
      const doctorName = doctor?.name ?? "";
      const matchesSearch = doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.notes ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (paymentMethodFilter !== "all" && (payment.payment_method ?? "نقدي") !== paymentMethodFilter) return false;
      if (doctorFilter !== "all" && payment.doctor_id !== doctorFilter) return false;
      return true;
    });
  }, [payments, searchQuery, paymentMethodFilter, doctorFilter, doctors]);

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

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم الطبيب أو الملاحظات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="فلترة حسب الطبيب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأطباء</SelectItem>
            {doctors.map((d: any) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="طريقة الدفع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="نقدي">نقدي</SelectItem>
            <SelectItem value="شيك">شيك</SelectItem>
            <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
          {filteredPayments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                لا توجد نتائج مطابقة
              </TableCell>
            </TableRow>
          ) : null}
          {filteredPayments.map((payment: any) => {
            const doctor = getDoctor(payment.doctor_id);
            const hasPhone = doctor?.phone && typeof doctor.phone === "string" && doctor.phone.trim() !== "";
            const remaining = getDoctorRemaining(payment.doctor_id);
            const waMessage = doctor
              ? `مرحبا ${doctor.name}\n\nتم استلام دفعة ${payment.payment_method ?? "نقدي"} بمبلغ ${Number(payment.amount).toFixed(2)}₪\n\nبتاريخ ${payment.transaction_date}\n\nالمبلغ المتبقي عليك : ${remaining.toFixed(2)}₪`
              : "";
            const waLink = hasPhone && waMessage ? buildWhatsappLink(doctor.phone, waMessage) : "";

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
                      ? <span className="text-muted-foreground">غير محدد</span>
                      : "-"
                  }
                </TableCell>
                <TableCell className="text-center w-[130px]">{payment.notes || "-"}</TableCell>
                <TableCell className="text-center w-[100px]">
                  {hasPhone && waLink ? (
                    <a href={waLink} target="_blank" rel="noopener noreferrer" title={`إرسال عبر واتساب للطبيب ${doctor?.name}`}>
                      <Button size="icon" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                        <MessageCircle />
                      </Button>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center w-[150px]">
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline"
                      onClick={() => { setSelectedPayment(payment); setEditOpen(true); }}>
                      <Edit />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive"
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