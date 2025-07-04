
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDoctorFinancialSummary(doctorId: string) {
  // جلب الحالات للطبيب
  const { data: cases = [], isLoading: loadingCases } = useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  // جلب الدفعات للطبيب
  const { data: doctorPayments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["doctor_transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_transactions")
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  // حساب الملخص المالي
  const doctorCases = cases.filter((c: any) => c.doctor_id === doctorId);
  const totalDue = doctorCases.reduce((sum: number, c: any) => sum + (Number(c.price) || 0), 0);
  const totalPaid = doctorPayments.filter((t: any) => t.doctor_id === doctorId && t.transaction_type === "دفعة")
    .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

  const remaining = totalDue - totalPaid;

  return {
    totalDue,
    totalPaid,
    remaining,
    doctorCases,
    isLoading: loadingCases || loadingPayments,
  };
}
