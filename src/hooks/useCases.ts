
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type Case = Tables<"cases"> & {
  doctor?: Tables<"doctors">;
};
export type CaseInsert = TablesInsert<"cases">;

export const useCases = () => {
  return useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select(`
          *,
          doctor:doctors(*)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAddCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (caseData: Omit<CaseInsert, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("cases")
        .insert(caseData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast({
        title: "تم إضافة الحالة بنجاح",
        description: "تم حفظ بيانات الحالة في النظام",
      });
    },
    onError: (error) => {
      console.error("Error adding case:", error);
      toast({
        title: "خطأ في إضافة الحالة",
        description: "حدث خطأ أثناء إضافة الحالة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
};
