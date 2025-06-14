
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DoctorsAccounts from "./DoctorsAccounts";
import DoctorsPaymentsLogTable from "@/components/doctors-log/DoctorsPaymentsLogTable";
import { FileText, Search } from "lucide-react";

const DoctorsPayments = () => {
  const [tab, setTab] = useState<"accounts" | "payments">("accounts");

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto mt-6">
      <Tabs defaultValue="accounts" value={tab} onValueChange={(v) => setTab(v as "accounts" | "payments")}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2 items-center">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">سجل دفعات الأطباء</h1>
          </div>
          {/* تبويبات التبديل */}
          <TabsList>
            <TabsTrigger value="accounts">
              <Search className="w-4 h-4 ml-1" />
              حسابات الأطباء
            </TabsTrigger>
            <TabsTrigger value="payments">
              <FileText className="w-4 h-4 ml-1" />
              سجل الدفعات
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="accounts">
          <DoctorsAccounts />
        </TabsContent>
        <TabsContent value="payments">
          <DoctorsPaymentsLogTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorsPayments;
