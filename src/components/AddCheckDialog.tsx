
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface AddCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctors: any[];
  onSuccess: () => void;
}

export default function AddCheckDialog({ open, onOpenChange, doctors, onSuccess }: AddCheckDialogProps) {
  const [formData, setFormData] = useState({
    check_date: '',
    receive_date: '',
    doctor_id: '',
    amount: '',
    check_number: '',
    bank_name: '',
    recipient_name: '',
    status: 'مستلم',
    notes: ''
  });
  
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (file: File, type: 'front' | 'back') => {
    if (type === 'front') {
      setFrontImage(file);
      setFrontPreview(URL.createObjectURL(file));
    } else {
      setBackImage(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (type: 'front' | 'back') => {
    if (type === 'front') {
      setFrontImage(null);
      setFrontPreview(null);
    } else {
      setBackImage(null);
      setBackPreview(null);
    }
  };

  const uploadImage = async (file: File, checkId: string, type: 'front' | 'back') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${checkId}_${type}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('check-images')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('check-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // إدراج الشيك أولاً
      const { data: checkData, error: checkError } = await supabase
        .from('checks')
        .insert({
          ...formData,
          amount: Number(formData.amount),
          doctor_id: formData.doctor_id || null,
          receive_date: formData.receive_date || null
        })
        .select()
        .single();

      if (checkError) throw checkError;

      // رفع الصور إن وجدت
      let frontImageUrl = null;
      let backImageUrl = null;

      if (frontImage) {
        frontImageUrl = await uploadImage(frontImage, checkData.id, 'front');
      }

      if (backImage) {
        backImageUrl = await uploadImage(backImage, checkData.id, 'back');
      }

      // تحديث الشيك بروابط الصور
      if (frontImageUrl || backImageUrl) {
        const { error: updateError } = await supabase
          .from('checks')
          .update({
            front_image_url: frontImageUrl,
            back_image_url: backImageUrl
          })
          .eq('id', checkData.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "تم إضافة الشيك",
        description: "تم إضافة الشيك بنجاح",
      });

      // إعادة تعيين النموذج
      setFormData({
        check_date: '',
        receive_date: '',
        doctor_id: '',
        amount: '',
        check_number: '',
        bank_name: '',
        recipient_name: '',
        status: 'مستلم',
        notes: ''
      });
      setFrontImage(null);
      setBackImage(null);
      setFrontPreview(null);
      setBackPreview(null);
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding check:', error);
      toast({
        title: "خطأ في إضافة الشيك",
        description: "حدث خطأ يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة شيك جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check_date">تاريخ الشيك *</Label>
              <Input
                id="check_date"
                type="date"
                value={formData.check_date}
                onChange={(e) => setFormData({...formData, check_date: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="receive_date">تاريخ الاستلام</Label>
              <Input
                id="receive_date"
                type="date"
                value={formData.receive_date}
                onChange={(e) => setFormData({...formData, receive_date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="doctor_id">الطبيب</Label>
              <Select value={formData.doctor_id} onValueChange={(value) => setFormData({...formData, doctor_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الطبيب" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount">المبلغ *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check_number">رقم الشيك</Label>
              <Input
                id="check_number"
                value={formData.check_number}
                onChange={(e) => setFormData({...formData, check_number: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="bank_name">اسم البنك</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipient_name">المتصرف إليه</Label>
              <Input
                id="recipient_name"
                value={formData.recipient_name}
                onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="مستلم">مستلم</SelectItem>
                  <SelectItem value="في الانتظار">في الانتظار</SelectItem>
                  <SelectItem value="مصروف">مصروف</SelectItem>
                  <SelectItem value="مرتد">مرتد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>صور الشيك</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front Image */}
              <div className="space-y-2">
                <Label>الوجه الأمامي</Label>
                {frontPreview ? (
                  <div className="relative">
                    <img src={frontPreview} alt="Front preview" className="w-full h-32 object-cover rounded border" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => removeImage('front')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'front')}
                      className="hidden"
                      id="front-image"
                    />
                    <label htmlFor="front-image" className="cursor-pointer">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">اضغط لرفع الصورة الأمامية</p>
                    </label>
                  </div>
                )}
              </div>

              {/* Back Image */}
              <div className="space-y-2">
                <Label>الوجه الخلفي</Label>
                {backPreview ? (
                  <div className="relative">
                    <img src={backPreview} alt="Back preview" className="w-full h-32 object-cover rounded border" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => removeImage('back')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'back')}
                      className="hidden"
                      id="back-image"
                    />
                    <label htmlFor="back-image" className="cursor-pointer">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">اضغط لرفع الصورة الخلفية</p>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ الشيك"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
