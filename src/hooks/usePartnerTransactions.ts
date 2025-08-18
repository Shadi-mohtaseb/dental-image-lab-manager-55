
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type PartnerTransaction = Tables<"partner_transactions">;
export type PartnerTransactionInsert = TablesInsert<"partner_transactions">;

export const usePartnerTransactions = () => {
  return useQuery({
    queryKey: ["partner_transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAddPartnerTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tx: Omit<PartnerTransactionInsert, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("partner_transactions")
        .insert(tx)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["partner_transactions"] });
      
      // إعادة حساب وتوزيع الأرباح تلقائياً
      const { error } = await supabase.rpc("calculate_company_capital");
      if (!error) {
        await supabase.rpc("distribute_profits_to_partners");
        queryClient.invalidateQueries({ queryKey: ["company_capital"] });
        queryClient.invalidateQueries({ queryKey: ["partners"] });
      }
      
      toast({
        title: "تم إضافة المعاملة بنجاح",
        description: "تم حفظ بيانات المعاملة وإعادة توزيع الأرباح تلقائياً",
      });
    },
    onError: (error) => {
      console.error("Error adding transaction:", error);
      toast({
        title: "خطأ في إضافة المعاملة",
        description: "حدث خطأ أثناء إضافة المعاملة، يرجى المحاولة لاحقًا",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePartnerTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from("partner_transactions")
        .delete()
        .eq("id", transactionId);
      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["partner_transactions"] });
      
      // إعادة حساب وتوزيع الأرباح تلقائياً
      const { error } = await supabase.rpc("calculate_company_capital");
      if (!error) {
        await supabase.rpc("distribute_profits_to_partners");
        queryClient.invalidateQueries({ queryKey: ["company_capital"] });
        queryClient.invalidateQueries({ queryKey: ["partners"] });
      }
      
      toast({
        title: "تم حذف المعاملة",
        description: "تم حذف المعاملة وإعادة توزيع الأرباح تلقائياً",
      });
    },
    onError: (error) => {
      console.error("Error deleting partner transaction:", error);
      toast({
        title: "خطأ في حذف المعاملة",
        description: "حدث خطأ أثناء حذف المعاملة، يرجى المحاولة لاحقًا",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePartnerTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Partial<PartnerTransaction> & { id: string }) => {
      const { id, ...rest } = transaction;
      const { error } = await supabase
        .from("partner_transactions")
        .update(rest)
        .eq("id", id);
      if (error) throw error;
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner_transactions"] });
      toast({
        title: "تم تعديل المعاملة",
        description: "تم حفظ التعديلات",
      });
    },
    onError: (error) => {
      console.error("Error updating partner transaction:", error);
      toast({
        title: "خطأ في تعديل المعاملة",
        description: "حدث خطأ أثناء تعديل المعاملة، يرجى المحاولة لاحقًا",
        variant: "destructive",
      });
    },
  });
};
