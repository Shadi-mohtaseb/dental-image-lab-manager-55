-- إضافة جدول أنواع المصاريف
CREATE TABLE IF NOT EXISTS public.expense_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إدراج الأنواع الافتراضية
INSERT INTO public.expense_types (name) VALUES 
  ('فواتير كهرباء'),
  ('مواد خام'),
  ('مستلزمات'),
  ('رواتب'),
  ('صيانة'),
  ('أخرى')
ON CONFLICT (name) DO NOTHING;

-- إضافة عمود نوع المصروف إلى جدول المصاريف
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS expense_type_id UUID REFERENCES public.expense_types(id);

-- تحديث السجلات الموجودة لتستخدم نوع "أخرى" كقيمة افتراضية
UPDATE public.expenses 
SET expense_type_id = (SELECT id FROM public.expense_types WHERE name = 'أخرى' LIMIT 1)
WHERE expense_type_id IS NULL;

-- إضافة قيد عدم الإلغاء لعمود expense_type_id
ALTER TABLE public.expenses 
ALTER COLUMN expense_type_id SET NOT NULL;

-- حذف الأعمدة غير المطلوبة
ALTER TABLE public.expenses 
DROP COLUMN IF EXISTS item_name,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS quantity,
DROP COLUMN IF EXISTS unit_price;

-- تمكين RLS على جدول أنواع المصاريف
ALTER TABLE public.expense_types ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للسماح بجميع العمليات على أنواع المصاريف
CREATE POLICY "Allow all for expense_types" ON public.expense_types
FOR ALL USING (true);