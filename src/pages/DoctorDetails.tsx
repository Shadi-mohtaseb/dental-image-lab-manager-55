
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const DoctorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // جلب بيانات الطبيب
  const { data: doctor, isLoading: doctorLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // جلب الحالات الخاصة بالطبيب
  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ["cases", { doctor_id: id }],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("doctor_id", id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  // جلب سجل دفعات الطبيب
  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["doctor_transactions", { doctor_id: id }],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("doctor_transactions")
        .select("*")
        .eq("doctor_id", id)
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  // حساب العدد الإجمالي للأسنان عبر الحالات
  const totalTeeth = cases.reduce((sum: number, c: any) => {
    // أولاً نتحقق من وجود number_of_teeth (عدد أسنان عددي وصريح)
    if (c?.number_of_teeth && Number(c.number_of_teeth) > 0) {
      return sum + Number(c.number_of_teeth);
    }
    // إذا لم يوجد، نعود للطريقة القديمة بتحليل نص tooth_number
    if (c?.tooth_number) {
      return sum + c.tooth_number.split(" ").filter(Boolean).length;
    }
    return sum;
  }, 0);

  // حساب ملخص الدفعات والديون
  const totalDue = transactions
    .filter((tx: any) => tx.transaction_type === "مستحق")
    .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

  const totalPaid = transactions
    .filter((tx: any) => tx.transaction_type === "دفعة")
    .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);

  const remaining = totalDue - totalPaid;

  if (doctorLoading || casesLoading || txLoading) {
    return (
      <div className="p-8 text-center text-lg">جاري تحميل بيانات الطبيب...</div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-8 text-center text-red-600">
        لم يتم العثور على الطبيب
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
        <ArrowRight className="w-4 h-4" />
        العودة لحسابات الأطباء
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>بيانات الطبيب: {doctor.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">الاسم:</span> {doctor.name}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">رقم الهاتف:</span> {doctor.phone || "-"}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">البريد الإلكتروني:</span> {doctor.email || "-"}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">السعر الزيركون:</span> {doctor.zircon_price} شيكل
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">السعر المؤقت:</span> {doctor.temp_price} شيكل
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">العنوان:</span> {doctor.address || "-"}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">التخصص:</span> {doctor.specialty || "-"}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">إجمالي عدد الحالات:</span> {cases.length}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">إجمالي عدد الأسنان:</span> {totalTeeth}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول الدفعات */}
      <Card>
        <CardHeader>
          <CardTitle>دفعات الطبيب</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>النوع</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    لا توجد دفعات أو مستحقات لهذا الطبيب
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Badge variant={tx.transaction_type === "دفعة" ? "default" : "destructive"}>
                        {tx.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{Number(tx.amount).toFixed(2)} ₪</TableCell>
                    <TableCell>{tx.payment_method || "-"}</TableCell>
                    <TableCell>{tx.transaction_date}</TableCell>
                    <TableCell>{tx.notes || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* ملخص */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-6 text-base font-semibold">
            <div>
              إجمالي المستحق: <span className="text-red-600">{totalDue.toFixed(2)} ₪</span>
            </div>
            <div>
              المدفوع: <span className="text-green-700">{totalPaid.toFixed(2)} ₪</span>
            </div>
            <div>
              الدين المتبقي:{" "}
              {remaining > 0 ? (
                <span className="text-orange-600">{remaining.toFixed(2)} ₪</span>
              ) : (
                <span className="text-green-600">لا يوجد دين</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول الحالات */}
      <Card>
        <CardHeader>
          <CardTitle>حالات الطبيب ({cases.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المريض</TableHead>
                <TableHead>تاريخ الإستلام</TableHead>
                <TableHead>نوع العمل</TableHead>
                <TableHead>عدد الأسنان</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    لا توجد حالات لهذا الطبيب
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.patient_name}</TableCell>
                    <TableCell>{c.submission_date}</TableCell>
                    <TableCell>{c.work_type}</TableCell>
                    <TableCell>
                      {c.tooth_number ? c.tooth_number.split(" ").filter(Boolean).length : 0}
                    </TableCell>
                    <TableCell>{c.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDetails;
