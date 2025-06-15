
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { DoctorPDFDateRangePicker } from "./DoctorPDFDateRangePicker";
import { useDoctorAccountPDFExport } from "./useDoctorAccountPDFExport";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  doctorName: string;
  summary: {
    totalDue: number;
    totalPaid: number;
    remaining: number;
  };
  doctorCases?: any[]; // سنعتمد على الجلب التلقائي وليس props غالباً
  doctorId?: string;    // ضروري لجلب الحالات مباشرة
}

export const DoctorAccountPDFButton: React.FC<Props> = ({
  doctorName,
  summary,
  doctorId,
  doctorCases,
}) => {
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // جلب كل الحالات الخاصة بهذا الطبيب (يفضل دائماً الاعتماد على قاعدة البيانات في لحظة التصدير)
  const { data: fetchedDoctorCases = [], isFetching } = useQuery({
    queryKey: ["export-cases", doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("doctor_id", doctorId);

      if (error) {
        throw error;
      }
      return data ?? [];
    },
    enabled: !!doctorId,
  });

  const { exportPDF } = useDoctorAccountPDFExport();

  const handleExport = async () => {
    setLoading(true);
    try {
      // استخدم الحالات المجلبة حديثاً دائماً (ولا تعتمد على prop doctorCases)
      await exportPDF({
        doctorName,
        summary,
        doctorCases: fetchedDoctorCases,
        fromDate,
        toDate,
      });
    } catch (err: any) {
      toast({
        title: "حدث خطأ عند التصدير!",
        description: err?.message || "خطأ غير معروف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} title="تصدير PDF (اختر الفترة)">
          <Download className="ml-1" /> PDF
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[330px] pointer-events-auto" align="end" sideOffset={6}>
        <DoctorPDFDateRangePicker
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          disabled={loading || isFetching}
        />
        <Button
          type="button"
          disabled={loading || isFetching}
          onClick={() => {
            setPopoverOpen(false);
            handleExport();
          }}
          className="w-full mt-4"
        >
          <Download className="ml-1" /> تصدير PDF
        </Button>
      </PopoverContent>
    </Popover>
  );
};
