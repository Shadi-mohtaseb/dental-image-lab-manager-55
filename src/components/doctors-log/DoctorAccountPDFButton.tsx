import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ar } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";

// استيراد jspdf-autotable مع التأكد من التكامل الصحيح
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Props {
  doctorName: string;
  summary: {
    totalDue: number;
    totalPaid: number;
    remaining: number;
  };
  doctorCases: any[];
}

// التأكيد على ربط autoTable مع jsPDF
import autoTable from "jspdf-autotable"; // استورد التابع الافتراضي إن وجد

// تأكد من إضافة autoTable يدويًا في حال لم يتم ربطها تلقائيًا
if (
  typeof (jsPDF as any).API !== "undefined" &&
  !(jsPDF as any).API.autoTable
) {
  (jsPDF as any).API.autoTable = autoTable;
}

export const DoctorAccountPDFButton: React.FC<Props> = ({
  doctorName,
  summary,
  doctorCases,
}) => {
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // تصفية الحالات بالفترة المطلوبة - إصلاح مشكلة infinite loop
  const filteredCases = React.useMemo(() => {
    return doctorCases.filter((c) => {
      // نستخدم تاريخ التسليم أو الإنشاء
      const dateStr = c.delivery_date ?? c.created_at?.slice(0, 10);
      if (!dateStr) return false;
      const caseDate = new Date(dateStr);
      
      // بداية الفترة - إنشاء نسخة جديدة من التاريخ بدلاً من تعديل الأصل
      if (fromDate) {
        const startOfDay = new Date(fromDate);
        startOfDay.setHours(0, 0, 0, 0);
        if (caseDate < startOfDay) return false;
      }
      
      // نهاية الفترة - إنشاء نسخة جديدة من التاريخ بدلاً من تعديل الأصل
      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (caseDate > endOfDay) return false;
      }
      
      return true;
    });
  }, [doctorCases, fromDate, toDate]);

  const handleExport = async () => {
    setLoading(true);

    try {
      if (!filteredCases.length) {
        toast({
          title: "لا يوجد بيانات ضمن المدة المحددة!",
          description:
            "يرجى تعديل الفترة أو إضافة حالات للطبيب ضمن تلك الفترة.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // إضافة اختبار أن autoTable معرفة في jsPDF
      if (
        typeof (jsPDF as any).API === "undefined" ||
        typeof (jsPDF as any).API.autoTable !== "function"
      ) {
        toast({
          title: "خطأ في تصدير PDF",
          description:
            "لم يتم تحميل ميزة الجدول (autoTable) بشكل صحيح. أعد تحميل الصفحة أو تواصل مع الدعم.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      console.log("هل autoTable متوفرة؟", typeof (jsPDF as any).API.autoTable);

      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

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

      // جدول الحالات
      const caseRows = filteredCases.map((c) => [
        c.patient_name || "",
        c.work_type || "",
        c.price?.toLocaleString() ?? "",
        c.status || "",
        (c.delivery_date ?? c.created_at?.slice(0, 10)) || "",
        c.id?.slice(0, 6) + "...",
      ]);

      doc.autoTable({
        head: [
          [
            "اسم المريض",
            "نوع العمل",
            "المبلغ",
            "الحالة",
            "تاريخ التسليم",
            "رقم الحالة",
          ],
        ],
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
      doc.text(
        "تم توليد كشف الحساب عبر نظام إدارة المختبر",
        105,
        285,
        { align: "center" }
      );

      doc.save(`كشف_حساب_${doctorName}.pdf`);

      toast({
        title: "تم تصدير الملف بنجاح",
        description: "تم حفظ ملف PDF في جهازك.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("خطأ في تصدير PDF:", err);
      toast({
        title: "حدث خطأ عند التصدير!",
        description:
          err?.message || "خطأ غير معروف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
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
