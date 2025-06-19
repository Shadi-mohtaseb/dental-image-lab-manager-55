
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ExportSection() {
  const [isExporting, setIsExporting] = useState(false);

  const exportBackup = async () => {
    setIsExporting(true);
    try {
      // جلب جميع البيانات من الجداول الرئيسية
      const tables = ['cases', 'doctors', 'expenses', 'partners', 'partner_transactions', 'doctor_transactions'];
      const backupData: any = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table as any).select('*');
        if (error) throw error;
        backupData[table] = data;
      }

      // إضافة معلومات النسخة الاحتياطية
      backupData.backup_info = {
        created_at: new Date().toISOString(),
        version: '1.0',
        total_records: Object.values(backupData).flat().length
      };

      // تحويل البيانات إلى JSON وتنزيلها
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lab-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "تم تصدير النسخة الاحتياطية بنجاح",
        description: "تم حفظ ملف النسخة الاحتياطية في جهازك",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير النسخة الاحتياطية",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-lg font-semibold">تصدير النسخة الاحتياطية</Label>
      <p className="text-sm text-gray-600">
        قم بتصدير جميع بيانات النظام إلى ملف JSON يمكن استخدامه لاستعادة البيانات لاحقاً
      </p>
      <Button 
        onClick={exportBackup} 
        disabled={isExporting}
        className="w-full sm:w-auto"
      >
        <Download className="w-4 h-4 ml-2" />
        {isExporting ? "جاري التصدير..." : "تصدير النسخة الاحتياطية"}
      </Button>
    </div>
  );
}
