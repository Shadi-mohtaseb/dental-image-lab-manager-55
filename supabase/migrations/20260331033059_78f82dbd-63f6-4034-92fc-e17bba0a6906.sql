
-- Add user_id column to all data tables with default auth.uid()
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.checks ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.expense_types ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.work_types ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.doctor_transactions ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.doctor_work_type_prices ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.company_capital ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();
ALTER TABLE public.partner_transactions ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

-- Backfill existing data with admin user's ID
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'shadimohtaseb56@gmail.com' LIMIT 1;
  IF admin_id IS NOT NULL THEN
    UPDATE public.doctors SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE public.cases SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE public.checks SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE public.expenses SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE public.expense_types SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE public.work_types SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE public.doctor_transactions SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE public.doctor_work_type_prices SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE public.company_capital SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE public.partners SET user_id = admin_id WHERE user_id IS NULL;
    UPDATE public.partner_transactions SET user_id = admin_id WHERE user_id IS NULL;
  END IF;
END $$;

-- Drop old permissive "Allow all" RLS policies
DROP POLICY IF EXISTS "Allow all for doctors" ON public.doctors;
DROP POLICY IF EXISTS "Allow all for cases" ON public.cases;
DROP POLICY IF EXISTS "Allow all for checks" ON public.checks;
DROP POLICY IF EXISTS "Allow all for expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow all for expense_types" ON public.expense_types;
DROP POLICY IF EXISTS "Allow all for work_types" ON public.work_types;
DROP POLICY IF EXISTS "Allow all for doctor_transactions" ON public.doctor_transactions;
DROP POLICY IF EXISTS "Allow all for doctor_work_type_prices" ON public.doctor_work_type_prices;
DROP POLICY IF EXISTS "Allow all for company_capital" ON public.company_capital;
DROP POLICY IF EXISTS "Allow all for partners" ON public.partners;
DROP POLICY IF EXISTS "Allow all for partner_transactions" ON public.partner_transactions;

-- Create user-scoped RLS policies for authenticated users
CREATE POLICY "Users manage own data" ON public.doctors FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON public.cases FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON public.checks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON public.expenses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON public.expense_types FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON public.work_types FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON public.doctor_transactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON public.doctor_work_type_prices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON public.company_capital FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON public.partners FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own data" ON public.partner_transactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow anon to read doctors (for doctor dashboard via access_token)
CREATE POLICY "Anon read doctors by token" ON public.doctors FOR SELECT TO anon USING (access_token IS NOT NULL);
-- Allow anon to read cases for doctor dashboard
CREATE POLICY "Anon read cases" ON public.cases FOR SELECT TO anon USING (true);
-- Allow anon to read doctor_transactions for doctor dashboard
CREATE POLICY "Anon read transactions" ON public.doctor_transactions FOR SELECT TO anon USING (true);

-- Update SECURITY DEFINER functions to be user-scoped
CREATE OR REPLACE FUNCTION public.update_company_capital()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  net_profit NUMERIC;
  calling_user_id uuid;
BEGIN
  calling_user_id := auth.uid();
  
  SELECT COALESCE(SUM(dt.amount), 0) - COALESCE((SELECT SUM(e.total_amount) FROM public.expenses e WHERE e.user_id = calling_user_id), 0)
  INTO net_profit
  FROM public.doctor_transactions dt
  WHERE dt.transaction_type = 'دفعة' AND dt.user_id = calling_user_id;
  
  UPDATE public.company_capital SET 
    total_capital = net_profit,
    updated_at = now()
  WHERE user_id = calling_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.company_capital (total_capital, user_id) VALUES (net_profit, calling_user_id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.distribute_profits_to_partners()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  partner_record RECORD;
  net_profit NUMERIC;
  calling_user_id uuid;
BEGIN
  calling_user_id := auth.uid();
  
  SELECT COALESCE(SUM(dt.amount), 0) - COALESCE((SELECT SUM(e.total_amount) FROM public.expenses e WHERE e.user_id = calling_user_id), 0)
  INTO net_profit
  FROM public.doctor_transactions dt
  WHERE dt.transaction_type = 'دفعة' AND dt.user_id = calling_user_id;
  
  FOR partner_record IN SELECT * FROM public.partners WHERE user_id = calling_user_id LOOP
    UPDATE public.partners
    SET total_amount = (net_profit * COALESCE(partner_record.partnership_percentage, 0) / 100),
        updated_at = now()
    WHERE id = partner_record.id;
  END LOOP;
END;
$$;
