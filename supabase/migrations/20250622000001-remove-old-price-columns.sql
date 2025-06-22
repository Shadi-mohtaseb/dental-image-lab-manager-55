
-- حذف الحقول القديمة من جدول الأطباء
ALTER TABLE public.doctors
  DROP COLUMN IF EXISTS zircon_price,
  DROP COLUMN IF EXISTS temp_price;
