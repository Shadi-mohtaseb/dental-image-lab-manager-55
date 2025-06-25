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
        body { font-family: "Cairo", Arial, sans-serif; direction: rtl; background: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .lab-name { font-size: 1.8rem; font-weight: bold; color: #0f172a; margin-bottom: 8px; }
        .statement-title { font-size: 1.5rem; color: #334155; margin-bottom: 8px; }
        .doctor-name { font-size: 1.3rem; font-weight: 600; color: #475569; margin-bottom: 20px; }
        .date-range { color: #64748b; font-size: 1rem; margin-bottom: 20px; }
        .table-container { width: 100%; margin: 20px auto; }
        table { border-collapse: collapse; width: 100%; background: white; margin-bottom: 25px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        th, td { border: 1px solid #e2e8f0; padding: 12px 8px; text-align: right; }
        th { background: #1e40af; color: white; font-weight: bold; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody tr:hover { background: #e2e8f0; }
        .summary-table th { background: #1e40af; }
        .summary-table .label-col { font-weight: bold; color: #064e3b; }
        .summary-table .value-col { font-weight: bold; }
        .red { color: #dc2626; }
        .green { color: #059669; }
        .blue { color: #2563eb; }
        .footer { text-align: center; color: #64748b; font-size: 0.9rem; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        @media print {
          body { margin: 0; padding: 15px; }
          .footer { font-size: 0.8rem; }
          table { box-shadow: none; }
        }
      </style>
    `;

    let dateRange = "";
    if (fromDate || toDate) {
      dateRange = `<div class="date-range">
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
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        ${style}
      </head>
      <body>
        <div class="header">
          <div class="lab-name">مختبر الأسنان الطبي</div>
          <div class="statement-title">كشف حساب الطبيب</div>
          <div class="doctor-name">${doctorName}</div>
          ${dateRange}
        </div>
        
        <div class="table-container">
          <h3 style="color: #1e40af; margin-bottom: 10px;">تفاصيل الحالات خلال الفترة</h3>
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
              ${tableRows || "<tr><td colspan='8' style='text-align:center;color:#64748b'>لا توجد حالات لعرضها</td></tr>"}
            </tbody>
          </table>
        </div>

        <div class="table-container">
          <h3 style="color: #1e40af; margin-bottom: 10px;">الدفعات خلال الفترة</h3>
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
              ${paymentRows || "<tr><td colspan='5' style='text-align:center;color:#64748b'>لا توجد دفعات لعرضها</td></tr>"}
            </tbody>
          </table>
        </div>

        <div class="table-container">
          <h3 style="color: #1e40af; margin-bottom: 10px;">ملخص الحساب</h3>
          <table class="summary-table">
            <thead>
              <tr>
                <th style="width: 60%;">البيان</th>
                <th style="width: 40%;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="label-col">إجمالي المستحق خلال الفترة</td>
                <td class="value-col blue">${periodTotalDue.toLocaleString()} ₪</td>
              </tr>
              <tr>
                <td class="label-col">إجمالي المدفوع خلال الفترة</td>
                <td class="value-col green">${periodTotalPaid.toLocaleString()} ₪</td>
              </tr>
              <tr>
                <td class="label-col">عدد الأسنان المعالجة</td>
                <td class="value-col">${periodTeethCount} سن</td>
              </tr>
              <tr>
                <td class="label-col">صافي المبلغ للفترة</td>
                <td class="value-col">${periodNetAmount.toLocaleString()} ₪</td>
              </tr>
              <tr>
                <td class="label-col">الدين السابق</td>
                <td class="value-col red">${previousDebt.toLocaleString()} ₪</td>
              </tr>
              <tr style="background: #fef3c7; font-weight: bold;">
                <td class="label-col" style="color: #92400e;">إجمالي صافي المبلغ والدين</td>
                <td class="value-col red" style="font-size: 1.1rem;">${totalNetAmountWithPreviousDebt.toLocaleString()} ₪</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          تم إنشاء كشف الحساب بواسطة نظام إدارة مختبر الأسنان الطبي - ${new Date().toLocaleDateString("ar-EG")}
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
