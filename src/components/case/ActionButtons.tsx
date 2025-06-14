
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Clock } from "lucide-react";
import { useUpdateCase } from "@/hooks/useCases";
import { toast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { useState } from "react";

type Props = {
  caseData: Tables<"cases">;
  onEdit: () => void;
  onUpdate: (updated: Tables<"cases">) => void;
};

export function ActionButtons({ caseData, onEdit, onUpdate }: Props) {
  const updateCase = useUpdateCase();
  const [loading, setLoading] = useState(false);

  const handleSetDelivered = async () => {
    setLoading(true);
    try {
      const updated = await updateCase.mutateAsync({
        id: caseData.id,
        status: "تم التسليم",
      });
      toast({
        title: "تم تحديث الحالة",
        description: "تم تغيير حالة الحالة إلى جاهز للتسليم.",
      });
      onUpdate(updated);
    } catch {
      toast({
        title: "خطأ!",
        description: "حدث خطأ أثناء التحديث.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        className="w-full bg-green-600 hover:bg-green-700"
        onClick={handleSetDelivered}
        disabled={caseData.status === "تم التسليم" || loading}
      >
        <CheckCircle className="w-4 h-4 ml-2" />
        جاهز للتسليم
      </Button>
      <Button className="w-full" variant="outline" onClick={onEdit}>
        <FileText className="w-4 h-4 ml-2" />
        تعديل الحالة
      </Button>
      <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
        <Clock className="w-4 h-4 ml-2" />
        تحديث الحالة
      </Button>
    </div>
  );
}
