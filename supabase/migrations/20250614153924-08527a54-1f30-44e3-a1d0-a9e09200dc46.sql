
-- تعديل دالة توزيع الأرباح لتستخدم فقط النسب التي أدخلها المستخدم ولا تغيرها
CREATE OR REPLACE FUNCTION public.distribute_profits_to_partners()
RETURNS VOID AS $$
DECLARE
  partner_record RECORD;
  net_profit NUMERIC;
BEGIN
  -- حساب صافي الربح الحالي
  SELECT public.calculate_company_capital() INTO net_profit;
  
  -- توزيع الأرباح على كل شريك بناءً على نسبته
  FOR partner_record IN SELECT * FROM public.partners LOOP
    UPDATE public.partners
    SET total_amount = (net_profit * partner_record.partnership_percentage / 100),
        updated_at = now()
    WHERE id = partner_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
