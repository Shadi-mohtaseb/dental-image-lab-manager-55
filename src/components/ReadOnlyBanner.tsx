import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { AlertTriangle } from "lucide-react";

export function ReadOnlyBanner() {
  const { isReadOnly } = useSubscriptionContext();

  if (!isReadOnly) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 mb-4 flex items-center gap-2" dir="rtl">
      <AlertTriangle className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium">
        انتهى اشتراكك. النظام في وضع القراءة فقط. تواصل مع المدير لتجديد الاشتراك.
      </span>
    </div>
  );
}
