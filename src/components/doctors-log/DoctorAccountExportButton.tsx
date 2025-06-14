
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { format } from "date-fns";

/**
 * مكون تصدير كشف حساب الطبيب كاكسل لفترة محددة
 * يحتاج بيانات الحالات الأولية للطبيب
 */

interface DoctorCase {
  id: string;
  doctor_id: string;
  price: number;
  status: string;
  delivery_date?: string;
  created_at: string;
  work_type?: string;
  patient_name?: string;
}

interface Props {
  doctorId: string;
  doctorName: string;
  doctorCases: DoctorCase[];
}

export const DoctorAccountExportButton: React.FC<Props> = ({
  doctorId,
  doctorName,
  doctorCases,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleExport = () => {
    // تصفية الحالات حسب الفترة
    const filtered = doctorCases.filter(
      (c) =>
        (from ? (c.delivery_date || c.created_at) >= from : true) &&
        (to ? (c.delivery_date || c.created_at) <= to : true)
    );
    if (filtered.length === 0) {
      toast({ title: "لا توجد بيانات ضمن الفترة المختارة." });
      return;
    }
    const data = filtered.map(c => ({
      "رقم الحالة": c.id,
      "تاريخ التسليم": c.delivery_date ? format(new Date(c.delivery_date), "yyyy-MM-dd") : "-",
      "نوع العمل": c.work_type || "",
      "اسم المريض": c.patient_name || "",
      "المبلغ": c.price ?? "",
      "الحالة": c.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "كشف الحساب");
    XLSX.writeFile(wb, `كشف_حساب_${doctorName}_${from}_الى_${to}.xlsx`);
    setExportOpen(false);
    setFrom("");
    setTo("");
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setExportOpen(true)}
        title="تصدير كشف حساب"
      >
        <Download className="ml-1" />
        كشف حساب
      </Button>
      {exportOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[340px] space-y-3">
            <h3 className="text-lg font-bold mb-2">
              تصدير كشف حساب: <span className="text-primary">{doctorName}</span>
            </h3>
            <div className="flex gap-2 items-center">
              <label className="text-sm min-w-[52px]">من</label>
              <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm min-w-[52px]">إلى</label>
              <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="secondary" onClick={() => setExportOpen(false)}>إلغاء</Button>
              <Button disabled={!from || !to} onClick={handleExport}>تأكيد وتصدير</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
