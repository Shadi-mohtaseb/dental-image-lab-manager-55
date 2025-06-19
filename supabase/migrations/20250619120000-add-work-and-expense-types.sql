
-- إنشاء جدول أنواع العمل
CREATE TABLE IF NOT EXISTS public.work_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إنشاء جدول أنواع المصروفات
CREATE TABLE IF NOT EXISTS public.expense_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إدراج بعض أنواع العمل الأساسية
INSERT INTO public.work_types (name) VALUES 
  ('تيجان زيركون'),
  ('جسور زيركون'),
  ('فينير'),
  ('إنليه'),
  ('أونليه'),
  ('زراعة أسنان'),
  ('تقويم أسنان')
ON CONFLICT (name) DO NOTHING;

-- إدراج بعض أنواع المصروفات الأساسية
INSERT INTO public.expense_types (name) VALUES 
  ('مواد خام'),
  ('فواتير الكهرباء'),
  ('فواتير المياه'),
  ('الرواتب'),
  ('صيانة الأجهزة'),
  ('إيجار'),
  ('مصروفات عامة')
ON CONFLICT (name) DO NOTHING;

-- تمكين RLS
ALTER TABLE public.work_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_types ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
CREATE POLICY "Enable read access for all users" ON public.work_types FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.work_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.work_types FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.work_types FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.expense_types FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.expense_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.expense_types FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.expense_types FOR DELETE USING (true);

-- إضافة عمود نوع المصروف إلى جدول المصروفات إذا لم يكن موجوداً
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS expense_type TEXT;
