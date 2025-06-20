
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCreateDoctorWorkTypePricesForNewWorkType } from "@/hooks/useDoctorWorkTypePrices";

export const useWorkTypesData = () => {
  const query = useQuery({
    queryKey: ["work_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_types" as any)
        .select("*")
        .order("name");
      if (error) {
        console.error("Error fetching work types:", error);
        return [];
      }
      return data || [];
    },
  });

  return {
    workTypes: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
};

export const useAddWorkType = () => {
  const queryClient = useQueryClient();
  const createPrices = useCreateDoctorWorkTypePricesForNewWorkType();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("work_types" as any)
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      
      // إنشاء أسعار افتراضية للأطباء
      if (data && typeof data === 'object' && 'id' in data) {
        await createPrices.mutateAsync(data.id as string);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_types"] });
      toast({ title: "تم إضافة نوع العمل بنجاح مع ربطه بجميع الأطباء" });
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء إضافة نوع العمل", variant: "destructive" });
    },
  });
};

export const useUpdateWorkType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("work_types" as any)
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_types"] });
      toast({ title: "تم تحديث نوع العمل بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء تحديث نوع العمل", variant: "destructive" });
    },
  });
};

export const useDeleteWorkType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("work_types" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_types"] });
      toast({ title: "تم حذف نوع العمل بنجاح" });
    },
    onError: () => {
      toast({ title: "حدث خطأ أثناء حذف نوع العمل", variant: "destructive" });
    },
  });
};
