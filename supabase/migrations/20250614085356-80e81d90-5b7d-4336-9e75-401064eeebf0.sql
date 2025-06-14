
-- إضافة أعمدة للأسعار حسب نوع العمل إذا لم تكن موجودة
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS zircon_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS temp_price numeric NOT NULL DEFAULT 0;

-- حذف عمود price القديم إن وجد
ALTER TABLE public.doctors
  DROP COLUMN IF EXISTS price;
