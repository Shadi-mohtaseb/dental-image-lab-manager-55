
-- إصلاح دالة توزيع الأرباح بدون استخدام window functions
CREATE OR REPLACE FUNCTION public.distribute_profits_to_partners()
RETURNS VOID AS $$
DECLARE
  net_profit NUMERIC;
  partner_count INTEGER;
  first_partner_id UUID;
  partner_record RECORD;
BEGIN
  -- حساب صافي الربح الحالي
  SELECT public.calculate_company_capital() INTO net_profit;
  
  -- التأكد من وجود شركاء
  SELECT COUNT(*) INTO partner_count FROM public.partners;
  
  IF partner_count > 0 THEN
    -- الحصول على معرف الشريك الأول (بناءً على تاريخ الإنشاء)
    SELECT id INTO first_partner_id 
    FROM public.partners 
    ORDER BY created_at 
    LIMIT 1;
    
    -- تحديث كل شريك بشكل منفصل
    FOR partner_record IN SELECT * FROM public.partners LOOP
      IF partner_record.id = first_partner_id THEN
        -- الشريك الأول يحصل على الثلثين (66.67%)
        UPDATE public.partners 
        SET partnership_percentage = 66.67,
            total_amount = (net_profit * 66.67 / 100),
            updated_at = now()
        WHERE id = partner_record.id;
      ELSE
        -- باقي الشركاء يحصلون على الثلث (33.33%)
        UPDATE public.partners 
        SET partnership_percentage = 33.33,
            total_amount = (net_profit * 33.33 / 100),
            updated_at = now()
        WHERE id = partner_record.id;
      END IF;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;
