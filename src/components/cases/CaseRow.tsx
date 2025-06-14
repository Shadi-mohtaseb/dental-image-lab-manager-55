import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CaseRow({ caseItem }: { caseItem: any }) {
  return (
    <tr>
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
      <td className="px-4 py-2">{caseItem.doctor_name}</td>
      <td className="px-4 py-2">{caseItem.partnership_name}</td>
      <td className="px-4 py-2">{caseItem.work_type}</td>
      <td className="px-4 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={`/case/${caseItem.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                <span>تعديل</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>حذف</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
