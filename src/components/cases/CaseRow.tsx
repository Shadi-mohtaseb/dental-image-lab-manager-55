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
  // عرض عدد الأسنان من الحقل مباشرة دون الحساب من رقم السن
  const teethCount = caseItem.number_of_teeth ?? 0;

  return (
    <tr className="hover:bg-gray-50">
      <td>{caseItem.patient_name}</td>
      <td>{caseItem.doctor?.name || "غير محدد"}</td>
      <td>
        <Badge variant="outline">{caseItem.work_type}</Badge>
      </td>
      <td className="text-center">
        {caseItem.tooth_number ? (
          <Badge className="bg-gray-100 text-gray-700">
            {caseItem.tooth_number}
          </Badge>
        ) : (
          <span className="text-xs text-gray-400">غير محدد</span>
        )}
      </td>
      <td className="text-center">
        <span className="text-sm text-gray-600 font-bold">{caseItem.number_of_teeth ?? 0}</span>
      </td>
      <td className="text-center">
        {caseItem.shade ? (
          <Badge className="bg-gray-100 text-gray-700">{caseItem.shade}</Badge>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </td>
      <td className="text-center">
        {caseItem.zircon_block_type ? (
          <Badge className="bg-gray-100 text-gray-700">{caseItem.zircon_block_type}</Badge>
        ) : (
          <span className="text-xs text-gray-400">-</span>
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
