
-- تغيير عمود work_type من enum إلى text في جدول cases
ALTER TABLE public.cases 
  ALTER COLUMN work_type TYPE TEXT;

-- حذف enum القديم
DROP TYPE IF EXISTS public.work_type;
