import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DoctorWithData {
  id: string;
  name: string;
  phone?: string;
  access_token: string;
  cases: any[];
  transactions: any[];
}

export function useDoctorByToken(accessToken: string) {
  return useQuery({
    queryKey: ["doctor-by-token", accessToken],
    queryFn: async (): Promise<DoctorWithData | null> => {
      if (!accessToken) {
        throw new Error("Access token is required");
      }

      // جلب بيانات الطبيب باستخدام access_token
      const { data: doctor, error: doctorError } = await supabase
        .from("doctors")
        .select("*")
        .eq("access_token", accessToken)
        .single();

      if (doctorError || !doctor) {
        throw new Error("Invalid access token");
      }

      // جلب الحالات الخاصة بالطبيب
      const { data: cases, error: casesError } = await supabase
        .from("cases")
        .select("*")
        .eq("doctor_id", doctor.id);

      if (casesError) {
        throw casesError;
      }

      // جلب المعاملات المالية للطبيب
      const { data: transactions, error: transactionsError } = await supabase
        .from("doctor_transactions")
        .select("*")
        .eq("doctor_id", doctor.id);

      if (transactionsError) {
        throw transactionsError;
      }

      return {
        ...doctor,
        cases: cases || [],
        transactions: transactions || []
      };
    },
    enabled: !!accessToken,
    retry: false, // لا تعيد المحاولة في حالة access_token خاطئ
  });
}