import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CaseRow {
  id: string;
  patient_name: string;
  submission_date: string;
  delivery_date?: string;
  work_type: string;
  tooth_number?: string;
  teeth_count?: number;
  price: number;
  status: string;
}

interface DoctorCasesTableProps {
  cases: CaseRow[];
}

export function DoctorCasesTable({ cases }: DoctorCasesTableProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "مكتمل":
        return "default";
      case "في التقدم":
        return "secondary";
      case "في الانتظار":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ar });
    } catch {
      return dateString;
    }
  };

  const getTeethCount = (caseRow: CaseRow) => {
    if (caseRow.teeth_count) return caseRow.teeth_count;
    if (caseRow.tooth_number) {
      const parsed = parseInt(caseRow.tooth_number);
      return isNaN(parsed) ? 1 : parsed;
    }
    return 1;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>الحالات ({cases.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المريض</TableHead>
                <TableHead>تاريخ التقديم</TableHead>
                <TableHead>تاريخ التسليم</TableHead>
                <TableHead>نوع العمل</TableHead>
                <TableHead>رقم السن</TableHead>
                <TableHead>عدد الأسنان</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    لا توجد حالات
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((caseRow) => (
                  <TableRow key={caseRow.id}>
                    <TableCell className="font-medium">
                      {caseRow.patient_name}
                    </TableCell>
                    <TableCell>
                      {formatDate(caseRow.submission_date)}
                    </TableCell>
                    <TableCell>
                      {caseRow.delivery_date ? formatDate(caseRow.delivery_date) : "-"}
                    </TableCell>
                    <TableCell>{caseRow.work_type}</TableCell>
                    <TableCell>{caseRow.tooth_number || "-"}</TableCell>
                    <TableCell>{getTeethCount(caseRow)}</TableCell>
                    <TableCell className="font-semibold">
                      {Number(caseRow.price).toFixed(2)} ر.س
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(caseRow.status)}>
                        {caseRow.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}