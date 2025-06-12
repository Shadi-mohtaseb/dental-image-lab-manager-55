
-- إنشاء جدول الأطباء
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول الشركاء
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  partnership_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  phone TEXT,
  email TEXT,
  address TEXT,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول المصاريف
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء enum لحالة الحالات الطبية
CREATE TYPE case_status AS ENUM (
  'قيد التنفيذ',
  'تجهيز العمل',
  'اختبار القوي',
  'المراجعة النهائية',
  'تم التسليم',
  'معلق',
  'ملغي'
);

-- إنشاء enum لنوع العمل
CREATE TYPE work_type AS ENUM (
  'زيركون',
  'مؤقت',
  'تقويم',
  'تلبيس',
  'حشوات',
  'جسور',
  'طقم أسنان'
);

-- إنشاء جدول الحالات الطبية
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id),
  work_type work_type NOT NULL,
  tooth_number TEXT,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  status case_status NOT NULL DEFAULT 'قيد التنفيذ',
  price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول سجل الأطباء (التعاملات المالية)
CREATE TABLE public.doctor_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
  case_id UUID REFERENCES public.cases(id),
  transaction_type TEXT NOT NULL, -- 'دفعة' أو 'مستحق'
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT, -- 'نقدي' أو 'شيك' أو 'تحويل'
  check_number TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'مؤكد', -- 'مؤكد' أو 'معلق'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_cases_doctor_id ON public.cases(doctor_id);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_submission_date ON public.cases(submission_date);
CREATE INDEX idx_doctor_transactions_doctor_id ON public.doctor_transactions(doctor_id);
CREATE INDEX idx_doctor_transactions_date ON public.doctor_transactions(transaction_date);
CREATE INDEX idx_expenses_purchase_date ON public.expenses(purchase_date);

-- إدراج بيانات تجريبية للأطباء
INSERT INTO public.doctors (name, specialty, phone, email, address) VALUES
('د. أحمد محمد', 'طب أسنان عام', '0501234567', 'ahmed@example.com', 'الرياض، حي النخيل'),
('د. سارة عبدالعزيز', 'تقويم الأسنان', '0509876543', 'sara@example.com', 'جدة، حي الزهراء'),
('د. خالد العمري', 'جراحة الوجه والفكين', '0505555555', 'khalid@example.com', 'الدمام، حي الفيصلية'),
('د. نورة السالم', 'تجميل الأسنان', '0507777777', 'nora@example.com', 'مكة، حي العوالي'),
('د. فهد الخليفي', 'علاج الجذور', '0508888888', 'fahad@example.com', 'المدينة، حي العنبرية');
