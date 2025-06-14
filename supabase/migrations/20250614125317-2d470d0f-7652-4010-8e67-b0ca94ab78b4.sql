
-- إنشاء جدول لمعاملات الشراكة "partner_transactions"
CREATE TABLE public.partner_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdraw')),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);

-- تفعيل أمان الصفوف
ALTER TABLE public.partner_transactions ENABLE ROW LEVEL SECURITY;

-- سياسة: السماح بالقراءة والإضافة والتعديل والحذف لجميع المستخدمين (يمكن تقييدها لاحقاً عند الحاجة)
CREATE POLICY "Allow full access to partner_transactions"
  ON public.partner_transactions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
