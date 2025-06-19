
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Database, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function BackupRestoreSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // تصدير النسخة الاحتياطية
  const exportBackup = async () => {
    setIsExporting(true);
    try {
      // جلب جميع البيانات من الجداول الرئيسية
      const tables = ['cases', 'doctors', 'expenses', 'partners', 'partner_transactions', 'doctor_transactions'];
      const backupData: any = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
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

  // استيراد النسخة الاحتياطية
  const importBackup = async () => {
    if (!importFile) {
      toast({
        title: "لم يتم اختيار ملف",
        description: "يرجى اختيار ملف النسخة الاحتياطية أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const fileContent = await importFile.text();
      const backupData = JSON.parse(fileContent);

      // التحقق من صحة البيانات
      if (!backupData.backup_info) {
        throw new Error('ملف النسخة الاحتياطية غير صالح');
      }

      const confirmation = window.confirm(
        `هل أنت متأكد من استيراد النسخة الاحتياطية؟\n` +
        `سيتم استبدال البيانات الحالية.\n` +
        `تاريخ النسخة: ${new Date(backupData.backup_info.created_at).toLocaleDateString('ar-SA')}\n` +
        `عدد السجلات: ${backupData.backup_info.total_records}`
      );

      if (!confirmation) return;

      // استيراد البيانات لكل جدول
      const tables = ['cases', 'doctors', 'expenses', 'partners', 'partner_transactions', 'doctor_transactions'];
      
      for (const table of tables) {
        if (backupData[table] && backupData[table].length > 0) {
          // حذف البيانات الحالية
          await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          // إدراج البيانات الجديدة
          const { error } = await supabase.from(table).insert(backupData[table]);
          if (error) throw error;
        }
      }

      toast({
        title: "تم استيراد النسخة الاحتياطية بنجاح",
        description: "تم استعادة جميع البيانات من النسخة الاحتياطية",
      });

      // إعادة تحميل الصفحة لتحديث البيانات
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء استيراد النسخة الاحتياطية",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          النسخ الاحتياطي واستعادة البيانات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* تصدير النسخة الاحتياطية */}
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

        <hr />

        {/* استيراد النسخة الاحتياطية */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold">استيراد النسخة الاحتياطية</Label>
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              تحذير: سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في ملف النسخة الاحتياطية
            </p>
          </div>
          <div className="space-y-3">
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="w-full"
            />
            <Button 
              onClick={importBackup} 
              disabled={isImporting || !importFile}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Upload className="w-4 h-4 ml-2" />
              {isImporting ? "جاري الاستيراد..." : "استيراد النسخة الاحتياطية"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
