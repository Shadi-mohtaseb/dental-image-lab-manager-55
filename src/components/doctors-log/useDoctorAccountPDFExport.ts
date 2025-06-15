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
    console.log("🟢 بدأت عملية تصدير PDF");
    console.log("🔵 جميع بيانات doctorCases القادمة:", doctorCases);

    if (!doctorCases || !Array.isArray(doctorCases) || doctorCases.length === 0) {
      toast({
        title: "لا يوجد بيانات للحالات لهذا الطبيب!",
        description: "لم يتم جلب أي حالة (cases) من قاعدة البيانات للطبيب المطلوب.",
        variant: "destructive",
      });
      console.warn("⚠️ doctorCases غير موجود أو فارغ:", doctorCases);
      throw new Error("لا يوجد بيانات للحالات.");
    }

    // سجل قبل الفلترة
    console.log("🔸 عدد الحالات قبل الفلترة:", doctorCases.length);
    let countRejected = 0;

    // تصفية الحالات بحسب التاريخ المختار (مع تحديد أسباب الرفض)
    const filteredCases = (doctorCases || []).filter((c, idx) => {
      const rawDelivery = c.delivery_date;
      const rawCreated = c.created_at;

      let dateStr = rawDelivery ?? (typeof rawCreated === "string" ? rawCreated.slice(0, 10) : null);
      if (!dateStr) {
        console.log(`[فلترة] idx=${idx} رفضت: لا يوجد delivery_date ولا created_at`, c);
        countRejected++;
        return false;
      }

      let caseDateObj: Date | undefined;
      try {
        caseDateObj = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
        if (isNaN(caseDateObj.getTime())) {
          // تاريخ غير صالح!
          console.log(`[فلترة] idx=${idx} رفضت: تاريخ غير قابل للتحويل`, { dateStr, case: c });
          countRejected++;
          return false;
        }
      } catch (err) {
        console.log(`[فلترة] idx=${idx} رفضت: خطأ في تحويل التاريخ`, { dateStr, err, case: c });
        countRejected++;
        return false;
      }

      if (fromDate) {
        const startOfDay = new Date(fromDate);
        startOfDay.setHours(0, 0, 0, 0);
        if (caseDateObj < startOfDay) {
          console.log(`[فلترة] idx=${idx} رفضت: قبل fromDate`, { caseDateObj, fromDate });
          countRejected++;
          return false;
        }
      }
      if (toDate) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (caseDateObj > endOfDay) {
          console.log(`[فلترة] idx=${idx} رفضت: بعد toDate`, { caseDateObj, toDate });
          countRejected++;
          return false;
        }
      }
      return true;
    });

    console.log("🟢 عدد الحالات (بعد الفلترة):", filteredCases.length, "✓ - تم استبعاد", countRejected, "حالة");
    if (filteredCases.length === 0) {
      toast({
        title: "لا يوجد بيانات ضمن المدة المحددة!",
        description:
          "يرجى تعديل الفترة أو إضافة حالات للطبيب ضمن تلك الفترة، أو التأكد من أن الطبيب المحدد لديه حالات.\nتأكد من توفر (delivery_date) أو (created_at) في كل حالة وصحتها.",
        variant: "destructive",
      });
      // أطبع كل الحالات الخام مع تواريخها للمتابعة
      console.log("🔴 جميع تواريخ الحالات الخام:", (doctorCases || []).map((c, i) => ({
        i,
        patient_name: c?.patient_name,
        delivery_date: c?.delivery_date,
        created_at: c?.created_at,
        price: c?.price,
        status: c?.status,
      })));
      throw new Error("لا يوجد بيانات صالحة للتصدير.");
    }

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
          description:
            "لم يتم تحميل ميزة الجدول (autoTable) بشكل صحيح. أعد تحميل الصفحة أو تواصل مع الدعم.",
          variant: "destructive",
        });
        throw new Error("autoTable not loaded");
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
      const caseRows = filteredCases.map((c) => [
        c?.patient_name ?? "",
        c?.work_type ?? "",
        (c?.price != null && c?.price !== undefined && !isNaN(Number(c.price))) ? Number(c.price).toLocaleString() : "",
        c?.status ?? "",
        (c?.delivery_date ?? c?.created_at?.slice(0, 10)) ?? "",
        c?.id?.slice(0, 6) ? c.id.slice(0, 6) + "..." : "",
      ]);
      console.log("صفوف الجدول للحالة:", caseRows);

      if (!caseRows.length) {
        toast({
          title: "لا يوجد حالات مرتبطة للطبيب!",
          description: "لا يوجد بيانات حالات للطبيب المحدد للتصدير.",
          variant: "destructive",
        });
        throw new Error("لا يوجد صفوف بيانات للحالات.");
      }

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
      console.error("خطأ أثناء تصدير PDF:", err);
      throw err;
    }
  };

  return { exportPDF };
}
