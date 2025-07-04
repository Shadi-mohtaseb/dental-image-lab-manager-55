
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDoctorFinancialSummary(doctorId: string) {
  // جلب الحالات للطبيب
  const { data: cases = [], isLoading: loadingCases } = useQuery({
    queryKey: ["cases", doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("doctor_id", doctorId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!doctorId,
  });

  // جلب الدفعات للطبيب
  const { data: doctorPayments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["doctor_transactions", doctorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_transactions")
        .select("*")
        .eq("doctor_id", doctorId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!doctorId,
  });

  // حساب الملخص المالي
  const totalDue = cases.reduce((sum: number, c: any) => sum + (Number(c.price) || 0), 0);
  const totalPaid = doctorPayments
    .filter((t: any) => t.transaction_type === "دفعة")
    .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);

  const remaining = totalDue - totalPaid;

  return {
    totalDue,
    totalPaid,
    remaining,
    doctorCases: cases,
    isLoading: loadingCases || loadingPayments,
  };
}
