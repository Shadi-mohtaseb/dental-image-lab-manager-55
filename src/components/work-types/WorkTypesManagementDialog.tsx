
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useWorkTypesData, useAddWorkType } from "./useWorkTypesData";
import { WorkTypesList } from "./WorkTypesList";
import { AddWorkTypeForm } from "./AddWorkTypeForm";

export function WorkTypesManagementDialog() {
  const [open, setOpen] = useState(false);
  const { workTypes, isLoading } = useWorkTypesData();
  const addWorkType = useAddWorkType();

  // اختبار إضافة نوع عمل تجريبي عند فتح المكون لأول مرة
  useEffect(() => {
    if (open && workTypes.length === 0 && !isLoading) {
      console.log("Adding test work type...");
      addWorkType.mutate("نوع عمل تجريبي");
    }
  }, [open, workTypes.length, isLoading]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إدارة أنواع العمل</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <AddWorkTypeForm />
          <WorkTypesList workTypes={workTypes} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
