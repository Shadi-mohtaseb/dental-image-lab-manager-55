
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useCompanyCapital = () => {
  return useQuery({
    queryKey: ["company_capital"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_capital")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });
};

export const useCalculateCompanyCapital = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // أولاً نحدث رأس المال
      const { error: updateError } = await supabase.rpc("update_company_capital");
      if (updateError) throw updateError;
      
      // ثم نوزع الأرباح
      const { error: distributeError } = await supabase.rpc("distribute_profits_to_partners");
      if (distributeError) throw distributeError;
      
      return true;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["company_capital"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      
      toast({
        title: "تم تحديث رأس المال وتوزيع الأرباح",
        description: "تم حساب صافي الربح وتوزيع الأرباح على الشركاء تلقائياً",
      });
    },
  });
};

export const useDistributeProfits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("distribute_profits_to_partners");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      queryClient.invalidateQueries({ queryKey: ["company_capital"] });
      toast({
        title: "تم توزيع الأرباح",
        description: "تم توزيع صافي الربح بنسبة الثلثين والثلث على الشركاء",
      });
    },
  });
};
