import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DoctorPDFExportProps {
  doctorData: {
    name: string;
    phone?: string;
    cases: any[];
    transactions: any[];
  };
  summary: {
    totalCases: number;
    totalPayments: number;
    totalTeeth: number;
    remainingBalance: number;
  };
}

export function DoctorPDFExport({ doctorData, summary }: DoctorPDFExportProps) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      
      // إعداد الخط العربي
      doc.setFont("helvetica");
      doc.setFontSize(16);
      doc.setTextColor(40);

      // العنوان الرئيسي
      doc.text("Doctor Account Report", 105, 20, { align: "center" });
      doc.text(`تقرير حساب الطبيب: ${doctorData.name}`, 105, 30, { align: "center" });
      
      // معلومات الطبيب
      let yPosition = 50;
      doc.setFontSize(12);
      doc.text(`Doctor Name: ${doctorData.name}`, 20, yPosition);
      yPosition += 10;
      if (doctorData.phone) {
        doc.text(`Phone: ${doctorData.phone}`, 20, yPosition);
        yPosition += 10;
      }
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;

      // الملخص المالي
      doc.setFontSize(14);
      doc.text("Financial Summary / الملخص المالي", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      const summaryData = [
        ["Total Cases / إجمالي الحالات", summary.totalCases.toString()],
        ["Total Payments / إجمالي المدفوعات", `${summary.totalPayments.toFixed(2)} SAR`],
        ["Total Teeth / إجمالي الأسنان", summary.totalTeeth.toString()],
        ["Remaining Balance / الرصيد المتبقي", `${Math.abs(summary.remainingBalance).toFixed(2)} SAR`],
        ["Status / الحالة", summary.remainingBalance > 0 ? "Outstanding / مديون" : "Paid / مسدد"]
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [["Item / البند", "Value / القيمة"]],
        body: summaryData,
        theme: 'striped',
        margin: { left: 20, right: 20 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;

      // جدول الحالات
      if (doctorData.cases.length > 0) {
        doc.setFontSize(14);
        doc.text("Cases / الحالات", 20, yPosition);
        yPosition += 10;

        const casesData = doctorData.cases.map((caseItem: any) => [
          caseItem.patient_name || "",
          new Date(caseItem.submission_date).toLocaleDateString(),
          caseItem.work_type || "",
          caseItem.tooth_number || "-",
          (caseItem.teeth_count || 1).toString(),
          `${Number(caseItem.price || 0).toFixed(2)} SAR`,
          caseItem.status || ""
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Patient / المريض", "Date / التاريخ", "Work Type / نوع العمل", "Tooth No. / رقم السن", "Count / العدد", "Price / السعر", "Status / الحالة"]],
          body: casesData,
          theme: 'striped',
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }

      // جدول المعاملات المالية
      if (doctorData.transactions.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text("Financial Transactions / المعاملات المالية", 20, yPosition);
        yPosition += 10;

        const transactionsData = doctorData.transactions.map((transaction: any) => [
          transaction.transaction_type || "",
          `${Number(transaction.amount || 0).toFixed(2)} SAR`,
          transaction.payment_method || "-",
          new Date(transaction.transaction_date).toLocaleDateString(),
          transaction.status || "-",
          transaction.notes || "-"
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Type / النوع", "Amount / المبلغ", "Method / الطريقة", "Date / التاريخ", "Status / الحالة", "Notes / ملاحظات"]],
          body: transactionsData,
          theme: 'striped',
          margin: { left: 20, right: 20 },
          styles: { fontSize: 8 }
        });
      }

      // حفظ الملف
      const fileName = `doctor-report-${doctorData.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "تم تحميل التقرير بنجاح",
        description: "تم إنشاء وتحميل تقرير PDF بنجاح"
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "خطأ في إنشاء التقرير",
        description: "حدث خطأ أثناء إنشاء تقرير PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="flex gap-2 mb-6">
      <Button
        onClick={generatePDF}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <FileDown className="w-4 h-4" />
        {loading ? "جاري الإنشاء..." : "تحميل PDF"}
      </Button>
      
      <Button
        variant="outline"
        onClick={printReport}
        className="flex items-center gap-2"
      >
        <Printer className="w-4 h-4" />
        طباعة
      </Button>
    </div>
  );
}