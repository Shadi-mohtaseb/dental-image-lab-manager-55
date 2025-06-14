
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { DoctorPDFDateRangePicker } from "./DoctorPDFDateRangePicker";
import { useDoctorAccountPDFExport } from "./useDoctorAccountPDFExport";

interface Props {
  doctorName: string;
  summary: {
    totalDue: number;
    totalPaid: number;
    remaining: number;
  };
  doctorCases: any[];
}

export const DoctorAccountPDFButton: React.FC<Props> = ({
  doctorName,
  summary,
  doctorCases,
}) => {
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { exportPDF } = useDoctorAccountPDFExport();

  const handleExport = async () => {
    setLoading(true);
    try {
      await exportPDF({
        doctorName,
        summary,
        doctorCases,
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
          disabled={loading}
        />
        <Button
          type="button"
          disabled={loading}
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
