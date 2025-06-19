
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";
import { ExportSection } from "./ExportSection";
import { ImportSection } from "./ImportSection";

export function BackupRestoreSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          النسخ الاحتياطي واستعادة البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ExportSection />
        <hr />
        <ImportSection />
      </CardContent>
    </Card>
  );
}
