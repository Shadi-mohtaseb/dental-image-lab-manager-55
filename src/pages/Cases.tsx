
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCases } from "@/hooks/useCases";
import { AddCaseDialog } from "@/components/AddCaseDialog";

const Cases = () => {
  const navigate = useNavigate();
  const { data: cases = [], isLoading } = useCases();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "قيد التنفيذ":
        return "bg-blue-100 text-blue-700";
      case "تجهيز العمل":
        return "bg-yellow-100 text-yellow-700";
      case "اختبار القوة":
        return "bg-orange-100 text-orange-700";
      case "تم التسليم":
        return "bg-green-100 text-green-700";
      case "المراجعة النهائية":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleViewCase = (caseId: string) => {
    navigate(`/case/${caseId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">جاري تحميل الحالات...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">قائمة الحالات</h1>
            <p className="text-gray-600">إدارة ومتابعة جميع حالات المختبر</p>
          </div>
        </div>
        <AddCaseDialog />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="بحث عن مريض أو طبيب..."
                className="w-full"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Search className="w-4 h-4" />
              بحث
            </Button>
          </div>
          
          {/* Filter Badges */}
          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
              الكل ({cases.length})
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-blue-500 hover:text-white">
              قيد التنفيذ
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-green-500 hover:text-white">
              تم التسليم
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-purple-500 hover:text-white">
              زيركون
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-orange-500 hover:text-white">
              مؤقت
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>جميع الحالات ({cases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد حالات مسجلة حتى الآن
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الحالة</TableHead>
                  <TableHead>اسم المريض</TableHead>
                  <TableHead>اسم الطبيب</TableHead>
                  <TableHead>نوع العمل</TableHead>
                  <TableHead>رقم السن</TableHead>
                  <TableHead>تاريخ الاستلام</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem) => (
                  <TableRow key={caseItem.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-primary">
                      {caseItem.case_number}
                    </TableCell>
                    <TableCell>{caseItem.patient_name}</TableCell>
                    <TableCell>{caseItem.doctor?.name || "غير محدد"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{caseItem.work_type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {caseItem.tooth_number && (
                        <Badge className="bg-gray-100 text-gray-700">
                          {caseItem.tooth_number}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(caseItem.submission_date).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(caseItem.status)}>
                        {caseItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewCase(caseItem.id)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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

export default Cases;
