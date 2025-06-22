
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
      console.log("Adding new work type:", newWorkType.trim());
      addWorkType.mutate(newWorkType.trim());
      setNewWorkType("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="اسم نوع العمل الجديد"
        value={newWorkType}
        onChange={(e) => setNewWorkType(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={addWorkType.isPending}
      />
      <Button 
        onClick={handleAdd} 
        disabled={addWorkType.isPending || !newWorkType.trim()}
        className="whitespace-nowrap"
      >
        <Plus className="h-4 w-4 ml-1" />
        إضافة
      </Button>
    </div>
  );
}
