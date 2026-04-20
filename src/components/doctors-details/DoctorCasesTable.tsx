import { useState, useMemo } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { SortableHeader, SortDirection } from "@/components/ui/sortable-header";

interface CaseRow {
  id: string;
  patient_name: string;
  submission_date: string;
  work_type: string;
  number_of_teeth?: number | string | null;
  teeth_count?: number | string | null;
  tooth_number?: string | null;
  status: string;
}

interface Props {
  cases: CaseRow[];
}

const getTeethCount = (c: CaseRow) => {
  if (c.number_of_teeth && Number(c.number_of_teeth) > 0) {
    return Number(c.number_of_teeth);
  } else if (c.teeth_count && Number(c.teeth_count) > 0) {
    return Number(c.teeth_count);
  } else if (c.tooth_number) {
    return c.tooth_number.split(" ").filter(Boolean).length;
  }
  return 0;
};

export function DoctorCasesTable({ cases }: Props) {
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const sorted = useMemo(() => {
    if (!sortDir) return cases;
    return [...cases].sort((a, b) => {
      const da = new Date(a.submission_date || 0).getTime();
      const db = new Date(b.submission_date || 0).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });
  }, [cases, sortDir]);
  const toggleSort = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right w-[180px]">اسم المريض</TableHead>
          <TableHead className="text-center w-[130px]">
            <SortableHeader label="تاريخ الإستلام" active={!!sortDir} direction={sortDir} onClick={toggleSort} />
          </TableHead>
          <TableHead className="text-center w-[140px]">نوع العمل</TableHead>
          <TableHead className="text-center w-[120px]">عدد الأسنان</TableHead>
          <TableHead className="text-center w-[120px]">الحالة</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              لا توجد حالات لهذا الطبيب
            </TableCell>
          </TableRow>
        ) : (
          sorted.map((c) => (
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
