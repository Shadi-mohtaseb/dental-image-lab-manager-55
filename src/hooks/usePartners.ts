
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type Partner = Tables<"partners">;
export type PartnerInsert = TablesInsert<"partners">;

export const usePartners = () => {
  return useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAddPartner = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (partner: Omit<PartnerInsert, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("partners")
        .insert(partner)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      toast({
        title: "تم إضافة الشريك بنجاح",
        description: "تم حفظ بيانات الشريك في النظام",
      });
    },
    onError: (error) => {
      console.error("Error adding partner:", error);
      toast({
        title: "خطأ في إضافة الشريك",
        description: "حدث خطأ أثناء إضافة الشريك، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
};
