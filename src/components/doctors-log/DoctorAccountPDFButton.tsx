
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { DoctorPDFDateRangePicker } from "./DoctorPDFDateRangePicker";
import { usePrintDoctorAccountHTML } from "./usePrintDoctorAccountHTML";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  doctorName: string;
  summary: {
    totalDue: number;
    totalPaid: number;
    remaining: number;
  };
  doctorCases?: any[];
  doctorId?: string;
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

  // جلب كل الحالات الخاصة بهذا الطبيب إذا لم يتم تمرير حالات
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
    enabled: !!doctorId && !doctorCases, // فقط إذا لم يتم تمرير doctorCases مباشرةً
  });

  const { printHTML } = usePrintDoctorAccountHTML();

  // تحديد مصدر الحالات: من props إذا موجودة، وإلا من Supabase
  const casesToPrint = doctorCases ?? fetchedDoctorCases;

  const handlePrint = () => {
    setPopoverOpen(false);
    printHTML({
      doctorName,
      summary,
      doctorCases: casesToPrint,
      fromDate,
      toDate,
    });
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading} title="طباعة الكشف">
          <Printer className="ml-1" /> طباعة
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
        <div className="flex gap-2 mt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={loading || isFetching}
            onClick={handlePrint}
            className="w-full"
            title="طباعة HTML"
          >
            <Printer className="ml-1" /> طباعة الكشف
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
