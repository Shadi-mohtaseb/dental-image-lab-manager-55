
-- إنشاء trigger لتوزيع الأرباح تلقائياً عند إضافة/تعديل/حذف الحالات
CREATE OR REPLACE FUNCTION public.auto_distribute_profits_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- استدعاء دالة توزيع الأرباح تلقائياً
  PERFORM public.distribute_profits_to_partners();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- إضافة trigger للحالات
DROP TRIGGER IF EXISTS auto_distribute_on_cases ON public.cases;
CREATE TRIGGER auto_distribute_on_cases
  AFTER INSERT OR UPDATE OR DELETE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.auto_distribute_profits_trigger();

-- إضافة trigger للمصاريف
DROP TRIGGER IF EXISTS auto_distribute_on_expenses ON public.expenses;
CREATE TRIGGER auto_distribute_on_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.auto_distribute_profits_trigger();

-- إضافة trigger عند إضافة شريك جديد لإعادة توزيع الحصص
DROP TRIGGER IF EXISTS auto_distribute_on_partners ON public.partners;
CREATE TRIGGER auto_distribute_on_partners
  AFTER INSERT OR UPDATE OR DELETE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.auto_distribute_profits_trigger();
