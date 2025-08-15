
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type FinancialSummary = {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
};

export const useFinancialSummary = () => {
  return useQuery<FinancialSummary>({
    queryKey: ["financial-summary"],
    queryFn: async () => {
      // Get cases (revenues)
      const { data: cases, error: casesError } = await supabase
        .from("cases")
        .select("price");
      if (casesError) throw casesError;

      // Get expenses
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("total_amount, expense_types(name)");
      if (expensesError) throw expensesError;

      const totalRevenue =
        (cases?.reduce((sum, c) => sum + (Number(c.price) || 0), 0)) || 0;
      const totalExpenses =
        (expenses?.reduce((sum, e) => sum + (Number(e.total_amount) || 0), 0)) || 0;
      const netProfit = totalRevenue - totalExpenses;

      return { totalRevenue, totalExpenses, netProfit };
    },
  });
};
