import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
// يجب أن تأتي بعد jsPDF
import "jspdf-autotable";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ar } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast"; // الشادكن توست

interface Props {
  doctorName: string;
  summary: {
    totalDue: number;
    totalPaid: number;
    remaining: number;
  };
  doctorCases: any[];
}

export const DoctorAccountPDFButton: React.FC<Props> = ({ doctorName, summary, doctorCases }) => {
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // تصفية الحالات بالفترة المطلوبة
  const filteredCases = React.useMemo(() => {
    return doctorCases.filter((c) => {
      // نستخدم تاريخ التسليم أو الإنشاء
      const dateStr = c.delivery_date ?? c.created_at?.slice(0, 10);
      if (!dateStr) return false;
      const caseDate = new Date(dateStr);
      // بداية الفترة
      if (fromDate && caseDate < new Date(fromDate.setHours(0,0,0,0))) return false;
      // نهاية الفترة
      if (toDate && caseDate > new Date(toDate.setHours(23,59,59,999))) return false;
      return true;
    });
  }, [doctorCases, fromDate, toDate]);

  const handleExport = () => {
    setLoading(true);
    try {
      // إضافة اختبار هل الخاصية متوفرة
      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        hotfixes: ["px_scaling"],
      });

      // تحقق من وجود الدالة
      console.log("typeof autoTable:", typeof (doc as any).autoTable);

      if (typeof (doc as any).autoTable !== "function") {
        toast({
          title: "حدث خطأ عند التصدير!",
          description: "jspdf-autotable لم تدمج بشكل صحيح. يرجى إعادة تحميل الصفحة أو مراجعة الاستيراد.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // رأس الصفحة
      doc.setTextColor(40, 51, 102);
      doc.setFontSize(22);
      doc.text(`كشف حساب الطبيب`, 105, 20, { align: "center" });
      doc.setFontSize(16);
      doc.setTextColor(80, 80, 100);
      doc.text(doctorName, 105, 30, { align: "center" });

      // ملخص مالي
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.roundedRect(18, 38, 174, 18, 6, 6, "FD");
      doc.setFillColor(235, 237, 249);
      doc.text("إجمالي المستحق:", 175, 48, { align: "right" });
      doc.text(`${summary.totalDue.toLocaleString()} ₪`, 158, 48, { align: "right" });

      doc.text("المدفوع:", 112, 48, { align: "right" });
      doc.text(`${summary.totalPaid.toLocaleString()} ₪`, 88, 48, { align: "right" });

      doc.text("المتبقي (دين):", 60, 48, { align: "right" });
      doc.setTextColor(200, 34, 51);
      doc.text(`${summary.remaining.toLocaleString()} ₪`, 40, 48, { align: "right" });
      doc.setTextColor(30, 30, 30);

      // جدول الحالات (الفترة حسب الفلتر)
      const caseRows = filteredCases.map((c) => [
        c.patient_name || "",
        c.work_type || "",
        c.price?.toLocaleString() ?? "",
        c.status || "",
        (c.delivery_date ?? c.created_at?.slice(0, 10)) || "",
        c.id?.slice(0, 6) + "...",
      ]);

      (doc as any).autoTable({
        head: [["اسم المريض", "نوع العمل", "المبلغ", "الحالة", "تاريخ التسليم", "رقم الحالة"]],
        body: caseRows,
        styles: {
          fontSize: 10,
          cellWidth: "wrap",
          textColor: [33, 37, 41],
          halign: "right",
        },
        headStyles: {
          fillColor: [40, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        startY: 62,
        theme: "grid",
        margin: { left: 12, right: 12 },
        didParseCell: (data: any) => {
          data.cell.styles.halign = "right";
        },
      });

      // ذيل الصفحة
      doc.setFontSize(11);
      doc.setTextColor(90);
      doc.text("تم توليد كشف الحساب عبر نظام إدارة المختبر", 105, 285, { align: "center" });

      doc.save(`كشف_حساب_${doctorName}.pdf`);

      toast({
        title: "تم تصدير الملف بنجاح",
        description: "تم حفظ ملف PDF في جهازك.",
        variant: "default",
      });
    } catch (err: any) {
      toast({
        title: "حدث خطأ عند التصدير!",
        description: err?.message || "خطأ غير معروف.",
        variant: "destructive",
      });
      // يمكنك أيضًا هنا console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} title="تصدير PDF (اختر الفترة)">
          <Download className="ml-1" /> PDF
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[330px] pointer-events-auto" align="end" sideOffset={6}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-right mr-1">من تاريخ:</label>
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={setFromDate}
              className="p-3 pointer-events-auto"
              locale={ar}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-right mr-1">إلى تاريخ:</label>
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={setToDate}
              className="p-3 pointer-events-auto"
              locale={ar}
            />
          </div>
          <Button
            type="button"
            disabled={loading}
            onClick={() => {
              setPopoverOpen(false);
              handleExport();
            }}
            className="w-full"
          >
            <Download className="ml-1" /> تصدير PDF
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
