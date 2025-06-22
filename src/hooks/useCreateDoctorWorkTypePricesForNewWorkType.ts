
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCreateDoctorWorkTypePricesForNewWorkType = () => {
  return useMutation({
    mutationFn: async (workTypeId: string) => {
      console.log("Creating default prices for new work type:", workTypeId);
      
      // الحصول على جميع الأطباء
      const { data: doctors, error: doctorsError } = await supabase
        .from("doctors")
        .select("id");
        
      if (doctorsError) {
        console.error("Error fetching doctors:", doctorsError);
        throw doctorsError;
      }
      
      if (!doctors || doctors.length === 0) {
        console.log("No doctors found, skipping price creation");
        return;
      }
      
      // إنشاء أسعار افتراضية لجميع الأطباء
      const pricesData = doctors.map(doctor => ({
        doctor_id: doctor.id,
        work_type_id: workTypeId,
        price: 0
      }));
      
      const { error: pricesError } = await supabase
        .from("doctor_work_type_prices")
        .insert(pricesData);
        
      if (pricesError) {
        console.error("Error creating default prices:", pricesError);
        throw pricesError;
      }
      
      console.log("Default prices created successfully for", doctors.length, "doctors");
    },
  });
};
