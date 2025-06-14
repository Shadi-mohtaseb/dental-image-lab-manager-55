
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/use-toast";

interface FinancialSummary {
  totalDue: number;
  totalPaid: number;
  remaining: number;
}
interface ExportArgs {
  doctorName: string;
  summary: FinancialSummary;
  doctorCases: any[];
  fromDate?: Date;
  toDate?: Date;
}

// هوك مسؤول عن تصدير PDF
export function useDoctorAccountPDFExport() {
  const exportPDF = async ({
    doctorName,
    summary,
    doctorCases,
    fromDate,
    toDate,
  }: ExportArgs) => {
    // تصفية الحالات بحسب التاريخ المختار
    const filteredCases = doctorCases.filter((c) => {
      const dateStr = c.delivery_date ?? c.created_at?.slice(0, 10);
      if (!dateStr) return false;
      const caseDate = new Date(dateStr);

      if (fromDate) {
        const startOfDay = new Date(fromDate);
        startOfDay.setHours(0, 0, 0, 0);
        if (caseDate < startOfDay) return false;
      }
      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (caseDate > endOfDay) return false;
      }
      return true;
    });

    if (!filteredCases.length) {
      toast({
        title: "لا يوجد بيانات ضمن المدة المحددة!",
        description:
          "يرجى تعديل الفترة أو إضافة حالات للطبيب ضمن تلك الفترة.",
        variant: "destructive",
      });
      return;
    }

    let doc: jsPDF;
    try {
      doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      // ربط autoTable بهذا الـdoc الجديد
      // (أغلب النسخ تربطها تلقائيًا، احتياطًا نعيد الربط هنا)
      if (!(doc as any).autoTable) {
        (doc as any).autoTable = autoTable;
      }

      // فحص autoTable
      if (typeof (doc as any).autoTable !== "function") {
        toast({
          title: "خطأ في تصدير PDF",
          description:
            "لم يتم تحميل ميزة الجدول (autoTable) بشكل صحيح. أعد تحميل الصفحة أو تواصل مع الدعم.",
          variant: "destructive",
        });
        return;
      }

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

      (doc as any).autoTable({
        head: [[
          "اسم المريض",
          "نوع العمل",
          "المبلغ",
          "الحالة",
          "تاريخ التسليم",
          "رقم الحالة",
        ]],
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
      toast({
        title: "حدث خطأ عند التصدير!",
        description: err?.message || "خطأ غير معروف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      return;
    }
  };

  return { exportPDF };
}
