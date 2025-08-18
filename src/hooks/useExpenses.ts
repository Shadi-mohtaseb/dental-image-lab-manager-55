
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type Expense = Tables<"expenses">;
export type ExpenseInsert = TablesInsert<"expenses">;

export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          expense_types (
            id,
            name
          )
        `)
        .order("purchase_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expense: Omit<ExpenseInsert, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("expenses")
        .insert(expense)
        .select(`
          *,
          expense_types (
            id,
            name
          )
        `)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      
      // إعادة حساب وتوزيع الأرباح تلقائياً
      const { error } = await supabase.rpc("calculate_company_capital");
      if (!error) {
        await supabase.rpc("distribute_profits_to_partners");
        queryClient.invalidateQueries({ queryKey: ["company_capital"] });
        queryClient.invalidateQueries({ queryKey: ["partners"] });
      }
      
      toast({
        title: "تم إضافة المصروف بنجاح",
        description: "تم حفظ بيانات المصروف وإعادة توزيع الأرباح تلقائياً",
      });
    },
    onError: (error) => {
      console.error("Error adding expense:", error);
      toast({
        title: "خطأ في إضافة المصروف",
        description: "حدث خطأ أثناء إضافة المصروف، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);
      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      
      // إعادة حساب وتوزيع الأرباح تلقائياً
      const { error } = await supabase.rpc("calculate_company_capital");
      if (!error) {
        await supabase.rpc("distribute_profits_to_partners");
        queryClient.invalidateQueries({ queryKey: ["company_capital"] });
        queryClient.invalidateQueries({ queryKey: ["partners"] });
      }
      
      toast({
        title: "تم حذف المصروف بنجاح",
        description: "تم حذف المصروف وإعادة توزيع الأرباح تلقائياً",
      });
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      toast({
        title: "خطأ في حذف المصروف",
        description: "حدث خطأ أثناء حذف المصروف، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: Partial<Expense> & { id: string }) => {
      const { id, ...rest } = expense;
      const { error } = await supabase
        .from("expenses")
        .update(rest)
        .eq("id", id);
      if (error) throw error;
      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({
        title: "تم تعديل المصروف بنجاح",
        description: "تم حفظ التعديلات",
      });
    },
    onError: (error) => {
      console.error("Error updating expense:", error);
      toast({
        title: "خطأ في تعديل المصروف",
        description: "حدث خطأ أثناء تعديل المصروف، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
};
