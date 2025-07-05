
-- إنشاء جدول الشيكات
CREATE TABLE public.checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_date DATE NOT NULL,
  receive_date DATE,
  recipient_name TEXT,
  doctor_id UUID REFERENCES public.doctors(id),
  amount NUMERIC NOT NULL,
  check_number TEXT,
  bank_name TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'مستلم',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين Row Level Security
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للسماح بكل العمليات
CREATE POLICY "Allow all for checks" 
  ON public.checks 
  FOR ALL 
  USING (true);

-- إنشاء bucket لتخزين صور الشيكات
INSERT INTO storage.buckets (id, name, public) 
VALUES ('check-images', 'check-images', true);

-- سياسة السماح برفع الصور
CREATE POLICY "Allow upload check images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'check-images');

-- سياسة السماح بقراءة الصور
CREATE POLICY "Allow read check images"
ON storage.objects FOR SELECT
USING (bucket_id = 'check-images');

-- سياسة السماح بحذف الصور
CREATE POLICY "Allow delete check images"
ON storage.objects FOR DELETE
USING (bucket_id = 'check-images');
