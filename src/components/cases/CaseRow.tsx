
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, View } from "lucide-react";
import { useUpdateCase, useDeleteCase } from "@/hooks/useCases";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CaseRow({ caseItem }: { caseItem: any }) {
  const updateCase = useUpdateCase();
  const deleteCase = useDeleteCase();
  const [loading, setLoading] = useState(false);

  // تحديث الحالة عند الضغط عليها إذا كانت "قيد التنفيذ"
  const handleStatusClick = async () => {
    if (caseItem.status !== "قيد التنفيذ" || loading) return;
    setLoading(true);
    try {
      await updateCase.mutateAsync({
        id: caseItem.id,
        status: "تم التسليم",
      });
      toast({
        title: "تم تحديث الحالة",
        description: "تم تغيير حالة الحالة إلى 'تم التسليم'.",
      });
    } catch {
      toast({
        title: "خطأ!",
        description: "حدث خطأ أثناء تحديث الحالة.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // حذف الحالة (مع تأكيد)
  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحالة؟")) {
      await deleteCase.mutateAsync(caseItem.id);
    }
  };

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
      <td
        className={`px-4 py-2 select-none cursor-pointer transition-all ${
          (caseItem.status === "تم التسليم")
            ? "bg-green-100 text-green-700 font-bold cursor-not-allowed"
            : "bg-yellow-50 text-yellow-800 hover:bg-yellow-200"
        }`}
        onClick={handleStatusClick}
        title={caseItem.status === "قيد التنفيذ" ? "اضغط لتغيير الحالة إلى تم التسليم" : undefined}
        style={{ minWidth: 110 }}
      >
        {loading
          ? "جارٍ الحفظ..."
          : caseItem.status}
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-2 justify-center">
          <Link to={`/case/${caseItem.id}`}>
            <Button variant="outline" size="icon" className="text-blue-600 border-blue-200 hover:bg-blue-50" title="عرض">
              <View />
            </Button>
          </Link>
          <Link to={`/case/${caseItem.id}`}>
            <Button variant="outline" size="icon" className="text-primary hover:bg-blue-50" title="تعديل">
              <Edit />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="text-red-600 hover:bg-red-50"
            title="حذف"
            onClick={handleDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </td>
    </tr>
  );
}
