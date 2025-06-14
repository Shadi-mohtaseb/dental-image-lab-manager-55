
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/400.css";

// دعم العربية في الـ PDF
function arabic(text: string) {
  // لتمكين المحاذاة الصحيحة والكتابة العربية
  return text.split('').reverse().join('');
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
export const DoctorAccountPDFButton: React.FC<Props> = ({ doctorName, summary, doctorCases }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);

    // إعداد الـ PDF
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      hotfixes: ["px_scaling"]
    } as any);

    // إدراج الخط العربي (Cairo)
    // @ts-ignore
    doc.addFileToVFS("Cairo-Regular.ttf", "");
    // @ts-ignore
    doc.addFont("Cairo-Regular.ttf", "Cairo", "normal");
    doc.setFont("Cairo");

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
    doc.roundedRect(18, 38, 174, 18, 6, 6, 'FD');
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
    const caseRows = doctorCases.map(c => ([
      c.patient_name || "",
      c.work_type || "",
      c.price?.toLocaleString() ?? "",
      c.status || "",
      c.delivery_date ?? c.created_at?.slice(0, 10) || "",
      c.id.slice(0, 6) + "..."
    ]));

    (doc as any).autoTable({
      head: [["اسم المريض", "نوع العمل", "المبلغ", "الحالة", "تاريخ التسليم", "رقم الحالة"]],
      body: caseRows,
      styles: {
        font: "Cairo",
        fontSize: 10,
        cellWidth: "wrap",
        textColor: [33, 37, 41],
      },
      headStyles: {
        fillColor: [40, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center"
      },
      startY: 62,
      theme: "grid",
      margin: { left: 12, right: 12 },
      didParseCell: (data: any) => {
        data.cell.styles.halign = "right";
      }
    });

    // ذيل الصفحة
    doc.setFontSize(11);
    doc.setTextColor(90);
    doc.text("تم توليد كشف الحساب عبر نظام إدارة المختبر", 105, 285, { align: "center" });

    doc.save(`كشف_حساب_${doctorName}.pdf`);
    setLoading(false);
  }

  return (
    <Button variant="outline" size="sm" disabled={loading} onClick={handleExport} title="تصدير PDF">
      <Download className="ml-1" /> PDF
    </Button>
  );
};
