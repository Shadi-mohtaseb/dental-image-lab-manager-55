-- تحديث دالة حساب رأس المال لحل مشكلة الصلاحيات
CREATE OR REPLACE FUNCTION public.update_company_capital()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;

-- تحديث دالة توزيع الأرباح لحل مشكلة الصلاحيات
CREATE OR REPLACE FUNCTION public.distribute_profits_to_partners()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;