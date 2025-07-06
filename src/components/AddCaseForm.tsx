
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AddCaseFormProps {
  onSuccess: () => void;
}

export function AddCaseForm({ onSuccess }: AddCaseFormProps) {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_age: '',
    work_type: '',
    tooth_number: '',
    teeth_count: '1',
    shade: '',
    zircon_block_type: '',
    doctor_id: '',
    submission_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    price: '',
    status: 'في الانتظار',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // جلب الأطباء
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  // جلب أنواع العمل
  const { data: workTypes = [] } = useQuery({
    queryKey: ["work_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_types")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('cases')
        .insert({
          ...formData,
          patient_age: formData.patient_age ? Number(formData.patient_age) : null,
          teeth_count: Number(formData.teeth_count),
          price: formData.price ? Number(formData.price) : null,
          doctor_id: formData.doctor_id || null,
          delivery_date: formData.delivery_date || null
        });

      if (error) throw error;

      toast({
        title: "تم إضافة الحالة",
        description: "تم إضافة الحالة الجديدة بنجاح",
      });

      // إعادة تعيين النموذج
      setFormData({
        patient_name: '',
        patient_phone: '',
        patient_age: '',
        work_type: '',
        tooth_number: '',
        teeth_count: '1',
        shade: '',
        zircon_block_type: '',
        doctor_id: '',
        submission_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        price: '',
        status: 'في الانتظار',
        notes: ''
      });
      
      // تحديث البيانات
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      onSuccess();
    } catch (error) {
      console.error('Error adding case:', error);
      toast({
        title: "خطأ في إضافة الحالة",
        description: "حدث خطأ يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patient_name">اسم المريض *</Label>
          <Input
            id="patient_name"
            value={formData.patient_name}
            onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="patient_phone">رقم الهاتف</Label>
          <Input
            id="patient_phone"
            value={formData.patient_phone}
            onChange={(e) => setFormData({...formData, patient_phone: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patient_age">عمر المريض</Label>
          <Input
            id="patient_age"
            type="number"
            value={formData.patient_age}
            onChange={(e) => setFormData({...formData, patient_age: e.target.value})}
          />
        </div>
        
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="work_type">نوع العمل *</Label>
          <Select value={formData.work_type} onValueChange={(value) => setFormData({...formData, work_type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع العمل" />
            </SelectTrigger>
            <SelectContent>
              {workTypes.map((workType) => (
                <SelectItem key={workType.id} value={workType.name}>
                  {workType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="tooth_number">رقم السن</Label>
          <Input
            id="tooth_number"
            value={formData.tooth_number}
            onChange={(e) => setFormData({...formData, tooth_number: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="teeth_count">عدد الأسنان</Label>
          <Input
            id="teeth_count"
            type="number"
            min="1"
            value={formData.teeth_count}
            onChange={(e) => setFormData({...formData, teeth_count: e.target.value})}
          />
        </div>
        
        <div>
          <Label htmlFor="shade">اللون</Label>
          <Input
            id="shade"
            value={formData.shade}
            onChange={(e) => setFormData({...formData, shade: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zircon_block_type">نوع الزيركون</Label>
          <Input
            id="zircon_block_type"
            value={formData.zircon_block_type}
            onChange={(e) => setFormData({...formData, zircon_block_type: e.target.value})}
          />
        </div>
        
        <div>
          <Label htmlFor="price">السعر</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="submission_date">تاريخ التسليم *</Label>
          <Input
            id="submission_date"
            type="date"
            value={formData.submission_date}
            onChange={(e) => setFormData({...formData, submission_date: e.target.value})}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="delivery_date">تاريخ التوصيل</Label>
          <Input
            id="delivery_date"
            type="date"
            value={formData.delivery_date}
            onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
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
            <SelectItem value="في الانتظار">في الانتظار</SelectItem>
            <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
            <SelectItem value="مكتمل">مكتمل</SelectItem>
            <SelectItem value="تم التسليم">تم التسليم</SelectItem>
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
        <Button type="submit" disabled={loading}>
          {loading ? "جاري الحفظ..." : "إضافة الحالة"}
        </Button>
      </div>
    </form>
  );
}
