import { useState, useMemo } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { SortableHeader, SortDirection } from "@/components/ui/sortable-header";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, Eye } from "lucide-react";

type CaseRow = Tables<"cases"> & {
  number_of_teeth?: number | string | null;
};

interface Props {
  cases: CaseRow[];
  onEdit: (caseItem: CaseRow) => void;
  onView: (caseId: string) => void;
  readOnly?: boolean;
}

const getTeethCount = (c: CaseRow) => {
  if (c.number_of_teeth && Number(c.number_of_teeth) > 0) {
    return Number(c.number_of_teeth);
  } else if (c.teeth_count && Number(c.teeth_count) > 0) {
    return Number(c.teeth_count);
  } else if (c.tooth_number) {
    return 1;
  }
  return 0;
};

export function DoctorCasesTable({ cases, onEdit, onView, readOnly = false }: Props) {
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
    <Table className="min-w-[1500px]" dir="rtl">
      <TableHeader>
        <TableRow>
          <TableHead className="sticky right-0 z-10 bg-background text-center w-[100px]">الإجراءات</TableHead>
          <TableHead className="text-right w-[180px]">اسم المريض</TableHead>
          <TableHead className="text-center">رقم الهاتف</TableHead>
          <TableHead className="text-center">العمر</TableHead>
          <TableHead className="text-center w-[130px]">
            <SortableHeader label="تاريخ الإستلام" active={!!sortDir} direction={sortDir} onClick={toggleSort} />
          </TableHead>
          <TableHead className="text-center w-[140px]">نوع العمل</TableHead>
          <TableHead className="text-center">رقم السن</TableHead>
          <TableHead className="text-center w-[120px]">عدد الأسنان</TableHead>
          <TableHead className="text-center">اللون</TableHead>
          <TableHead className="text-center">نوع بلوك الزيركون</TableHead>
          <TableHead className="text-center">السعر الكامل</TableHead>
          <TableHead className="text-center">تاريخ التسليم</TableHead>
          <TableHead className="text-center w-[120px]">الحالة</TableHead>
          <TableHead className="text-right">الملاحظات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 ? (
          <TableRow>
            <TableCell colSpan={14} className="text-center">
              لا توجد حالات لهذا الطبيب
            </TableCell>
          </TableRow>
        ) : (
          sorted.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="sticky right-0 z-10 bg-background">
                <div className="flex items-center justify-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`عرض حالة ${c.patient_name}`} onClick={() => onView(c.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>عرض تفاصيل الحالة</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={readOnly} aria-label={`تعديل حالة ${c.patient_name}`} onClick={() => onEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>تعديل الحالة</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell className="text-right w-[180px]">{c.patient_name}</TableCell>
              <TableCell className="text-center whitespace-nowrap" dir="ltr">{c.patient_phone || "—"}</TableCell>
              <TableCell className="text-center">{c.patient_age ?? "—"}</TableCell>
              <TableCell className="text-center w-[130px] whitespace-nowrap" dir="ltr">{c.submission_date}</TableCell>
              <TableCell className="text-center w-[140px]">{c.work_type}</TableCell>
              <TableCell className="text-center">{c.tooth_number || "—"}</TableCell>
              <TableCell className="text-center w-[120px]">{getTeethCount(c)}</TableCell>
              <TableCell className="text-center">{c.shade || "—"}</TableCell>
              <TableCell className="text-center">{c.zircon_block_type || "—"}</TableCell>
              <TableCell className="text-center">{c.price == null ? "—" : Number(c.price).toFixed(0)}</TableCell>
              <TableCell className="text-center whitespace-nowrap" dir="ltr">{c.delivery_date || "—"}</TableCell>
              <TableCell className="text-center w-[120px]">{c.status || "—"}</TableCell>
              <TableCell className="text-right min-w-[220px] whitespace-pre-wrap break-words">{c.notes || "—"}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
