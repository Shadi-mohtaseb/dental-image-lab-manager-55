import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUpdateDoctorAccessToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doctorId: string) => {
      // First get a new token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_doctor_access_token');
      
      if (tokenError) throw tokenError;

      // Then update the doctor record
      const { data, error } = await supabase
        .from("doctors")
        .update({ 
          access_token: tokenData,
          updated_at: new Date().toISOString()
        })
        .eq("id", doctorId)
        .select("access_token")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("تم تحديث رابط الطبيب بنجاح");
    },
    onError: (error: any) => {
      toast.error("حدث خطأ أثناء تحديث الرابط: " + error.message);
    },
  });
};