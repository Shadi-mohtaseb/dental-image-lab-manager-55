
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, Phone, Mail } from "lucide-react";
import { useDoctors } from "@/hooks/useDoctors";
import { AddDoctorDialog } from "@/components/AddDoctorDialog";

const DoctorsAccounts = () => {
  const { data: doctors = [], isLoading } = useDoctors();

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

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="بحث عن طبيب..."
                className="w-full"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Search className="w-4 h-4" />
              بحث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
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
                  <TableHead>التخصص</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>العنوان</TableHead>
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
                      {doctor.specialty ? (
                        <Badge variant="outline">{doctor.specialty}</Badge>
                      ) : (
                        <span className="text-gray-400">غير محدد</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {doctor.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{doctor.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">غير محدد</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {doctor.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{doctor.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">غير محدد</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{doctor.address || "غير محدد"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
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
