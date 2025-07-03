
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useEditCaseForm } from "./useEditCaseForm";
import { EditCaseFields } from "./EditCaseFields";

interface EditCaseFormProps {
  caseData: Tables<"cases"> | null;
  open: boolean;
  onUpdate?: (updatedCase: Tables<"cases">) => void;
  onOpenChange?: (open: boolean) => void;
}

export function EditCaseForm({ caseData, open, onUpdate, onOpenChange }: EditCaseFormProps) {
  const { handleSubmit, control, setValue, onSubmit, isLoading, recalculatePrice } = useEditCaseForm(
    caseData,
    open,
    onUpdate,
    onOpenChange
  );

  return (
    <Form
      // @ts-ignore
      onSubmit={handleSubmit(onSubmit)}
    >
      <EditCaseFields 
        control={control} 
        setValue={setValue} 
        onRecalculatePrice={recalculatePrice}
      />
      <div className="mt-6">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </Form>
  );
}
