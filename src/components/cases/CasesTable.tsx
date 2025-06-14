
import React, { useState } from "react";
import { Eye, Edit, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CasesTableProps {
  cases: any[];
  onView?: (caseId: string) => void;
  onEdit?: (caseItem: any) => void;
  onDelete?: (caseId: string) => void;
  getStatusColor?: (status: string) => string;
  onStatusChange?: (caseItem: any, targetStatus: string) => Promise<void>;
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

  const [loadingId, setLoadingId] = useState<string | null>(null);

  // دالة معالجة تغيير الحالة: تنقلب بين قيد التنفيذ وتم التسليم
  const handleStatusClick = async (caseItem: any) => {
    if (!onStatusChange || loadingId) return;
    // حدد الحالة الجديدة
    const newStatus = caseItem.status === "قيد التنفيذ" ? "تم التسليم" : "قيد التنفيذ";
    setLoadingId(caseItem.id);
    await onStatusChange(caseItem, newStatus);
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
              {/* زر الحالة أيقونة وقابل للتحويل */}
              <td className="px-4 py-2 text-center">
                <button
                  type="button"
                  className={`
                    inline-flex items-center gap-1 justify-center rounded-full font-bold select-none transition-all text-sm
                    px-3 py-1
                    ${
                      caseItem.status === "تم التسليم"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-50 text-yellow-800 hover:bg-yellow-200"
                    }
                    ${loadingId === caseItem.id ? "opacity-50 cursor-wait" : "cursor-pointer"}
                  `}
                  onClick={() => handleStatusClick(caseItem)}
                  title="اضغط لتبديل حالة التنفيذ"
                  style={{ minWidth: 110 }}
                  disabled={!!loadingId}
                  >
                  {/* حالة التحميل */}
                  {loadingId === caseItem.id ? (
                    <span>...جارٍ الحفظ</span>
                  ) : (
                    <>
                      {/* نص الحالة مع الرمز */}
                      {caseItem.status === "تم التسليم" ? (
                        <>
                          <span>تم التسليم</span>
                          <Check className="inline" size={17} />
                        </>
                      ) : (
                        <>
                          <span>قيد التنفيذ</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </td>
              <td className="px-4 py-2 flex gap-2 flex-wrap items-center min-w-[120px] justify-center">
                {/* الإجراءات: فقط رموز بدون نص */}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
