
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useAddWorkType } from "./useWorkTypesData";

export function AddWorkTypeForm() {
  const [newWorkType, setNewWorkType] = useState("");
  const [defaultPrice, setDefaultPrice] = useState<number>(0);
  const addWorkType = useAddWorkType();

  const handleAdd = () => {
    if (newWorkType.trim()) {
      addWorkType.mutate({ name: newWorkType.trim(), defaultPrice });
      setNewWorkType("");
      setDefaultPrice(0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
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
      <div className="flex items-center gap-2">
        <Label htmlFor="defaultPrice" className="whitespace-nowrap text-sm">السعر الافتراضي (شيكل):</Label>
        <Input
          id="defaultPrice"
          type="number"
          min={0}
          step={0.01}
          placeholder="0"
          value={defaultPrice}
          onChange={(e) => setDefaultPrice(Number(e.target.value) || 0)}
          onKeyDown={handleKeyPress}
          disabled={addWorkType.isPending}
          className="w-32"
        />
      </div>
    </div>
  );
}
