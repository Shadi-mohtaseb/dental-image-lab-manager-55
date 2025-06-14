
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tables } from "@/integrations/supabase/types";
import { CaseRow } from "./CaseRow";

type CasesTableProps = {
  cases: (Tables<"cases"> & { doctor?: { name?: string } })[];
  onView: (caseId: string) => void;
  onEdit: (caseItem: Tables<"cases">) => void;
  onDelete: (caseId: string) => void;
  getStatusColor: (status: string) => string;
};

export function CasesTable({ cases, onView, onEdit, onDelete, getStatusColor }: CasesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>رقم الحالة</TableHead>
          <TableHead>اسم المريض</TableHead>
          <TableHead>اسم الطبيب</TableHead>
          <TableHead>نوع العمل</TableHead>
          <TableHead>رقم السن<br/><span className="text-xs text-gray-400">(وعدد الأسنان بعده)</span></TableHead>
          <TableHead>تاريخ الاستلام</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.map((caseItem) => (
          <CaseRow
            key={caseItem.id}
            caseItem={caseItem}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            getStatusColor={getStatusColor}
          />
        ))}
      </TableBody>
    </Table>
  );
}
