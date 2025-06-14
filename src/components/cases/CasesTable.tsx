
import React, { useState } from "react";
import { Eye, Edit, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CasesTableProps {
  cases: any[];
  onView?: (caseId: string) => void;
  onEdit?: (caseItem: any) => void;
  onDelete?: (caseId: string) => void;
  getStatusColor?: (status: string) => string;
  onStatusChange?: (caseItem: any) => Promise<void>; // NEW: لتفعيل تغيير الحالة
}

export function CasesTable({
  cases,
  onView,
  onEdit,
  onDelete,
  getStatusColor,
  onStatusChange,
}: CasesTableProps) {
  // دالة لإظهار السعر الإجمالي بناء على المشكلة المذكورة
  const getTotalPrice = (caseItem: any) => {
    if (
      caseItem.price &&
      caseItem.number_of_teeth &&
      Number(caseItem.number_of_teeth) > 1 &&
      (Number(caseItem.price) === Number(caseItem.price) / Number(caseItem.number_of_teeth) || Number(caseItem.price) < 200)
    ) {
      return `${Number(caseItem.price) * Number(caseItem.number_of_teeth)} ₪`;
    }
    return caseItem.price ? `${caseItem.price} ₪` : "-";
  };

  // لتتبع التحميل أثناء تغيير الحالة
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // دالة معالجة تغيير الحالة
  const handleStatusClick = async (caseItem: any) => {
    if (!onStatusChange || caseItem.status !== "قيد التنفيذ" || loadingId) return;
    setLoadingId(caseItem.id);
    await onStatusChange(caseItem);
    setLoadingId(null);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">اسم الطبيب</th>
            <th className="px-4 py-2">اسم المريض</th>
            <th className="px-4 py-2">تاريخ الاستلام</th>
            <th className="px-4 py-2">السعر الإجمالي</th>
            <th className="px-4 py-2">عدد الأسنان</th>
            <th className="px-4 py-2">نوع العمل</th>
            <th className="px-4 py-2">اللون</th>
            <th className="px-4 py-2">بلوك الزيركون</th>
            <th className="px-4 py-2">الحالة</th>
            <th className="px-4 py-2">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caseItem) => (
            <tr key={caseItem.id}>
              <td className="px-4 py-2">{caseItem.doctor_name || caseItem.doctor?.name || "-"}</td>
              <td className="px-4 py-2">{caseItem.patient_name}</td>
              <td className="px-4 py-2">
                {caseItem.submission_date
                  ? new Date(caseItem.submission_date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "-"}
              </td>
              <td className="px-4 py-2">{getTotalPrice(caseItem)}</td>
              <td className="px-4 py-2">{caseItem.number_of_teeth || "-"}</td>
              <td className="px-4 py-2">{caseItem.work_type || "-"}</td>
              <td className="px-4 py-2">{caseItem.shade || "-"}</td>
              <td className="px-4 py-2">{caseItem.zircon_block_type || "-"}</td>
              <td className="px-4 py-2">
                <span
                  className={`
                    inline-flex items-center justify-center rounded-full font-bold select-none transition-all
                    ${caseItem.status === "تم التسليم"
                      ? "bg-green-100 text-green-700 px-3 py-1 cursor-not-allowed"
                      : "bg-yellow-50 text-yellow-800 px-3 py-1 hover:bg-yellow-200 cursor-pointer"
                    }
                  `}
                  onClick={() => handleStatusClick(caseItem)}
                  title={caseItem.status === "قيد التنفيذ" ? "اضغط لتغيير الحالة إلى تم التسليم" : undefined}
                  style={{ minWidth: 110 }}
                  >
                  {loadingId === caseItem.id
                    ? "جارٍ الحفظ..."
                    : caseItem.status
                  }
                  {/* رمز صح للحالة المسلمة */}
                  {caseItem.status === "تم التسليم" && (
                    <Check className="ml-1 inline-block" size={16} />
                  )}
                </span>
              </td>
              <td className="px-4 py-2 flex gap-2 flex-wrap items-center min-w-[120px]">
                {onView && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    title="عرض"
                    onClick={() => onView(caseItem.id)}
                  >
                    <Eye />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-primary hover:bg-blue-50"
                    title="تعديل"
                    onClick={() => onEdit(caseItem)}
                  >
                    <Edit />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    title="حذف"
                    onClick={() => onDelete(caseItem.id)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
