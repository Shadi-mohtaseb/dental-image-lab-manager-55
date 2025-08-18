
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
      const { data, error } = await supabase.rpc("calculate_company_capital");
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["company_capital"] });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      
      // توزيع الأرباح تلقائياً بعد حساب رأس المال
      const { error } = await supabase.rpc("distribute_profits_to_partners");
      if (error) {
        console.error("Error distributing profits:", error);
      } else {
        queryClient.invalidateQueries({ queryKey: ["partners"] });
      }
      
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
