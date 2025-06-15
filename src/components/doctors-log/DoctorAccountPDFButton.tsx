
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { DoctorPDFDateRangePicker } from "./DoctorPDFDateRangePicker";
import { usePrintDoctorAccountHTML } from "./usePrintDoctorAccountHTML";

interface Props {
  doctorName: string;
  summary: {
    totalDue: number;
    totalPaid: number;
    remaining: number;
  };
  doctorCases: any[]; // الآن هذا الحقل إجباري لضمان سلامة البيانات للطبيب
  doctorId: string;
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

  const { printHTML } = usePrintDoctorAccountHTML();

  const handlePrint = () => {
    setPopoverOpen(false);
    if (!doctorCases || doctorCases.length === 0) {
      toast({
        title: "لا توجد حالات للعرض",
        description: "لا يوجد أي حالة مرتبطة بهذا الطبيب للطباعة.",
        variant: "destructive"
      });
      return;
    }
    printHTML({
      doctorName,
      summary,
      doctorCases,
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
          disabled={loading}
        />
        <div className="flex gap-2 mt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
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
