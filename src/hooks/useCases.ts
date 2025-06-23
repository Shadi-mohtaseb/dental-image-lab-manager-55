
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type Case = Tables<"cases"> & {
  doctor?: Tables<"doctors">;
};

// Create a custom type for case insertion
export type CaseInsert = {
  patient_name: string;
  doctor_id: string;
  work_type: string;
  tooth_number?: string | null;
  teeth_count?: number | null;
  status: string;
  notes?: string | null;
  price: number;
  shade?: string | null;
  zircon_block_type?: string | null;
  delivery_date?: string | null;
  submission_date: string;
};

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

export const useUpdateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Case> & { id: string }) => {
      const { data, error } = await supabase
        .from("cases")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast({
        title: "تم تحديث الحالة بنجاح",
        description: "تم حفظ التغييرات في النظام",
      });
    },
    onError: (error) => {
      console.error("Error updating case:", error);
      toast({
        title: "خطأ في تحديث الحالة",
        description: "حدث خطأ أثناء تحديث الحالة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (caseId: string) => {
      const { error } = await supabase
        .from("cases")
        .delete()
        .eq("id", caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast({
        title: "تم حذف الحالة بنجاح",
        description: "تم حذف الحالة من النظام",
      });
    },
    onError: (error) => {
      console.error("Error deleting case:", error);
      toast({
        title: "خطأ في حذف الحالة",
        description: "حدث خطأ أثناء حذف الحالة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
};
