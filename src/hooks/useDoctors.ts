
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type Doctor = Tables<"doctors">;
export type DoctorInsert = TablesInsert<"doctors">;

export const useDoctors = () => {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAddDoctor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (doctor: Omit<DoctorInsert, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("doctors")
        .insert(doctor)
        .select()
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
