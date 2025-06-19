
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useAddWorkType } from "./useWorkTypesData";

export function AddWorkTypeForm() {
  const [newWorkType, setNewWorkType] = useState("");
  const addWorkType = useAddWorkType();

  const handleAdd = () => {
    if (newWorkType.trim()) {
      addWorkType.mutate(newWorkType.trim());
      setNewWorkType("");
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="اسم نوع العمل الجديد"
        value={newWorkType}
        onChange={(e) => setNewWorkType(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
      <Button onClick={handleAdd} disabled={addWorkType.isPending}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
