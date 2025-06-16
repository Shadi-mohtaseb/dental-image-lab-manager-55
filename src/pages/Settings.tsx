
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Save, Building2 } from "lucide-react";

export default function Settings() {
  const [labName, setLabName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // تحميل اسم المختبر المحفوظ عند بدء التشغيل
  useEffect(() => {
    const savedLabName = localStorage.getItem("labName") || "مختبر الأسنان";
    setLabName(savedLabName);
  }, []);

  // حفظ اسم المختبر
  const handleSaveLabName = async () => {
    if (!labName.trim()) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال اسم المختبر",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // حفظ في localStorage
      localStorage.setItem("labName", labName.trim());
      
      // إرسال حدث مخصص لتحديث الشريط الجانبي
      window.dispatchEvent(new CustomEvent("labNameChanged", { 
        detail: { labName: labName.trim() } 
      }));
      
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث اسم المختبر بنجاح",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ اسم المختبر",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الإعدادات</h1>
        <p className="text-gray-600">إدارة إعدادات النظام والمختبر</p>
      </div>

      {/* إعدادات المختبر */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            إعدادات المختبر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="labName" className="text-sm font-medium">
              اسم المختبر
            </Label>
            <div className="flex gap-3">
              <Input
                id="labName"
                type="text"
                value={labName}
                onChange={(e) => setLabName(e.target.value)}
                placeholder="أدخل اسم المختبر"
                className="flex-1"
                maxLength={50}
              />
              <Button
                onClick={handleSaveLabName}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              سيظهر هذا الاسم في أعلى الشريط الجانبي وفي التقارير
            </p>
          </div>
        </CardContent>
      </Card>

      {/* إعدادات أخرى يمكن إضافتها لاحقاً */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>إعدادات أخرى</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            ستتم إضافة المزيد من الإعدادات هنا حسب الحاجة مثل إعدادات التقارير، 
            إعدادات النسخ الاحتياطي، وإعدادات المستخدمين.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
