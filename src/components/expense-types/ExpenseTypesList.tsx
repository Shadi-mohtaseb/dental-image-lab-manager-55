
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2 } from "lucide-react";
import { useUpdateExpenseType, useDeleteExpenseType } from "./useExpenseTypesData";

interface ExpenseTypesListProps {
  expenseTypes: any[];
  isLoading: boolean;
}

export function ExpenseTypesList({ expenseTypes, isLoading }: ExpenseTypesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const updateType = useUpdateExpenseType();
  const deleteType = useDeleteExpenseType();

  const handleUpdate = () => {
    if (editingId && editingName.trim()) {
      updateType.mutate({ id: editingId, name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا النوع؟")) {
      deleteType.mutate(id);
    }
  };

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">جاري التحميل...</div>
      ) : expenseTypes.length === 0 ? (
        <div className="text-center py-4 text-gray-500">لا توجد أنواع مصروفات مسجلة</div>
      ) : (
        expenseTypes.map((type: any) => (
          <div key={type.id} className="flex items-center gap-2 p-2 border rounded">
            {editingId === type.id ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleUpdate} disabled={updateType.isPending}>
                  حفظ
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  إلغاء
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1">{type.name}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(type.id);
                    setEditingName(type.name);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => handleDelete(type.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
