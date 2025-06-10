
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Edit, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cases = () => {
  const navigate = useNavigate();

  const cases = [
    {
      id: "A23",
      patient: "عبدالله محمد",
      doctor: "د. أحمد محمد",
      workType: "زيركون",
      toothNumber: "16",
      submissionDate: "2025-06-05",
      status: "قيد التنفيذ",
      statusColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "B22",
      patient: "سارة عبدالعزيز",
      doctor: "د. سارة عليد",
      workType: "مؤقت",
      toothNumber: "24",
      submissionDate: "2025-06-08",
      status: "تجهيز العمل",
      statusColor: "bg-yellow-100 text-yellow-700",
    },
    {
      id: "A35",
      patient: "خالد العمري",
      doctor: "د. محمد الطل",
      workType: "زيركون",
      toothNumber: "46",
      submissionDate: "2025-06-01",
      status: "اختبار القوي",
      statusColor: "bg-orange-100 text-orange-700",
    },
    {
      id: "A11",
      patient: "نورة السلام",
      doctor: "د. نورة السلام",
      workType: "زيركون",
      toothNumber: "21",
      submissionDate: "2025-05-28",
      status: "تم التسليم",
      statusColor: "bg-green-100 text-green-700",
    },
    {
      id: "C23",
      patient: "فهد الخليفي",
      doctor: "د. فهد الخليفي",
      workType: "مؤقت",
      toothNumber: "36",
      submissionDate: "2025-06-09",
      status: "المراجعة النهائية",
      statusColor: "bg-purple-100 text-purple-700",
    },
  ];

  const handleViewCase = (caseId: string) => {
    navigate(`/case/${caseId}`);
  };

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
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 ml-2" />
          إضافة حالة جديدة
        </Button>
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
              الكل
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-blue-500 hover:text-white">
              تصفية حسب: قيد التنفيذ
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-green-500 hover:text-white">
              مؤقت
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-purple-500 hover:text-white">
              زيركون
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-orange-500 hover:text-white">
              حالة
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>جميع الحالات</CardTitle>
        </CardHeader>
        <CardContent>
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
                    {caseItem.id}
                  </TableCell>
                  <TableCell>{caseItem.patient}</TableCell>
                  <TableCell>{caseItem.doctor}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{caseItem.workType}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-gray-100 text-gray-700">
                      {caseItem.toothNumber}
                    </Badge>
                  </TableCell>
                  <TableCell>{caseItem.submissionDate}</TableCell>
                  <TableCell>
                    <Badge className={caseItem.statusColor}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Cases;
