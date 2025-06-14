
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { useDoctors, useDeleteDoctor } from "@/hooks/useDoctors";
import { AddDoctorDialog } from "@/components/AddDoctorDialog";
import { EditDoctorDialog } from "@/components/EditDoctorDialog";

const DoctorsAccounts = () => {
  const { data: doctors = [], isLoading } = useDoctors();
  const deleteDoctor = useDeleteDoctor();

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف الطبيب؟")) {
      deleteDoctor.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">جاري تحميل بيانات الأطباء...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">حسابات الأطباء</h1>
            <p className="text-gray-600">إدارة ومتابعة حسابات الأطباء المتعاملين</p>
          </div>
        </div>
        <AddDoctorDialog />
      </div>

      {/* قائمة الأطباء */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الأطباء ({doctors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا يوجد أطباء مسجلين حتى الآن
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الطبيب</TableHead>
                  <TableHead>سعر الزيركون (شيكل)</TableHead>
                  <TableHead>سعر المؤقت (شيكل)</TableHead>
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
                      <span className="text-sm">{doctor.zircon_price} شيكل</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{doctor.temp_price} شيكل</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <EditDoctorDialog doctor={doctor} />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorsAccounts;
