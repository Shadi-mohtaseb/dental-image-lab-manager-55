
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useDoctorWorkTypePrices = () => {
  return useQuery({
    queryKey: ["doctor_work_type_prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_work_type_prices" as any)
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateDoctorWorkTypePricesForNewWorkType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workTypeId: string) => {
      // جلب جميع الأطباء
      const { data: doctors, error: doctorsError } = await supabase
        .from("doctors")
        .select("id");
      
      if (doctorsError) throw doctorsError;
      
      // إنشاء إدخالات بقيمة صفر لكل طبيب
      const priceEntries = doctors.map(doctor => ({
        doctor_id: doctor.id,
        work_type_id: workTypeId,
        price: 0
      }));
      
      const { error } = await supabase
        .from("doctor_work_type_prices" as any)
        .insert(priceEntries);
      
      if (error) throw error;
      return priceEntries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_work_type_prices"] });
      toast({
        title: "تم إنشاء أسعار افتراضية",
        description: "تم ربط نوع العمل الجديد بجميع الأطباء بقيمة صفر",
      });
    },
    onError: (error) => {
      console.error("Error creating doctor work type prices:", error);
      toast({
        title: "خطأ في إنشاء الأسعار",
        description: "حدث خطأ أثناء ربط نوع العمل بالأطباء",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDoctorWorkTypePrice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ doctorId, workTypeId, price }: { doctorId: string; workTypeId: string; price: number }) => {
      const { error } = await supabase
        .from("doctor_work_type_prices" as any)
        .upsert({
          doctor_id: doctorId,
          work_type_id: workTypeId,
          price: price
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor_work_type_prices"] });
      toast({
        title: "تم تحديث السعر بنجاح",
        description: "تم حفظ السعر الجديد لنوع العمل",
      });
    },
    onError: (error) => {
      console.error("Error updating doctor work type price:", error);
      toast({
        title: "خطأ في تحديث السعر",
        description: "حدث خطأ أثناء تحديث السعر",
        variant: "destructive",
      });
    },
  });
};
