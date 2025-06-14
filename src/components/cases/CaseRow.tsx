
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type CaseRowProps = {
  caseItem: Tables<"cases"> & { doctor?: { name?: string } };
  onView: (caseId: string) => void;
  onEdit: (caseItem: Tables<"cases">) => void;
  onDelete: (caseId: string) => void;
  getStatusColor: (status: string) => string;
};

export function CaseRow({ caseItem, onView, onEdit, onDelete, getStatusColor }: CaseRowProps) {
  // حساب عدد الأسنان من القيمة المفصولة بفواصل (مثلاً: "16,17,21")
  const teethCount =
    caseItem.tooth_number && caseItem.tooth_number.trim().length > 0
      ? caseItem.tooth_number.split(",").filter((num) => num.trim().length > 0).length
      : 0;

  return (
    <tr className="hover:bg-gray-50">
      <td className="font-semibold text-primary">{caseItem.case_number}</td>
      <td>{caseItem.patient_name}</td>
      <td>{caseItem.doctor?.name || "غير محدد"}</td>
      <td>
        <Badge variant="outline">{caseItem.work_type}</Badge>
      </td>
      <td className="text-center">
        {caseItem.tooth_number && (
          <div className="flex flex-col items-center space-y-1">
            <Badge className="bg-gray-100 text-gray-700">
              {caseItem.tooth_number}
            </Badge>
            <span className="text-xs text-gray-500 mt-1">
              ({teethCount} سن)
            </span>
          </div>
        )}
      </td>
      <td>
        {new Date(caseItem.submission_date).toLocaleDateString('en-US')}
      </td>
      <td>
        <Badge className={getStatusColor(caseItem.status)}>
          {caseItem.status}
        </Badge>
      </td>
      <td>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(caseItem.id)}
            className="text-blue-600 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 hover:bg-green-50"
            onClick={() => onEdit(caseItem)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={() => onDelete(caseItem.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
