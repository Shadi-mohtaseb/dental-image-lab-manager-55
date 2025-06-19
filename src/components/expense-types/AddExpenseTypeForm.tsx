
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useAddExpenseType } from "./useExpenseTypesData";

export function AddExpenseTypeForm() {
  const [newType, setNewType] = useState("");
  const addType = useAddExpenseType();

  const handleAdd = () => {
    if (newType.trim()) {
      addType.mutate(newType.trim());
      setNewType("");
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="اسم نوع المصروف الجديد"
        value={newType}
        onChange={(e) => setNewType(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
      <Button onClick={handleAdd} disabled={addType.isPending}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
