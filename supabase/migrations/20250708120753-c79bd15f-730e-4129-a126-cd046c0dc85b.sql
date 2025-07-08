-- إزالة التريجرات بشكل صريح أولاً
DROP TRIGGER IF EXISTS auto_distribute_on_cases ON public.cases;
DROP TRIGGER IF EXISTS auto_distribute_on_expenses ON public.expenses;
DROP TRIGGER IF EXISTS auto_distribute_on_partners ON public.partners;

-- الآن يمكن إزالة دالة التريجر
DROP FUNCTION IF EXISTS public.auto_distribute_profits_trigger() CASCADE;

-- تبسيط دالة حساب رأس المال (حساب فقط بدون تحديث)
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
  
  RETURN net_profit;
END;
$$ LANGUAGE plpgsql;

-- تعديل دالة توزيع الأرباح لتستخدم النسب المحددة من المستخدم
CREATE OR REPLACE FUNCTION public.distribute_profits_to_partners()
RETURNS VOID AS $$
DECLARE
  partner_record RECORD;
  net_profit NUMERIC;
BEGIN
  -- حساب صافي الربح الحالي
  SELECT public.calculate_company_capital() INTO net_profit;
  
  -- توزيع الأرباح على كل شريك بناءً على نسبته المحددة مسبقاً
  FOR partner_record IN SELECT * FROM public.partners LOOP
    UPDATE public.partners
    SET total_amount = (net_profit * COALESCE(partner_record.partnership_percentage, 0) / 100),
        updated_at = now()
    WHERE id = partner_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- دالة منفصلة لتحديث رأس المال
CREATE OR REPLACE FUNCTION public.update_company_capital()
RETURNS VOID AS $$
DECLARE
  net_profit NUMERIC;
BEGIN
  -- حساب صافي الربح
  SELECT public.calculate_company_capital() INTO net_profit;
  
  -- تحديث جدول رأس المال
  UPDATE public.company_capital SET 
    total_capital = net_profit,
    updated_at = now()
  WHERE id = (SELECT id FROM public.company_capital LIMIT 1);
  
  -- إذا لم يوجد سجل، أنشئ واحداً
  IF NOT FOUND THEN
    INSERT INTO public.company_capital (total_capital) VALUES (net_profit);
  END IF;
END;
$$ LANGUAGE plpgsql;