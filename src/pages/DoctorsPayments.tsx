
import DoctorsAccounts from "./DoctorsAccounts";
import DoctorsPaymentsLogTable from "@/components/doctors-log/DoctorsPaymentsLogTable";
import { FileText } from "lucide-react";
import React from "react";

const DoctorsPayments = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto mt-6">
      <div className="flex gap-2 items-center mb-4">
        <FileText className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">سجل دفعات الأطباء وحساباتهم</h1>
      </div>
      {/* حسابات الأطباء */}
      <DoctorsAccounts />

      {/* سجل الدفعات */}
      <DoctorsPaymentsLogTable />
    </div>
  );
};

export default DoctorsPayments;

