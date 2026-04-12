import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  const generateHTML = () => {
    const casesRows = doctorData.cases.map((c: any) => `
      <tr>
        <td>${c.patient_name || ""}</td>
        <td>${c.submission_date ? new Date(c.submission_date).toLocaleDateString("ar-EG") : ""}</td>
        <td>${c.work_type || ""}</td>
        <td>${c.tooth_number || "-"}</td>
        <td>${c.teeth_count || 1}</td>
        <td>${Number(c.price || 0).toLocaleString("ar-EG")} ₪</td>
        <td>${c.status || ""}</td>
      </tr>
    `).join("");

    const transactionsRows = doctorData.transactions.map((t: any) => `
      <tr>
        <td>${t.transaction_type || ""}</td>
        <td>${Number(t.amount || 0).toLocaleString("ar-EG")} ₪</td>
        <td>${t.payment_method || "-"}</td>
        <td>${t.transaction_date ? new Date(t.transaction_date).toLocaleDateString("ar-EG") : ""}</td>
        <td>${t.status || "-"}</td>
        <td>${t.notes || "-"}</td>
      </tr>
    `).join("");

    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير حساب الطبيب - ${doctorData.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; padding: 30px; color: #1a1a2e; background: #fff; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #283366; padding-bottom: 20px; }
    .header h1 { font-size: 24px; color: #283366; margin-bottom: 8px; }
    .header h2 { font-size: 18px; color: #555; }
    .info { margin-bottom: 20px; font-size: 14px; }
    .info p { margin: 4px 0; }
    .summary-box { background: #ebedf9; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-around; }
    .summary-item { text-align: center; }
    .summary-item .label { font-size: 12px; color: #666; }
    .summary-item .value { font-size: 18px; font-weight: bold; color: #283366; }
    .summary-item.danger .value { color: #c82233; }
    h3 { font-size: 16px; color: #283366; margin: 20px 0 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
    th { background: #283366; color: #fff; padding: 8px 6px; text-align: center; font-weight: bold; }
    td { padding: 6px; border: 1px solid #ddd; text-align: center; }
    tr:nth-child(even) { background: #f8f8fc; }
    .footer { text-align: center; font-size: 11px; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; }
    @media print { body { padding: 15px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>تقرير حساب الطبيب</h1>
    <h2>${doctorData.name}</h2>
  </div>
  <div class="info">
    <p><strong>اسم الطبيب:</strong> ${doctorData.name}</p>
    ${doctorData.phone ? `<p><strong>الهاتف:</strong> ${doctorData.phone}</p>` : ""}
    <p><strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString("ar-EG")}</p>
  </div>
  <div class="summary-box">
    <div class="summary-item"><div class="label">إجمالي الحالات</div><div class="value">${summary.totalCases}</div></div>
    <div class="summary-item"><div class="label">إجمالي الأسنان</div><div class="value">${summary.totalTeeth}</div></div>
    <div class="summary-item"><div class="label">إجمالي المدفوعات</div><div class="value">${summary.totalPayments.toLocaleString("ar-EG")} ₪</div></div>
    <div class="summary-item ${summary.remainingBalance > 0 ? 'danger' : ''}"><div class="label">الرصيد المتبقي</div><div class="value">${Math.abs(summary.remainingBalance).toLocaleString("ar-EG")} ₪</div></div>
    <div class="summary-item"><div class="label">الحالة</div><div class="value">${summary.remainingBalance > 0 ? "مديون" : "مسدد"}</div></div>
  </div>
  ${doctorData.cases.length > 0 ? `
  <h3>الحالات</h3>
  <table>
    <thead><tr><th>المريض</th><th>التاريخ</th><th>نوع العمل</th><th>رقم السن</th><th>العدد</th><th>السعر</th><th>الحالة</th></tr></thead>
    <tbody>${casesRows}</tbody>
  </table>` : ""}
  ${doctorData.transactions.length > 0 ? `
  <h3>المعاملات المالية</h3>
  <table>
    <thead><tr><th>النوع</th><th>المبلغ</th><th>الطريقة</th><th>التاريخ</th><th>الحالة</th><th>ملاحظات</th></tr></thead>
    <tbody>${transactionsRows}</tbody>
  </table>` : ""}
  <div class="footer">تم توليد هذا التقرير عبر نظام إدارة المختبر</div>
</body>
</html>`;
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      const html = generateHTML();
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({ title: "يرجى السماح بالنوافذ المنبثقة", variant: "destructive" });
        return;
      }
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);

      toast({ title: "تم فتح نافذة الطباعة", description: "يمكنك حفظ التقرير كـ PDF من خيارات الطباعة" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "خطأ في إنشاء التقرير", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    const html = generateHTML();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "يرجى السماح بالنوافذ المنبثقة", variant: "destructive" });
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="flex gap-2 mb-6">
      <Button onClick={generatePDF} disabled={loading} className="flex items-center gap-2">
        <FileDown className="w-4 h-4" />
        {loading ? "جاري الإنشاء..." : "تحميل PDF"}
      </Button>
      <Button variant="outline" onClick={printReport} className="flex items-center gap-2">
        <Printer className="w-4 h-4" />
        طباعة
      </Button>
    </div>
  );
}
