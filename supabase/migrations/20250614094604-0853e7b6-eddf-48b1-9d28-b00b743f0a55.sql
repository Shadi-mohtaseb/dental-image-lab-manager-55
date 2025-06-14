
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS number_of_teeth INTEGER;

-- سنعرض الحقل في الجدول ولن يكون إجباريًا كبداية ولا يؤثر على البيانات السابقة
