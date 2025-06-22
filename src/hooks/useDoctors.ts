
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// تعريف واجهة الطبيب بدون الحقول القديمة
export type Doctor = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  specialty?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type DoctorInsert = {
  name: string;
  phone?: string | null;
  workTypePrices?: Record<string, number>;
};

// جلب الأطباء
export const useDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async (): Promise<Doctor[]> => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, phone, email, address, specialty, created_at, updated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[] ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone ?? "",
        email: row.email ?? "",
        address: row.address ?? "",
        specialty: row.specialty ?? "",
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    },
  });
};

// إضافة طبيب
export const useAddDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctor: DoctorInsert) => {
      // إضافة الطبيب أولاً
      const { data: doctorData, error: doctorError } = await supabase
        .from("doctors")
        .insert({
          name: doctor.name,
          phone: doctor.phone,
        })
        .select("id, name, phone, email, address, specialty, created_at, updated_at")
        .single();
      
      if (doctorError) throw doctorError;

      // إضافة أسعار أنواع العمل إذا كانت موجودة
      if (doctor.workTypePrices && Object.keys(doctor.workTypePrices).length > 0) {
        const priceEntries = Object.entries(doctor.workTypePrices).map(([workTypeId, price]) => ({
          doctor_id: doctorData.id,
          work_type_id: workTypeId,
          price: price,
        }));

        const { error: pricesError } = await supabase
          .from("doctor_work_type_prices" as any)
          .insert(priceEntries);

        if (pricesError) {
          console.error("Error adding work type prices:", pricesError);
        }
      }

      return doctorData as Doctor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor_work_type_prices"] });
      toast({
        title: "تم إضافة الطبيب بنجاح",
        description: "تم حفظ بيانات الطبيب وأسعار أنواع العمل في النظام",
      });
    },
    onError: (error) => {
      console.error("Error adding doctor:", error);
      toast({
        title: "خطأ في إضافة الطبيب",
        description: "حدث خطأ أثناء إضافة الطبيب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
};

// تحديث طبيب
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      phone,
    }: { id: string; name: string; phone?: string | null }) => {
      const { data, error } = await supabase
        .from("doctors")
        .update({ name, phone })
        .eq("id", id)
        .select("id, name, phone, email, address, specialty, created_at, updated_at")
        .single();
      if (error) throw error;
      return data as Doctor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast({
        title: "تم تحديث الطبيب بنجاح",
        description: "تم حفظ التغييرات",
      });
    },
    onError: (error) => {
      console.error("Error updating doctor:", error);
      toast({
        title: "خطأ في تحديث الطبيب",
        description: "حدث خطأ أثناء تحديث الطبيب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
};

// حذف طبيب
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("doctors")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast({
        title: "تم حذف الطبيب",
        description: "تم حذف بيانات الطبيب",
      });
    },
    onError: (error) => {
      console.error("Error deleting doctor:", error);
      toast({
        title: "خطأ في حذف الطبيب",
        description: "حدث خطأ أثناء الحذف، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
};
