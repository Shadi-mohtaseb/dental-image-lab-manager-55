
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type Doctor = Pick<Tables<"doctors">, "id" | "name" | "zircon_price" | "temp_price" | "created_at" | "updated_at">;
export type DoctorInsert = {
  name: string;
  zircon_price: number;
  temp_price: number;
};

// جلب الأطباء
export const useDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, zircon_price, temp_price, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
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
      return data;
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
    mutationFn: async ({ id, name, zircon_price, temp_price }: { id: string; name: string; zircon_price: number; temp_price: number }) => {
      const { data, error } = await supabase
        .from("doctors")
        .update({ name, zircon_price, temp_price })
        .eq("id", id)
        .select("id, name, zircon_price, temp_price, created_at, updated_at")
        .single();
      if (error) throw error;
      return data;
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
