
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useExpenseTypesData = () => {
  const query = useQuery({
    queryKey: ["expense_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  return {
    expenseTypes: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
};

export const useAddExpenseType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("expense_types")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_types"] });
      toast({ title: "تم إضافة نوع المصروف بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء إضافة نوع المصروف", variant: "destructive" });
    },
  });
};

export const useUpdateExpenseType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("expense_types")
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_types"] });
      toast({ title: "تم تحديث نوع المصروف بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء تحديث نوع المصروف", variant: "destructive" });
    },
  });
};

export const useDeleteExpenseType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("expense_types")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense_types"] });
      toast({ title: "تم حذف نوع المصروف بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء حذف نوع المصروف", variant: "destructive" });
    },
  });
};
