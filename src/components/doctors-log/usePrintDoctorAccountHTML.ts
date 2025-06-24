
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
  const printHTML = async ({
    doctorName,
    summary,
    doctorCases,
    fromDate,
    toDate,
  }: PrintArgs) => {
    // فلترة الحالات بحيث تعتمد بشكل حصري الآن على submission_date فقط
    let filteredCases = (doctorCases || []).filter((c: any) => !!c?.submission_date);

    if (fromDate || toDate) {
      filteredCases = filteredCases.filter((c: any) => {
        const submissionDate = new Date(c.submission_date);
        if (fromDate && submissionDate < new Date(fromDate.setHours(0, 0, 0, 0))) return false;
        if (toDate && submissionDate > new Date(toDate.setHours(23, 59, 59, 999))) return false;
        return true;
      });
    }

    // جلب الدفعات للطبيب من قاعدة البيانات
    const { supabase } = await import("@/integrations/supabase/client");
    let doctorPayments: any[] = [];
    
    try {
      const { data: paymentsData, error } = await supabase
        .from("doctor_transactions")
        .select("*")
        .eq("doctor_id", doctorCases[0]?.doctor_id)
        .eq("transaction_type", "دفعة");

      if (!error && paymentsData) {
        doctorPayments = paymentsData;
      }
    } catch (error) {
      console.error("خطأ في جلب الدفعات:", error);
    }

    // فلترة الدفعات حسب الفترة المحددة
    let filteredPayments = doctorPayments;
    if (fromDate || toDate) {
      filteredPayments = doctorPayments.filter((payment: any) => {
        const paymentDate = new Date(payment.transaction_date);
        if (fromDate && paymentDate < new Date(fromDate.setHours(0, 0, 0, 0))) return false;
        if (toDate && paymentDate > new Date(toDate.setHours(23, 59, 59, 999))) return false;
        return true;
      });
    }

    // حساب البيانات المالية للفترة المحددة
    const periodTotalDue = filteredCases.reduce((sum: number, c: any) => sum + (Number(c.price) || 0), 0);
    const periodTotalPaid = filteredPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
    const periodNetAmount = periodTotalDue - periodTotalPaid;

    // حساب عدد الأسنان المعالجة في الفترة
    const periodTeethCount = filteredCases.reduce((total: number, c: any) => {
      if (c?.number_of_teeth && Number(c.number_of_teeth) > 0) {
        return total + Number(c.number_of_teeth);
      } else if (c?.tooth_number) {
        return total + c.tooth_number.split(" ").filter(Boolean).length;
      }
      return total;
    }, 0);

    // حساب الدين السابق (ما قبل الفترة المحددة)
    let previousDebt = 0;
    if (fromDate) {
      const casesBeforePeriod = (doctorCases || []).filter((c: any) => {
        if (!c?.submission_date) return false;
        const submissionDate = new Date(c.submission_date);
        return submissionDate < new Date(fromDate.setHours(0, 0, 0, 0));
      });
      
      const paymentsBeforePeriod = doctorPayments.filter((payment: any) => {
        const paymentDate = new Date(payment.transaction_date);
        return paymentDate < new Date(fromDate.setHours(0, 0, 0, 0));
      });

      const totalDueBeforePeriod = casesBeforePeriod.reduce((sum: number, c: any) => sum + (Number(c.price) || 0), 0);
      const totalPaidBeforePeriod = paymentsBeforePeriod.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
      previousDebt = totalDueBeforePeriod - totalPaidBeforePeriod;
    }

    // إجمالي صافي المبلغ والدين السابق
    const totalNetAmountWithPreviousDebt = periodNetAmount + previousDebt;

    // فتح نافذة جديدة للطباعة
    const printWindow = window.open("", "_blank", "width=900,height=900,scrollbars=yes") as Window;
    if (!printWindow) {
      toast({
        title: "لم يتم فتح نافذة الطباعة",
        description: "يرجى السماح بالنوافذ المنبثقة (popups) في متصفحك.",
        variant: "destructive"
      });
      return;
    }

    // بيانات الحالات مع الأعمدة المطلوبة
    const tableRows = filteredCases.map(
      (c: any) => {
        // عرض حقل تاريخ الاستلام بصيغة yyyy-mm-dd
        let submissionDateField = "";
        if (c?.submission_date) {
          try {
            const dt = new Date(c.submission_date);
            submissionDateField = dt.toLocaleDateString("ar-EG");
          } catch (e) {
            submissionDateField = String(c.submission_date).slice(0, 10);
          }
        }
        return `
      <tr>
        <td>${c?.patient_name ?? ""}</td>
        <td>${c?.work_type ?? ""}</td>
        <td>${c?.shade ?? ""}</td>
        <td>${(c?.price != null && c?.price !== undefined && !isNaN(Number(c.price))) ? Number(c.price).toLocaleString() : ""}</td>
        <td>${c?.number_of_teeth ?? ""}</td>
        <td>${c?.tooth_number ?? ""}</td>
        <td>${c?.status ?? ""}</td>
        <td>${submissionDateField}</td>
      </tr>
    `
      }
    ).join("");

    // بيانات الدفعات
    const paymentRows = filteredPayments.map((payment: any) => {
      const paymentDate = new Date(payment.transaction_date).toLocaleDateString("ar-EG");
      const checkCashDate = payment.check_cash_date ? new Date(payment.check_cash_date).toLocaleDateString("ar-EG") : "";
      return `
        <tr>
          <td>${paymentDate}</td>
          <td>${Number(payment.amount).toLocaleString()}</td>
          <td>${payment.payment_method ?? ""}</td>
          <td>${checkCashDate}</td>
          <td>${payment.notes ?? ""}</td>
        </tr>
      `;
    }).join("");

    const style = `
      <style>
        body { font-family: "Cairo", Arial, sans-serif; direction: rtl; background: #f4f7fc; color: #233266; }
        h1 { text-align: center; font-size: 2.1rem; margin-top: 1.5rem; }
        h2 { color: #233266; font-size: 1.2rem; margin-bottom:0 }
        h3 { color: #233266; font-size: 1.1rem; margin: 20px 0 10px; }
        .summary { 
          background: #e8edf9; margin: 24px auto 15px; border-radius: 13px;
          width: 85%; padding: 16px; box-shadow:0 2px 8px #e0e6f9;
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size:1.07rem;
        }
        .summary-item { }
        .summary-label { color: #314295; margin-left: 7px;}
        .summary-value { font-weight: bold;}
        .red { color: #e73737 }
        .green { color: #28a745 }
        .table-container { width: 98%; margin: 1rem auto 2rem; }
        table { border-collapse: collapse; width: 100%; background: white; margin-bottom: 20px;}
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
        الفترة بناءً على <b>تاريخ الاستلام</b>: 
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
          <div class="summary-item"><span class="summary-label">إجمالي المستحق خلال الفترة:</span> <span class="summary-value">${periodTotalDue.toLocaleString()} ₪</span></div>
          <div class="summary-item"><span class="summary-label">إجمالي المدفوع خلال الفترة:</span> <span class="summary-value green">${periodTotalPaid.toLocaleString()} ₪</span></div>
          <div class="summary-item"><span class="summary-label">عدد الأسنان المعالجة:</span> <span class="summary-value">${periodTeethCount} سن</span></div>
          <div class="summary-item"><span class="summary-label">صافي المبلغ للفترة:</span> <span class="summary-value">${periodNetAmount.toLocaleString()} ₪</span></div>
          <div class="summary-item"><span class="summary-label">الدين السابق:</span> <span class="summary-value red">${previousDebt.toLocaleString()} ₪</span></div>
          <div class="summary-item"><span class="summary-label">إجمالي صافي المبلغ والدين:</span> <span class="summary-value red">${totalNetAmountWithPreviousDebt.toLocaleString()} ₪</span></div>
        </div>
        
        <div class="table-container">
          <h3>تفاصيل الحالات خلال الفترة</h3>
          <table>
            <thead>
              <tr>
                <th>اسم المريض</th>
                <th>نوع العمل</th>
                <th>اللون</th>
                <th>المبلغ</th>
                <th>عدد الأسنان</th>
                <th>رقم/أرقام الأسنان</th>
                <th>الحالة</th>
                <th>تاريخ الاستلام</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || "<tr><td colspan='8' style='text-align:center;color:#aaa'>لا توجد حالات لعرضها</td></tr>"}
            </tbody>
          </table>
        </div>

        <div class="table-container">
          <h3>الدفعات خلال الفترة</h3>
          <table>
            <thead>
              <tr>
                <th>تاريخ الدفع</th>
                <th>المبلغ</th>
                <th>طريقة الدفع</th>
                <th>تاريخ صرف الشيك</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${paymentRows || "<tr><td colspan='5' style='text-align:center;color:#aaa'>لا توجد دفعات لعرضها</td></tr>"}
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
