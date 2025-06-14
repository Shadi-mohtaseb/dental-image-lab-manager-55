
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DoctorsAccounts from "./DoctorsAccounts";
import DoctorsLog from "./DoctorsLog";
import { FileText, Search } from "lucide-react";

/**
 * صفحة الأطباء الموحدة: حسابات الأطباء + سجل الأطباء
 */
const DoctorsDashboard = () => {
  // يمكن لاحقاً حفظ آخر تبويب بالنخزين المحلي أو في الحالة
  const [tab, setTab] = useState<"accounts" | "log">("accounts");

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="accounts" value={tab} onValueChange={(v) => setTab(v as "accounts" | "log")}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2 items-center">
            <Search className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">حسابات وسجل الأطباء</h1>
          </div>
          {/* Tabs control */}
          <TabsList>
            <TabsTrigger value="accounts">
              <Search className="w-4 h-4 ml-1" />
              الحسابات
            </TabsTrigger>
            <TabsTrigger value="log">
              <FileText className="w-4 h-4 ml-1" />
              السجل والإحصائيات
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="accounts">
          <DoctorsAccounts />
        </TabsContent>
        <TabsContent value="log">
          <DoctorsLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorsDashboard;
