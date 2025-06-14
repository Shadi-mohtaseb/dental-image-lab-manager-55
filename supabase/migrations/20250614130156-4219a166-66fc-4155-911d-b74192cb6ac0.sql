
-- إضافة جدول لحساب رأس المال الإجمالي للشركة
CREATE TABLE IF NOT EXISTS public.company_capital (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_capital NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إدراج قيمة أولية لرأس المال
INSERT INTO public.company_capital (total_capital) VALUES (0) ON CONFLICT DO NOTHING;

-- إضافة رصيد شخصي لكل شريك منفصل عن الرصيد الإجمالي
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS personal_balance NUMERIC DEFAULT 0;

-- إضافة عمود لربط المعاملات بالحالات
ALTER TABLE public.partner_transactions ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES public.cases(id);

-- إضافة عمود لتتبع مصدر المعاملة (من حالة، إيداع مباشر، سحب شخصي، إلخ)
ALTER TABLE public.partner_transactions ADD COLUMN IF NOT EXISTS transaction_source TEXT DEFAULT 'manual';

-- إنشاء فيو لحساب الأرصدة بشكل تلقائي
CREATE OR REPLACE VIEW public.partner_balances AS
SELECT 
  p.id,
  p.name,
  p.partnership_percentage,
  COALESCE(SUM(CASE WHEN pt.transaction_type = 'deposit' THEN pt.amount ELSE -pt.amount END), 0) as calculated_balance,
  p.personal_balance,
  p.total_amount
FROM public.partners p
LEFT JOIN public.partner_transactions pt ON p.id = pt.partner_id
GROUP BY p.id, p.name, p.partnership_percentage, p.personal_balance, p.total_amount;

-- دالة لحساب رأس المال الإجمالي من الحالات والمصاريف
CREATE OR REPLACE FUNCTION public.calculate_company_capital()
RETURNS NUMERIC AS $$
DECLARE
  total_revenue NUMERIC := 0;
  total_expenses NUMERIC := 0;
  net_capital NUMERIC := 0;
BEGIN
  -- حساب إجمالي الإيرادات من الحالات
  SELECT COALESCE(SUM(price), 0) INTO total_revenue FROM public.cases WHERE price IS NOT NULL;
  
  -- حساب إجمالي المصاريف
  SELECT COALESCE(SUM(total_amount), 0) INTO total_expenses FROM public.expenses;
  
  -- رأس المال = الإيرادات - المصاريف
  net_capital := total_revenue - total_expenses;
  
  -- تحديث جدول رأس المال
  UPDATE public.company_capital SET 
    total_capital = net_capital,
    updated_at = now()
  WHERE id = (SELECT id FROM public.company_capital LIMIT 1);
  
  RETURN net_capital;
END;
$$ LANGUAGE plpgsql;

-- دالة لتوزيع الأرباح على الشركاء بناء على النسب
CREATE OR REPLACE FUNCTION public.distribute_profits_to_partners()
RETURNS VOID AS $$
DECLARE
  partner_record RECORD;
  company_capital_amount NUMERIC;
  partner_share NUMERIC;
BEGIN
  -- حساب رأس المال الحالي
  SELECT public.calculate_company_capital() INTO company_capital_amount;
  
  -- توزيع الأرباح على كل شريك بناء على نسبته
  FOR partner_record IN SELECT * FROM public.partners LOOP
    partner_share := (company_capital_amount * partner_record.partnership_percentage / 100);
    
    -- تحديث الرصيد الإجمالي للشريك
    UPDATE public.partners 
    SET total_amount = partner_share,
        updated_at = now()
    WHERE id = partner_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث الأرصدة تلقائياً عند إضافة/تعديل الحالات أو المصاريف
CREATE OR REPLACE FUNCTION public.update_balances_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.distribute_profits_to_partners();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- إضافة triggers للتحديث التلقائي
DROP TRIGGER IF EXISTS update_balances_on_cases ON public.cases;
CREATE TRIGGER update_balances_on_cases
  AFTER INSERT OR UPDATE OR DELETE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_balances_trigger();

DROP TRIGGER IF EXISTS update_balances_on_expenses ON public.expenses;
CREATE TRIGGER update_balances_on_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses  
  FOR EACH ROW EXECUTE FUNCTION public.update_balances_trigger();
