
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DoctorsLog from "./DoctorsLog";
import { FileText, Search } from "lucide-react";

/**
 * صفحة الأطباء الموحدة: فقط سجل الأطباء وإحصائياته
 */
const DoctorsDashboard = () => {
  // يمكن لاحقاً حفظ آخر تبويب بالنخزين المحلي أو في الحالة
  const [tab, setTab] = useState<"log">("log");

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="log" value={tab} onValueChange={(v) => setTab(v as "log")}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2 items-center">
            <Search className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">سجل وإحصائيات الأطباء</h1>
          </div>
          {/* لا توجد تبويبات هنا بعد النقل */}
        </div>
        <TabsContent value="log">
          <DoctorsLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorsDashboard;
