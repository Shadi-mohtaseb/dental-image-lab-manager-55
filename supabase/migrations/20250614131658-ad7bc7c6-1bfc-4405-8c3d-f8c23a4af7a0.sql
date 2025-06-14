
-- تحديث دالة حساب رأس المال لتحسب صافي الربح فقط
CREATE OR REPLACE FUNCTION public.calculate_company_capital()
RETURNS NUMERIC AS $$
DECLARE
  total_revenue NUMERIC := 0;
  total_expenses NUMERIC := 0;
  net_profit NUMERIC := 0;
BEGIN
  -- حساب إجمالي الإيرادات من الحالات فقط
  SELECT COALESCE(SUM(price), 0) INTO total_revenue 
  FROM public.cases 
  WHERE price IS NOT NULL;
  
  -- حساب إجمالي المصاريف
  SELECT COALESCE(SUM(total_amount), 0) INTO total_expenses 
  FROM public.expenses;
  
  -- رأس المال = صافي الربح (الإيرادات - المصاريف)
  net_profit := total_revenue - total_expenses;
  
  -- تحديث جدول رأس المال
  UPDATE public.company_capital SET 
    total_capital = net_profit,
    updated_at = now()
  WHERE id = (SELECT id FROM public.company_capital LIMIT 1);
  
  RETURN net_profit;
END;
$$ LANGUAGE plpgsql;

-- تحديث دالة توزيع الأرباح لتقسم بنسبة الثلثين والثلث
CREATE OR REPLACE FUNCTION public.distribute_profits_to_partners()
RETURNS VOID AS $$
DECLARE
  net_profit NUMERIC;
  partner_count INTEGER;
BEGIN
  -- حساب صافي الربح الحالي
  SELECT public.calculate_company_capital() INTO net_profit;
  
  -- التأكد من وجود شركاء
  SELECT COUNT(*) INTO partner_count FROM public.partners;
  
  IF partner_count > 0 THEN
    -- تحديث نسب الشراكة: الأول (أنت) الثلثين = 66.67%، الثاني (الشريك) الثلث = 33.33%
    UPDATE public.partners 
    SET partnership_percentage = CASE 
      WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN 66.67  -- الشريك الأول (أنت)
      ELSE 33.33  -- باقي الشركاء
    END,
    total_amount = CASE 
      WHEN ROW_NUMBER() OVER (ORDER BY created_at) = 1 THEN (net_profit * 66.67 / 100)  -- حصة الثلثين
      ELSE (net_profit * 33.33 / 100)  -- حصة الثلث
    END,
    updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql;
