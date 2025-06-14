import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DoctorAccountExportButton } from "@/components/doctors-log/DoctorAccountExportButton";
import { EditDoctorDialog } from "@/components/EditDoctorDialog";
import type { Doctor } from "@/hooks/useDoctors";
import { useDeleteDoctor } from "@/hooks/useDoctors";

interface Props {
  doctors: Doctor[];
  cases: any[];
}

export default function DoctorsAccountsTable({ doctors, cases }: Props) {
  const deleteDoctor = useDeleteDoctor();

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
    <Card>
      <CardHeader>
        <CardTitle>قائمة الأطباء ({doctors.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم الطبيب</TableHead>
              <TableHead>إجمالي الأسنان</TableHead>
              {/* <TableHead>سعر الزيركون (شيكل)</TableHead>
              <TableHead>سعر المؤقت (شيكل)</TableHead> */}
              <TableHead>كشف الحساب</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow key={doctor.id} className="hover:bg-gray-50">
                <TableCell className="font-semibold text-primary">
                  {doctor.name}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-bold">{calcTotalTeeth(doctor.id)}</span>
                </TableCell>
                {/* <TableCell>
                  <span className="text-sm">{doctor.zircon_price} شيكل</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{doctor.temp_price} شيكل</span>
                </TableCell> */}
                <TableCell>
                  <DoctorAccountExportButton
                    doctorId={doctor.id}
                    doctorName={doctor.name}
                    doctorCases={cases.filter((c) => c.doctor_id === doctor.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
