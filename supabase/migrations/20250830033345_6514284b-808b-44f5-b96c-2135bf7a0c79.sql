-- إضافة عمود access_token إلى جدول doctors
ALTER TABLE public.doctors 
ADD COLUMN access_token TEXT UNIQUE;

-- إنشاء فهرس للبحث السريع
CREATE INDEX idx_doctors_access_token ON public.doctors(access_token);

-- إنشاء دالة لتوليد access_token عشوائي
CREATE OR REPLACE FUNCTION generate_doctor_access_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- تحديث الأطباء الحاليين بـ access_token
UPDATE public.doctors 
SET access_token = generate_doctor_access_token()
WHERE access_token IS NULL;