
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DoctorAccountPDFButton } from "@/components/doctors-log/DoctorAccountPDFButton";
import { EditDoctorDialog } from "@/components/EditDoctorDialog";
import type { Doctor } from "@/hooks/useDoctors";
import { useDeleteDoctor } from "@/hooks/useDoctors";

// doctorPayments is new!
interface Props {
  doctors: Doctor[];
  cases: any[];
  doctorPayments: any[];
}

// حساب ملخص الطبيب المالي بناءً على جميع الحالات والمدفوعات
function getDoctorFinancialSummaryForTable(doctorId: string, cases: any[], doctorPayments: any[]) {
  const doctorCases = cases.filter((c: any) => c.doctor_id === doctorId);
  const totalDue = doctorCases.reduce((sum: number, c: any) => sum + (Number(c.price) || 0), 0);
  const totalPaid = doctorPayments
    .filter((t: any) => t.doctor_id === doctorId && t.transaction_type === "دفعة")
    .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

  const remaining = totalDue - totalPaid;

  return {
    totalDue,
    totalPaid,
    remaining,
    doctorCases,
    isLoading: false, // no longer any per-row loading
  };
}

export default function DoctorsAccountsTable({ doctors, cases, doctorPayments }: Props) {
  const deleteDoctor = useDeleteDoctor();

  // دالة لحساب إجمالي الأسنان لطبيب معيّن بناءً على كل حالاته - تصحيح الحساب
  const calcTotalTeeth = (doctor_id: string) => {
    const doctorCases = cases.filter((c) => c.doctor_id === doctor_id);
    let total = 0;
    doctorCases.forEach(c => {
      // أولاً نتحقق من وجود number_of_teeth (الحقل الجديد)
      if (c?.number_of_teeth && Number(c.number_of_teeth) > 0) {
        total += Number(c.number_of_teeth);
      }
      // إذا لم يكن موجود، نتحقق من teeth_count (الحقل القديم)
      else if (c?.teeth_count && Number(c.teeth_count) > 0) {
        total += Number(c.teeth_count);
      }
      // إذا لم يكن أي منهما موجود، نحسب من tooth_number
      else if (c?.tooth_number) {
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
    <Card>
      <CardHeader>
        <CardTitle>قائمة الأطباء ({doctors.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right w-[200px]">اسم الطبيب</TableHead>
              <TableHead className="text-center w-[140px]">إجمالي الأسنان</TableHead>
              <TableHead className="text-center w-[120px]">PDF</TableHead>
              <TableHead className="text-center w-[195px]">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => {
              // حساب الملخص المالي لكل طبيب الآن في فانكشن عادية
              const { totalDue, totalPaid, remaining, doctorCases, isLoading } =
                getDoctorFinancialSummaryForTable(doctor.id, cases, doctorPayments);

              return (
                <TableRow key={doctor.id} className="hover:bg-gray-50">
                  <TableCell className="font-semibold text-primary text-right w-[200px]">
                    {doctor.name}
                  </TableCell>
                  <TableCell className="text-center w-[140px]">
                    <span className="text-sm font-bold">{calcTotalTeeth(doctor.id)}</span>
                  </TableCell>
                  <TableCell className="text-center w-[120px]">
                    <DoctorAccountPDFButton
                      doctorName={doctor.name}
                      summary={{ totalDue, totalPaid, remaining }}
                      doctorCases={doctorCases}
                      doctorId={doctor.id}
                      doctorPhone={doctor.phone}
                    />
                  </TableCell>
                  <TableCell className="text-center w-[195px]">
                    <div className="flex gap-2 justify-center">
                      <EditDoctorDialog doctor={doctor} />
                      <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50 border-blue-200"
                        title="تفاصيل"
                        onClick={() => window.location.href = `/doctor/${doctor.id}`}>
                        تفاصيل
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" title="حذف"
                        onClick={() => handleDelete(doctor.id)}>
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
