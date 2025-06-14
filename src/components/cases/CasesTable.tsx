import React from "react";

export function CasesTable({ cases }: { cases: any[] }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">اسم المريض</th>
            <th className="px-4 py-2">تاريخ الاستلام</th>
            <th className="px-4 py-2">السعر</th>
            {/* ... باقي الأعمدة ... */}
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
              {/* ... باقي الأعمدة ... */}
              <td className="px-4 py-2">
                {/* ... الإجراءات ... */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
