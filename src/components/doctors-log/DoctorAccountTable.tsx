
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";

// نموذج لحوار اختيار التاريخ
function ExportDialog({ isOpen, onClose, onExport, doctorName }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[350px] space-y-3">
        <h3 className="text-lg font-bold mb-2">تصدير كشف حساب: <span className="text-primary">{doctorName}</span></h3>
        <div className="flex gap-2 items-center">
          <label className="text-sm min-w-[52px]">من</label>
          <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm min-w-[52px]">إلى</label>
          <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button disabled={!from || !to} onClick={() => onExport(from, to)}>تأكيد وتصدير</Button>
        </div>
      </div>
    </div>
  ) : null;
}

// استلام البيانات من الصفحة الرئيسية
interface DoctorAccountTableProps {
  doctors: {
    id: string;
    name: string;
    zircon_price: number;
    temp_price: number;
  }[];
  cases: {
    id: string;
    doctor_id: string;
    price: number;
    status: string;
    delivery_date?: string;
    created_at: string;
    work_type?: string;
    patient_name?: string;
  }[];
}

export function DoctorAccountTable({ doctors, cases }: DoctorAccountTableProps) {
  const [search, setSearch] = useState("");
  
  // إدارة التصدير
  const [exportDoctorId, setExportDoctorId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // تجهيز بيانات الأطباء مجمعة
  const doctorsSummary = useMemo(() => {
    return doctors.map((doc) => {
      const docCases = cases.filter((c) => c.doctor_id === doc.id);
      const totalAmount = docCases.reduce((sum, c) => sum + (Number(c.price) || 0), 0);
      const completedCount = docCases.filter((c) => c.status && c.status.includes("تم")).length;
      const currentBalance = totalAmount; // مستقبلًا يمكن ربطه مع رصيد الطبيب الحقيقي
      const lastWorkDate = docCases.length > 0 ? docCases.sort((a, b) =>
        new Date(b.delivery_date || b.created_at).getTime() - new Date(a.delivery_date || a.created_at).getTime()
      )[0].delivery_date || docCases[0].created_at : null;

      return {
        id: doc.id,
        name: doc.name,
        totalCases: docCases.length,
        completedCount,
        totalAmount,
        currentBalance,
        lastWorkDate,
      };
    });
  }, [doctors, cases]);

  const filteredDoctors = doctorsSummary.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  // تصدير كشف الدكتور (Excel)
  const handleExport = (doctorId: string, doctorName: string, from: string, to: string) => {
    // 1- البحث عن كل الحالات الخاصة بهذا الطبيب ضمن الفترة
    const filtered = cases.filter(
      (c) =>
        c.doctor_id === doctorId &&
        (from ? (c.delivery_date || c.created_at) >= from : true) &&
        (to ? (c.delivery_date || c.created_at) <= to : true)
    );
    // 2- تجهيز بيانات الجدول للتصدير
    const data = filtered.map(c => ({
      "رقم الحالة": c.id,
      "تاريخ التسليم": c.delivery_date ? format(new Date(c.delivery_date), "yyyy-MM-dd") : "-",
      "نوع العمل": c.work_type || "",
      "اسم المريض": c.patient_name || "",
      "المبلغ": c.price ?? "",
      "الحالة": c.status,
    }));
    if (data.length === 0) {
      alert("لا توجد بيانات ضمن الفترة المختارة.");
      return;
    }
    // تجهيز ملف الإكسل
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "كشف الحساب");
    XLSX.writeFile(wb, `كشف_حساب_${doctorName}_${from}_الى_${to}.xlsx`);
    setIsExportOpen(false);
    setExportDoctorId(null);
  };

  // اسم الطبيب المحدد للتصدير
  const exportDoctorName = exportDoctorId
    ? (doctors.find(d => d.id === exportDoctorId)?.name ?? "")
    : "";

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="text-lg">كشف حساب الأطباء</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="بحث باسم الطبيب..."
            className="w-56"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button variant="outline" disabled>
            <Download className="ml-1" /> تصدير الكل
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الطبيب</TableHead>
                <TableHead>عدد الحالات</TableHead>
                <TableHead>الحالات المكتملة</TableHead>
                <TableHead>إجمالي المبالغ (د.ع)</TableHead>
                <TableHead>الرصيد الحالي</TableHead>
                <TableHead>آخر تسليم</TableHead>
                <TableHead>تصدير</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    لا يوجد أطباء بهذه المواصفات
                  </TableCell>
                </TableRow>
              )}
              {filteredDoctors.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-semibold text-primary">{doc.name}</TableCell>
                  <TableCell>{doc.totalCases}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.completedCount}</Badge>
                  </TableCell>
                  <TableCell>{Number(doc.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="font-bold text-green-700">{Number(doc.currentBalance).toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    {doc.lastWorkDate ? new Date(doc.lastWorkDate).toLocaleDateString("ar-EG") : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setExportDoctorId(doc.id);
                        setIsExportOpen(true);
                      }}
                    >
                      <Download className="ml-1" />
                      كشف حساب
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ExportDialog
          isOpen={isExportOpen}
          onClose={() => {
            setIsExportOpen(false);
            setExportDoctorId(null);
          }}
          onExport={(from, to) =>
            handleExport(exportDoctorId!, exportDoctorName, from, to)
          }
          doctorName={exportDoctorName}
        />
      </CardContent>
    </Card>
  );
}
