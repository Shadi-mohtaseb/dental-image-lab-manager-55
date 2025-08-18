-- تحديث دالة حساب رأس المال للاعتماد على المدفوعات الفعلية من الأطباء
CREATE OR REPLACE FUNCTION public.calculate_company_capital()
RETURNS numeric
LANGUAGE plpgsql
AS $function$
DECLARE
  total_doctor_payments NUMERIC := 0;
  total_expenses NUMERIC := 0;
  net_profit NUMERIC := 0;
BEGIN
  -- حساب إجمالي المدفوعات الفعلية من الأطباء
  SELECT COALESCE(SUM(amount), 0) INTO total_doctor_payments 
  FROM public.doctor_transactions 
  WHERE transaction_type = 'دفعة';
  
  -- حساب إجمالي المصاريف
  SELECT COALESCE(SUM(total_amount), 0) INTO total_expenses 
  FROM public.expenses;
  
  -- رأس المال = صافي الربح (المدفوعات الفعلية - المصاريف)
  net_profit := total_doctor_payments - total_expenses;
  
  RETURN net_profit;
END;
$function$