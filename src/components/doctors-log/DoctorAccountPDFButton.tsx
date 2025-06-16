
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { DoctorPDFDateRangePicker } from "./DoctorPDFDateRangePicker";
import { usePrintDoctorAccountHTML } from "./usePrintDoctorAccountHTML";
import { useDoctorAccountPDFExport } from "./useDoctorAccountPDFExport";
import { buildWhatsappLink } from "@/utils/whatsapp";

interface Props {
  doctorName: string;
  summary: {
    totalDue: number;
    totalPaid: number;
    remaining: number;
  };
  doctorCases: any[];
  doctorId: string;
  doctorPhone?: string;
}

export const DoctorAccountPDFButton: React.FC<Props> = ({
  doctorName,
  summary,
  doctorId,
  doctorCases,
  doctorPhone,
}) => {
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { printHTML } = usePrintDoctorAccountHTML();
  const { exportPDF } = useDoctorAccountPDFExport();

  const handlePrint = () => {
    setPopoverOpen(false);
    console.log('doctorCases to print for', doctorName, doctorId, doctorCases);
    if (!doctorCases || doctorCases.length === 0) {
      toast({
        title: "لا توجد حالات للعرض",
        description: "لا يوجد أي حالة مرتبطة بهذا الطبيب للطباعة.",
        variant: "destructive"
      });
      return;
    }
    printHTML({
      doctorName,
      summary,
      doctorCases,
      fromDate,
      toDate,
    });
  };

  const handleSendToWhatsApp = async () => {
    setPopoverOpen(false);
    setLoading(true);

    if (!doctorPhone) {
      toast({
        title: "رقم الهاتف غير متوفر",
        description: "لا يمكن إرسال الكشف عبر الواتساب بدون رقم هاتف الطبيب.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    if (!doctorCases || doctorCases.length === 0) {
      toast({
        title: "لا توجد حالات للعرض",
        description: "لا يوجد أي حالة مرتبطة بهذا الطبيب لإرسالها.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      // توليد PDF وإنشاء رابط مؤقت
      const pdfUrl = await exportPDF({
        doctorName,
        summary,
        doctorCases,
        fromDate,
        toDate,
        downloadImmediately: false, // لا نريد تحميل الملف مباشرة
      });

      if (pdfUrl) {
        // إنشاء رسالة تحتوي على الرابط
        const message = `كشف حساب الطبيب ${doctorName}

إجمالي المستحق: ${summary.totalDue.toLocaleString()} ₪
المدفوع: ${summary.totalPaid.toLocaleString()} ₪
المتبقي: ${summary.remaining.toLocaleString()} ₪

يمكنك تحميل كشف الحساب من الرابط التالي:
${pdfUrl}

تم إنشاء هذا الكشف عبر نظام إدارة المختبر`;

        const whatsappLink = buildWhatsappLink(doctorPhone, message);
        window.open(whatsappLink, '_blank');

        toast({
          title: "تم فتح الواتساب",
          description: "تم إرسال كشف الحساب مع الرابط إلى الواتساب.",
          variant: "default"
        });
      } else {
        throw new Error("فشل في إنشاء ملف PDF");
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "لم يتم إرسال الكشف بنجاح. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} title="طباعة الكشف">
          <Printer className="ml-1" /> طباعة
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[330px] pointer-events-auto" align="end" sideOffset={6}>
        <DoctorPDFDateRangePicker
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          disabled={loading}
        />
        <div className="flex gap-2 mt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={handlePrint}
            className="flex-1"
            title="طباعة HTML"
          >
            <Printer className="ml-1" /> طباعة
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading || !doctorPhone}
            onClick={handleSendToWhatsApp}
            className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
            title={doctorPhone ? "إرسال للواتساب" : "رقم الهاتف غير متوفر"}
          >
            <MessageCircle className="ml-1" /> واتساب
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
