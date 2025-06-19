
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ImportSection() {
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

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
          await supabase.from(table as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');
          
          // إدراج البيانات الجديدة
          const { error } = await supabase.from(table as any).insert(backupData[table]);
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
  );
}
