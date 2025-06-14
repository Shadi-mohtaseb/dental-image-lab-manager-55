
-- إعادة تعريف الدالة بدون window function
CREATE OR REPLACE FUNCTION public.distribute_profits_to_partners()
RETURNS VOID AS $$
DECLARE
  net_profit NUMERIC;
  first_partner_id UUID;
  partner_count INTEGER;
BEGIN
  -- احسب صافي الربح الحالي
  SELECT public.calculate_company_capital() INTO net_profit;
  
  -- احصل على عدد الشركاء
  SELECT COUNT(*) INTO partner_count FROM public.partners;
  
  IF partner_count > 0 THEN
    -- احصل على أقدم شريك (الأول المُضاف بناءً على created_at)
    SELECT id INTO first_partner_id FROM public.partners ORDER BY created_at ASC LIMIT 1;

    -- حدّث نسبة الشراكة والمبلغ للأول (ثلثين)
    UPDATE public.partners
    SET 
      partnership_percentage = 66.67,
      total_amount = (net_profit * 66.67 / 100),
      updated_at = now()
    WHERE id = first_partner_id;

    -- حدّث نسبة الشراكة والمبلغ للبقية (ثلث واحد لكل شريك من الشركاء الآخرين)
    UPDATE public.partners
    SET 
      partnership_percentage = 33.33,
      total_amount = (net_profit * 33.33 / 100),
      updated_at = now()
    WHERE id <> first_partner_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

