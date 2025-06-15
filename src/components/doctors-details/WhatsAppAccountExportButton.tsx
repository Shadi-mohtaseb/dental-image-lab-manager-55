
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { buildWhatsappLink } from "@/utils/whatsapp";

interface Props {
  doctor: {
    name: string;
    phone?: string;
  };
  summary: {
    totalDue: number;
    totalPaid: number;
    remaining: number;
  };
  casesCount: number;
  totalTeeth: number;
}

export const WhatsAppAccountExportButton: React.FC<Props> = ({
  doctor,
  summary,
  casesCount,
  totalTeeth,
}) => {
  const hasPhone = doctor?.phone && 
    typeof doctor.phone === "string" && 
    doctor.phone.trim() !== "";

  // تجهيز كشف الحساب المفصل
  const accountStatement = `
*كشف حساب الطبيب*
الدكتور: ${doctor.name}

📊 *ملخص الحساب:*
• إجمالي المستحق: ${summary.totalDue.toFixed(2)} ₪
• المدفوع: ${summary.totalPaid.toFixed(2)} ₪
• المتبقي (الدين): ${summary.remaining.toFixed(2)} ₪

📈 *إحصائيات:*
• عدد الحالات: ${casesCount}
• إجمالي الأسنان: ${totalTeeth}

🏥 *مختبر الأسنان*
تاريخ الكشف: ${new Date().toLocaleDateString('ar-EG')}
  `.trim();

  if (!hasPhone) {
    return (
      <Button variant="outline" size="sm" disabled title="لا يتوفر رقم هاتف للطبيب">
        <MessageCircle className="ml-1" /> 
        إرسال كشف الحساب
      </Button>
    );
  }

  const whatsappLink = buildWhatsappLink(doctor.phone!, accountStatement);

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      title="إرسال كشف الحساب عبر واتساب"
    >
      <Button 
        variant="outline" 
        size="sm"
        className="text-green-600 border-green-300 hover:bg-green-50"
      >
        <MessageCircle className="ml-1" /> 
        إرسال كشف الحساب
      </Button>
    </a>
  );
};
