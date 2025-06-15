
import { toast } from "@/hooks/use-toast";

// استدع هذا الهوك لطباعة كشف حساب الطبيب كصفحة HTML منسقة للطباعة

interface FinancialSummary {
  totalDue: number;
  totalPaid: number;
  remaining: number;
}
interface PrintArgs {
  doctorName: string;
  summary: FinancialSummary;
  doctorCases: any[];
  fromDate?: Date;
  toDate?: Date;
}

export function usePrintDoctorAccountHTML() {
  const printHTML = ({
    doctorName,
    summary,
    doctorCases,
    fromDate,
    toDate,
  }: PrintArgs) => {
    // فتح نافذة جديدة
    const printWindow = window.open("", "_blank", "width=900,height=900,scrollbars=yes") as Window;
    if (!printWindow) {
      toast({
        title: "لم يتم فتح نافذة الطباعة",
        description: "يرجى السماح بالنوافذ المنبثقة (popups) في متصفحك.",
        variant: "destructive"
      });
      return;
    }

    // بيانات الحالات
    const tableRows = doctorCases.map(
      (c: any) => `
      <tr>
        <td>${c?.patient_name ?? ""}</td>
        <td>${c?.work_type ?? ""}</td>
        <td>${(c?.price != null && c?.price !== undefined && !isNaN(Number(c.price))) ? Number(c.price).toLocaleString() : ""}</td>
        <td>${c?.status ?? ""}</td>
        <td>${c?.delivery_date ?? (c?.created_at ? String(c.created_at).slice(0,10) : "")}</td>
        <td>${c?.id?.slice(0, 6) ? c.id.slice(0, 6) + "..." : ""}</td>
      </tr>
    `
    ).join("");

    const style = `
      <style>
        body { font-family: "Cairo", Arial, sans-serif; direction: rtl; background: #f4f7fc; color: #233266; }
        h1 { text-align: center; font-size: 2.1rem; margin-top: 1.5rem; }
        h2 { color: #233266; font-size: 1.2rem; margin-bottom:0 }
        .summary { 
          background: #e8edf9; margin: 24px auto 15px; border-radius: 13px;
          width: 85%; padding: 16px; box-shadow:0 2px 8px #e0e6f9;
          display: flex; gap: 60px; justify-content: space-between; font-size:1.07rem;
        }
        .summary-item { }
        .summary-label { color: #314295; margin-left: 7px;}
        .summary-value { font-weight: bold;}
        .red { color: #e73737 }
        .table-container { width: 94%; margin: 1rem auto 2rem; }
        table { border-collapse: collapse; width: 100%; background: white;}
        th, td { border: 1px solid #bbbde6; padding: 7px 3px; text-align: right;}
        th { background: #283366; color: white; }
        tfoot td { background: #eff2fb; color:#314295; font-weight: bold; }
        .footer { text-align: center; color: #868ccd; font-size: 1rem; margin-top:1.4rem; }
        @media print {
          body { margin: 0; }
          .footer { font-size: 0.9rem; color: #aaa !important;}
        }
      </style>
    `;

    let dateRange = "";
    if (fromDate || toDate) {
      dateRange = `<div style="text-align:center;color:#2c4069;font-size:1rem;">
        الفترة: 
        ${fromDate ? fromDate.toLocaleDateString("ar-EG") : "..."} 
        - 
        ${toDate ? toDate.toLocaleDateString("ar-EG") : "..."}
      </div>`;
    }

    const htmlContent = `
      <html lang="ar">
      <head>
        <title>كشف حساب الطبيب - ${doctorName}</title>
        <meta charset="UTF-8" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
        ${style}
      </head>
      <body>
        <h1>كشف حساب الطبيب</h1>
        <h2 style="text-align:center;font-weight:600;margin-bottom:18px;">${doctorName}</h2>
        ${dateRange}
        <div class="summary">
          <div class="summary-item"><span class="summary-label">إجمالي المستحق:</span> <span class="summary-value">${(summary.totalDue ?? 0).toLocaleString()} ₪</span></div>
          <div class="summary-item"><span class="summary-label">المدفوع:</span> <span class="summary-value">${(summary.totalPaid ?? 0).toLocaleString()} ₪</span></div>
          <div class="summary-item"><span class="summary-label">المتبقي (دين):</span> <span class="summary-value red">${(summary.remaining ?? 0).toLocaleString()} ₪</span></div>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>اسم المريض</th>
                <th>نوع العمل</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>تاريخ التسليم</th>
                <th>رقم الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || "<tr><td colspan='6' style='text-align:center;color:#aaa'>لا توجد حالات لعرضها</td></tr>"}
            </tbody>
          </table>
        </div>
        <div class="footer">
          تم إنشاء كشف الحساب بواسطة نظام إدارة المختبر - ${new Date().toLocaleDateString("ar-EG")}
        </div>
        <script>
          // طباعة تلقائية عند الفتح
          window.onload = function() { setTimeout(() => { window.print(); }, 333); }
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    toast({ title:"تم فتح نافذة الطباعة", description: "يمكنك الآن طباعة الكشف أو حفظه كملف PDF.", variant:"default" });
  };
  return { printHTML };
}
