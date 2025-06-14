
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

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

  // حساب العدد الإجمالي للأسنان عبر الحالات
  const totalTeeth = cases.reduce((sum: number, c: any) => {
    // tooth_number: مثال "11 12 13"
    if (c?.tooth_number) {
      return sum + c.tooth_number.split(" ").filter(Boolean).length;
    }
    return sum;
  }, 0);

  if (doctorLoading || casesLoading) {
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
