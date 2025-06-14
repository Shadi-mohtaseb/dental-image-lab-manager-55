
import React from "react";

interface CasesTableProps {
  cases: any[];
  onView?: (caseId: string) => void;
  onEdit?: (caseItem: any) => void;
  onDelete?: (caseId: string) => void;
  getStatusColor?: (status: string) => string;
}

export function CasesTable({
  cases,
  onView,
  onEdit,
  onDelete,
  getStatusColor,
}: CasesTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">اسم المريض</th>
            <th className="px-4 py-2">تاريخ الاستلام</th>
            <th className="px-4 py-2">السعر</th>
            <th className="px-4 py-2">اسم الطبيب</th>
            <th className="px-4 py-2">اسم الشراكة</th>
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
              <td className="px-4 py-2">{caseItem.patient_name}</td>
              <td className="px-4 py-2">
                {caseItem.receive_date
                  ? new Date(caseItem.receive_date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "-"}
              </td>
              <td className="px-4 py-2">
                {caseItem.price ? `${caseItem.price} ₪` : "-"}
              </td>
              <td className="px-4 py-2">{caseItem.doctor_name || caseItem.doctor?.name || "-"}</td>
              <td className="px-4 py-2">{caseItem.partnership_name || "-"}</td>
              <td className="px-4 py-2">{caseItem.work_type || "-"}</td>
              <td className="px-4 py-2">{caseItem.shade || "-"}</td>
              <td className="px-4 py-2">{caseItem.zircon_block_type || "-"}</td>
              <td className="px-4 py-2">
                {caseItem.status && getStatusColor ? (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      caseItem.status
                    )}`}
                  >
                    {caseItem.status}
                  </span>
                ) : (
                  caseItem.status || "-"
                )}
              </td>
              <td className="px-4 py-2 flex gap-2 flex-wrap">
                {/* View Button */}
                {onView && (
                  <button
                    className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => onView(caseItem.id)}
                  >
                    عرض
                  </button>
                )}
                {/* Edit Button */}
                {onEdit && (
                  <button
                    className="text-xs px-2 py-1 rounded bg-blue-200 hover:bg-blue-300"
                    onClick={() => onEdit(caseItem)}
                  >
                    تعديل
                  </button>
                )}
                {/* Delete Button */}
                {onDelete && (
                  <button
                    className="text-xs px-2 py-1 rounded bg-red-200 hover:bg-red-300"
                    onClick={() => onDelete(caseItem.id)}
                  >
                    حذف
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

