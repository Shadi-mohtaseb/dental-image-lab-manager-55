import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DoctorAccountPDFButton } from "@/components/doctors-log/DoctorAccountPDFButton";
import { EditDoctorDialog } from "@/components/EditDoctorDialog";
import type { Doctor } from "@/hooks/useDoctors";
import { useDeleteDoctor } from "@/hooks/useDoctors";
import { useDoctorFinancialSummary } from "@/hooks/useDoctorFinancialSummary";

interface Props {
  doctors: Doctor[];
  cases: any[];
}

export default function DoctorAccountTable({ doctors, cases }: Props) {
  const [search, setSearch] = useState("");

  const deleteDoctor = useDeleteDoctor();

  // تصفية الأطباء بناءً على النص المدخل في البحث
  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) =>
      d.name?.toLowerCase()?.includes(search.trim().toLowerCase())
    );
  }, [doctors, search]);

  // دالة لحساب إجمالي الأسنان لطبيب معيّن بناءً على كل حالاته
  const calcTotalTeeth = (doctor_id: string) => {
    const doctorCases = cases.filter((c) => c.doctor_id === doctor_id);
    let total = 0;
    doctorCases.forEach(c => {
      if (c?.number_of_teeth && Number(c.number_of_teeth) > 0) {
        total += Number(c.number_of_teeth);
      } else if (c?.tooth_number) {
        total += c.tooth_number.split(" ").filter(Boolean).length;
      }
    });
    return total;
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف الطبيب؟")) {
      deleteDoctor.mutate(id);
    }
  };

  if (doctors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>قائمة الأطباء (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            لا يوجد أطباء مسجلين حتى الآن
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="text-lg">كشف حساب الأطباء</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="بحث باسم الطبيب..."
            className="w-56"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الطبيب</TableHead>
                <TableHead>عدد الحالات</TableHead>
                <TableHead>الحالات المكتملة</TableHead>
                <TableHead>إجمالي المبالغ (د.ع)</TableHead>
                <TableHead>الرصيد الحالي</TableHead>
                <TableHead>آخر تسليم</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    لا يوجد أطباء بهذه المواصفات
                  </TableCell>
                </TableRow>
              )}
              {filteredDoctors.map((doc) => {
                // جلب ملخص الحساب المالي لكل طبيب
                const { totalDue, totalPaid, remaining, doctorCases, isLoading } = useDoctorFinancialSummary(doc.id);

                return (
                  <TableRow key={doc.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-primary text-right w-[200px]">
                      {doc.name}
                    </TableCell>
                    <TableCell className="text-center w-[140px]">
                      <span className="text-sm font-bold">{calcTotalTeeth(doc.id)}</span>
                    </TableCell>
                    <TableCell className="text-center w-[120px]">
                      {isLoading ? (
                        <span className="text-xs text-gray-400">تحميل...</span>
                      ) : (
                        <DoctorAccountPDFButton
                          doctorName={doc.name}
                          summary={{ totalDue, totalPaid, remaining }}
                          doctorCases={doctorCases}
                          doctorId={doc.id}
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-center w-[195px]">
                      {isLoading ? (
                        <span className="text-xs text-gray-400">تحميل...</span>
                      ) : (
                        <span className="whitespace-nowrap font-bold">
                          {totalDue.toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center w-[120px]">
                      {isLoading ? (
                        <span className="text-xs text-gray-400">تحميل...</span>
                      ) : (
                        <span className="whitespace-nowrap font-bold">
                          {remaining.toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center w-[150px]">
                      {isLoading ? (
                        <span className="text-xs text-gray-400">تحميل...</span>
                      ) : (
                        doctorCases.length > 0 && doctorCases[0].delivery_date ?
                          doctorCases[0].delivery_date
                          : "—"
                      )}
                    </TableCell>
                    <TableCell className="text-center w-[120px]">
                      <DoctorAccountPDFButton
                        doctorName={doc.name}
                        summary={{ totalDue, totalPaid, remaining }}
                        doctorCases={doctorCases}
                        doctorId={doc.id}
                      />
                    </TableCell>
                    <TableCell className="text-center w-[240px]">
                      <div className="flex gap-2 justify-center">
                        <EditDoctorDialog doctor={doc} />
                        <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50 border-blue-200"
                          title="تفاصيل"
                          onClick={() => window.location.href = `/doctor/${doc.id}`}>
                          تفاصيل
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" title="حذف"
                          onClick={() => handleDelete(doc.id)}>
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
