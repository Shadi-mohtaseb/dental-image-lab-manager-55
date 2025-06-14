
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface CaseRow {
  id: string;
  patient_name: string;
  submission_date: string;
  work_type: string;
  number_of_teeth?: number | string | null;
  tooth_number?: string | null;
  status: string;
}

interface Props {
  cases: CaseRow[];
}

const getTeethCount = (c: CaseRow) => {
  if (c.number_of_teeth && Number(c.number_of_teeth) > 0) {
    return Number(c.number_of_teeth);
  }
  if (c.tooth_number) {
    return c.tooth_number.split(" ").filter(Boolean).length;
  }
  return 0;
};

export function DoctorCasesTable({ cases }: Props) {
  return (
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
          cases.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.patient_name}</TableCell>
              <TableCell>{c.submission_date}</TableCell>
              <TableCell>{c.work_type}</TableCell>
              <TableCell>{getTeethCount(c)}</TableCell>
              <TableCell>{c.status}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
