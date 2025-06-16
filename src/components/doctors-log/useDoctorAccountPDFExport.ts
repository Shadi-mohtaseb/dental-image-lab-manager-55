
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
  downloadImmediately?: boolean;
}

// هوك مسؤول عن تصدير PDF
export function useDoctorAccountPDFExport() {
  const exportPDF = async ({
    doctorName,
    summary,
    doctorCases,
    fromDate,
    toDate,
    downloadImmediately = true,
  }: ExportArgs): Promise<string | null> => {
    console.log("🟢 بدأت عملية تصدير PDF");
    console.log("🔵 جميع بيانات doctorCases القادمة:", doctorCases);

    if (!doctorCases || !Array.isArray(doctorCases) || doctorCases.length === 0) {
      toast({
        title: "لا يوجد بيانات للحالات لهذا الطبيب!",
        description: "لم يتم جلب أي حالة (cases) من قاعدة البيانات للطبيب المطلوب.",
        variant: "destructive",
      });
    }

    console.log("🔸 عدد الحالات قبل الفلترة:", doctorCases?.length ?? 0);

    let warningCount = 0;
    const filteredCases = (doctorCases || []).filter((c, idx) => {
      let include = true;
      if (fromDate || toDate) {
        const rawDelivery = c.delivery_date;
        const rawCreated = c.created_at;
        let dateStr = rawDelivery ?? (typeof rawCreated === "string" ? rawCreated.slice(0, 10) : null);

        let caseDateObj: Date | undefined;
        if (dateStr) {
          try {
            caseDateObj = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
          } catch (err) {
            include = false;
            warningCount++;
          }
        } else {
          include = false;
          warningCount++;
        }

        if (include && fromDate && caseDateObj) {
          const startOfDay = new Date(fromDate);
          startOfDay.setHours(0, 0, 0, 0);
          if (caseDateObj < startOfDay) {
            include = false;
          }
        }
        if (include && toDate && caseDateObj) {
          const endOfDay = new Date(toDate);
          endOfDay.setHours(23, 59, 59, 999);
          if (caseDateObj > endOfDay) {
            include = false;
          }
        }
        return include;
      }
      return true;
    });

    if (doctorCases && doctorCases.length > 0 && filteredCases.length === 0) {
      toast({
        title: "لا يوجد بيانات مطابقة للفترة الزمنية المحددة",
        description: "يرجى تعديل الفترة الزمنية أو إزالة الفلترة لعرض جميع الحالات.",
        variant: "destructive",
      });
    }

    const exportRows = filteredCases && filteredCases.length > 0 ? filteredCases : [];

    let doc: jsPDF;
    try {
      doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      if (!(doc as any).autoTable) {
        (doc as any).autoTable = autoTable;
      }
      if (typeof (doc as any).autoTable !== "function") {
        toast({
          title: "خطأ في تصدير PDF",
          description: "لم يتم تحميل ميزة الجدول (autoTable) بشكل صحيح. أعد تحميل الصفحة أو تواصل مع الدعم.",
          variant: "destructive",
        });
        return null;
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
      doc.text(`${(summary.totalDue ?? 0).toLocaleString()} ₪`, 158, 48, { align: "right" });
      doc.text("المدفوع:", 112, 48, { align: "right" });
      doc.text(`${(summary.totalPaid ?? 0).toLocaleString()} ₪`, 88, 48, { align: "right" });
      doc.text("المتبقي (دين):", 60, 48, { align: "right" });
      doc.setTextColor(200, 34, 51);
      doc.text(`${(summary.remaining ?? 0).toLocaleString()} ₪`, 40, 48, { align: "right" });
      doc.setTextColor(30, 30, 30);

      // جدول الحالات
      const caseRows = exportRows.map((c) => [
        c?.patient_name ?? "",
        c?.work_type ?? "",
        (c?.price != null && c?.price !== undefined && !isNaN(Number(c.price))) ? Number(c.price).toLocaleString() : "",
        c?.status ?? "",
        (c?.delivery_date ?? (c?.created_at ? String(c.created_at).slice(0,10) : "")) ?? "",
        (c?.id?.slice(0, 6) ? c.id.slice(0, 6) + "..." : ""),
      ]);
      console.log("صفوف الجدول للحالة:", caseRows);

      if (caseRows.length === 0) {
        (doc as any).autoTable({
          head: [[
            "اسم المريض",
            "نوع العمل",
            "المبلغ",
            "الحالة",
            "تاريخ التسليم",
            "رقم الحالة",
          ]],
          body: [],
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
        });
      } else {
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
      }

      doc.setFontSize(11);
      doc.setTextColor(90);
      doc.text(
        "تم توليد كشف الحساب عبر نظام إدارة المختبر",
        105,
        285,
        { align: "center" }
      );

      // إنشاء blob من PDF
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (downloadImmediately) {
        // تحميل الملف مباشرة (السلوك القديم)
        doc.save(`كشف_حساب_${doctorName}.pdf`);
      }

      toast({
        title: "تم تصدير الملف بنجاح",
        description: (caseRows.length === 0
          ? "لم توجد بيانات حالات لهذا الطبيب في الفترة المحددة (تم التصدير ببيانات الحساب فقط)."
          : "تم إنشاء ملف PDF بنجاح."),
        variant: "default",
      });

      return pdfUrl;
    } catch (err: any) {
      toast({
        title: "حدث خطأ عند التصدير!",
        description: err?.message || "خطأ غير معروف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      console.error("خطأ أثناء تصدير PDF:", err);
      return null;
    }
  };

  return { exportPDF };
}
