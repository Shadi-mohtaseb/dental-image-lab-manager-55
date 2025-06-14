
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { ar } from "date-fns/locale";

interface DoctorPDFDateRangePickerProps {
  fromDate: Date | undefined;
  toDate: Date | undefined;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export const DoctorPDFDateRangePicker: React.FC<DoctorPDFDateRangePickerProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  disabled,
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-2">
      <label className="font-medium text-right mr-1">من تاريخ:</label>
      <Calendar
        mode="single"
        selected={fromDate}
        onSelect={onFromDateChange}
        className="p-3 pointer-events-auto"
        locale={ar}
        disabled={disabled}
      />
    </div>
    <div className="flex flex-col gap-2">
      <label className="font-medium text-right mr-1">إلى تاريخ:</label>
      <Calendar
        mode="single"
        selected={toDate}
        onSelect={onToDateChange}
        className="p-3 pointer-events-auto"
        locale={ar}
        disabled={disabled}
      />
    </div>
  </div>
);
