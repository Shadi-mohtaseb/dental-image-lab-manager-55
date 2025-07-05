
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EditPaymentCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
  doctors: any[];
  onSuccess: () => void;
}

export default function EditPaymentCheckDialog({ open, onOpenChange, payment, doctors, onSuccess }: EditPaymentCheckDialogProps) {
  const [formData, setFormData] = useState({
    transaction_date: '',
    check_cash_date: '',
    doctor_id: '',
    amount: '',
    status: 'مؤكد',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (payment && open) {
      setFormData({
        transaction_date: payment.transaction_date || '',
        check_cash_date: payment.check_cash_date || '',
        doctor_id: payment.doctor_id || '',
        amount: payment.amount?.toString() || '',
        status: payment.status || 'مؤكد',
        notes: payment.notes || ''
      });
    }
  }, [payment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('doctor_transactions')
        .update({
          ...formData,
          amount: Number(formData.amount),
          doctor_id: formData.doctor_id || null,
          check_cash_date: formData.check_cash_date || null,
        })
        .eq('id', payment.id);

      if (error) throw error;

      toast({
        title: "تم تحديث دفعة الشيك",
        description: "تم تحديث دفعة الشيك بنجاح",
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "خطأ في تحديث دفعة الشيك",
        description: "حدث خطأ يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل دفعة الشيك</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transaction_date">تاريخ المعاملة *</Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="check_cash_date">تاريخ صرف الشيك</Label>
              <Input
                id="check_cash_date"
                type="date"
                value={formData.check_cash_date}
                onChange={(e) => setFormData({...formData, check_cash_date: e.target.value})}
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

          <div>
            <Label htmlFor="status">الحالة</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="مؤكد">مؤكد</SelectItem>
                <SelectItem value="في الانتظار">في الانتظار</SelectItem>
                <SelectItem value="مصروف">مصروف</SelectItem>
                <SelectItem value="مرتد">مرتد</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
