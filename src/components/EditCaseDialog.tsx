
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { EditCaseForm } from "./form/edit-case/EditCaseForm";

export type EditCaseDialogProps = {
  caseData: Tables<"cases"> | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdate?: (updatedCase: Tables<"cases">) => void;
};

export function EditCaseDialog({ caseData, open, onOpenChange, onUpdate }: EditCaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الحالة بالكامل</DialogTitle>
        </DialogHeader>
        <EditCaseForm 
          caseData={caseData}
          open={open}
          onUpdate={onUpdate}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
