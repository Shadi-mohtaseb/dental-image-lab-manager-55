
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onReset: () => void;
  isSubmitting: boolean;
}

export function FormActions({ onReset, isSubmitting }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onReset}>
        إلغاء
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جاري الإضافة..." : "إضافة الحالة"}
      </Button>
    </div>
  );
}
