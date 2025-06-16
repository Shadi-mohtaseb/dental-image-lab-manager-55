
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Save, Building2, Upload, X } from "lucide-react";

export default function Settings() {
  const [labName, setLabName] = useState("");
  const [labLogo, setLabLogo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحميل اسم المختبر والشعار المحفوظ عند بدء التشغيل
  useEffect(() => {
    const savedLabName = localStorage.getItem("labName") || "مختبر الأسنان";
    const savedLabLogo = localStorage.getItem("labLogo") || "";
    setLabName(savedLabName);
    setLabLogo(savedLabLogo);
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

  // التعامل مع تحميل الصورة
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        toast({
          title: "خطأ في نوع الملف",
          description: "يرجى اختيار ملف صورة صالح",
          variant: "destructive",
        });
        return;
      }

      // التحقق من حجم الملف (أقل من 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير",
          description: "يرجى اختيار صورة أصغر من 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setLabLogo(base64String);
        
        // حفظ في localStorage
        localStorage.setItem("labLogo", base64String);
        
        // إرسال حدث مخصص لتحديث الشريط الجانبي
        window.dispatchEvent(new CustomEvent("labLogoChanged", { 
          detail: { labLogo: base64String } 
        }));

        toast({
          title: "تم تحميل الشعار",
          description: "تم تحديث شعار المختبر بنجاح",
          variant: "default",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // حذف الشعار
  const handleRemoveLogo = () => {
    setLabLogo("");
    localStorage.removeItem("labLogo");
    
    // إرسال حدث مخصص لتحديث الشريط الجانبي
    window.dispatchEvent(new CustomEvent("labLogoChanged", { 
      detail: { labLogo: "" } 
    }));

    toast({
      title: "تم حذف الشعار",
      description: "تم حذف شعار المختبر بنجاح",
      variant: "default",
    });

    // مسح قيمة input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          {/* اسم المختبر */}
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

          {/* شعار المختبر */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">شعار المختبر</Label>
            
            {/* عرض الشعار الحالي */}
            {labLogo && (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={labLogo} 
                    alt="شعار المختبر" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <Button
                  onClick={handleRemoveLogo}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                  حذف الشعار
                </Button>
              </div>
            )}
            
            {/* تحميل شعار جديد */}
            <div className="flex items-center gap-3">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="flex-1"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {labLogo ? "تغيير الشعار" : "تحميل شعار"}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              سيظهر الشعار في أعلى الشريط الجانبي. الحد الأقصى للحجم: 5 ميجابايت
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
