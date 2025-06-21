
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Globe } from "lucide-react";
import { useState } from "react";
import { BackupRestoreSection } from "@/components/backup/BackupRestoreSection";
import { WorkTypesSection } from "@/components/settings/WorkTypesSection";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const [language, setLanguage] = useState("ar");

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (value === "en") {
      toast({
        title: "Language Feature",
        description: "English language support will be implemented in future updates",
        variant: "default",
      });
    } else {
      toast({
        title: "تم تغيير اللغة",
        description: "تم تعيين اللغة العربية بنجاح",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-600">إدارة إعدادات النظام والتفضيلات</p>
        </div>
      </div>

      {/* إعدادات اللغة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            إعدادات اللغة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">لغة النظام</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              تغيير لغة واجهة النظام (ميزة دعم اللغة الإنجليزية قيد التطوير)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* إدارة أنواع العمل - النظام الجديد الشامل */}
      <WorkTypesSection />

      {/* النسخ الاحتياطي */}
      <BackupRestoreSection />
    </div>
  );
};

export default Settings;
