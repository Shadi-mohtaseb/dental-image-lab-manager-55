
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// تعريف واجهة الطبيب مع الحقول الجديدة
export type Doctor = {
  id: string;
  name: string;
  zircon_price: number;
  temp_price: number;
  created_at?: string;
  updated_at?: string;
};

export type DoctorInsert = {
  name: string;
  zircon_price: number;
  temp_price: number;
};

// جلب الأطباء
export const useDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async (): Promise<Doctor[]> => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, zircon_price, temp_price, created_at, updated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // التأكد من إرجاع بيانات صحيحة بذات الحقول المطلوبة
      return (data as any[] ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        zircon_price: Number(row.zircon_price) || 0,
        temp_price: Number(row.temp_price) || 0,
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
      const { data, error } = await supabase
        .from("doctors")
        .insert(doctor)
        .select("id, name, zircon_price, temp_price, created_at, updated_at")
        .single();
      if (error) throw error;
      return data as Doctor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast({
        title: "تم إضافة الطبيب بنجاح",
        description: "تم حفظ بيانات الطبيب في النظام",
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
      zircon_price,
      temp_price,
    }: { id: string; name: string; zircon_price: number; temp_price: number }) => {
      const { data, error } = await supabase
        .from("doctors")
        .update({ name, zircon_price, temp_price })
        .eq("id", id)
        .select("id, name, zircon_price, temp_price, created_at, updated_at")
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
