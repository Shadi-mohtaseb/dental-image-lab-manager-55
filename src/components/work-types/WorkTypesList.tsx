
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2 } from "lucide-react";
import { useUpdateWorkType, useDeleteWorkType } from "./useWorkTypesData";

interface WorkTypesListProps {
  workTypes: any[];
  isLoading: boolean;
}

export function WorkTypesList({ workTypes, isLoading }: WorkTypesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const updateWorkType = useUpdateWorkType();
  const deleteWorkType = useDeleteWorkType();

  const handleUpdate = () => {
    if (editingId && editingName.trim()) {
      updateWorkType.mutate({ id: editingId, name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا النوع؟")) {
      deleteWorkType.mutate(id);
    }
  };

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">جاري التحميل...</div>
      ) : workTypes.length === 0 ? (
        <div className="text-center py-4 text-gray-500">لا توجد أنواع عمل مسجلة</div>
      ) : (
        workTypes.map((type: any) => (
          <div key={type.id} className="flex items-center gap-2 p-2 border rounded">
            {editingId === type.id ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleUpdate} disabled={updateWorkType.isPending}>
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
