
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
          <TableHead className="text-right w-[180px]">اسم المريض</TableHead>
          <TableHead className="text-center w-[130px]">تاريخ الإستلام</TableHead>
          <TableHead className="text-center w-[140px]">نوع العمل</TableHead>
          <TableHead className="text-center w-[120px]">عدد الأسنان</TableHead>
          <TableHead className="text-center w-[120px]">الحالة</TableHead>
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
              <TableCell className="text-right w-[180px]">{c.patient_name}</TableCell>
              <TableCell className="text-center w-[130px]">{c.submission_date}</TableCell>
              <TableCell className="text-center w-[140px]">{c.work_type}</TableCell>
              <TableCell className="text-center w-[120px]">{getTeethCount(c)}</TableCell>
              <TableCell className="text-center w-[120px]">{c.status}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
