
-- إنشاء جدول أنواع العمل
CREATE TABLE IF NOT EXISTS public.work_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إنشاء جدول أسعار أنواع العمل للأطباء
CREATE TABLE IF NOT EXISTS public.doctor_work_type_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    work_type_id UUID NOT NULL REFERENCES public.work_types(id) ON DELETE CASCADE,
    price DECIMAL(10,2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(doctor_id, work_type_id)
);

-- إضافة فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_doctor_work_type_prices_doctor_id ON public.doctor_work_type_prices(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_work_type_prices_work_type_id ON public.doctor_work_type_prices(work_type_id);

-- إدراج بعض أنواع العمل الافتراضية
INSERT INTO public.work_types (name) VALUES 
    ('زركون'),
    ('مؤقت'),
    ('تقويم'),
    ('تنظيف'),
    ('حشو')
ON CONFLICT (name) DO NOTHING;

-- تفعيل RLS
ALTER TABLE public.work_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_work_type_prices ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS للسماح بجميع العمليات (يمكن تعديلها لاحقاً حسب الحاجة)
CREATE POLICY "Enable all operations for work_types" ON public.work_types
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for doctor_work_type_prices" ON public.doctor_work_type_prices
    FOR ALL USING (true);
