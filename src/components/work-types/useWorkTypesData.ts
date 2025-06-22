
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCreateDoctorWorkTypePricesForNewWorkType } from "@/hooks/useDoctorWorkTypePrices";

export const useWorkTypesData = () => {
  const query = useQuery({
    queryKey: ["work_types"],
    queryFn: async () => {
      console.log("Fetching work types...");
      const { data, error } = await (supabase as any)
        .from("work_types")
        .select("*")
        .order("name");
      if (error) {
        console.error("Error fetching work types:", error);
        return [];
      }
      console.log("Fetched work types:", data);
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
      console.log("Starting to add work type:", name);
      
      const { data, error } = await (supabase as any)
        .from("work_types")
        .insert({ name })
        .select()
        .single();
        
      if (error) {
        console.error("Error adding work type:", error);
        throw error;
      }
      
      console.log("Work type added successfully:", data);
      
      // إنشاء أسعار افتراضية للأطباء
      if (data?.id) {
        try {
          console.log("Creating default prices for work type:", data.id);
          await createPrices.mutateAsync(data.id);
          console.log("Default prices created successfully");
        } catch (priceError) {
          console.error("Error creating default prices:", priceError);
        }
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log("Work type mutation successful:", data);
      queryClient.invalidateQueries({ queryKey: ["work_types"] });
      queryClient.invalidateQueries({ queryKey: ["doctor_work_type_prices"] });
      toast({ title: "تم إضافة نوع العمل بنجاح مع ربطه بجميع الأطباء" });
    },
    onError: (error) => {
      console.error("Work type mutation failed:", error);
      toast({ title: "حدث خطأ أثناء إضافة نوع العمل", variant: "destructive" });
    },
  });
};

export const useUpdateWorkType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await (supabase as any)
        .from("work_types")
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
      const { error } = await (supabase as any)
        .from("work_types")
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
