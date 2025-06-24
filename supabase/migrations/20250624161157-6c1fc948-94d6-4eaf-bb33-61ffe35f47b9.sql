
-- إضافة عمود تاريخ صرف الشيك إلى جدول doctor_transactions
ALTER TABLE public.doctor_transactions 
ADD COLUMN check_cash_date DATE NULL;

-- إضافة تعليق للعمود الجديد
COMMENT ON COLUMN public.doctor_transactions.check_cash_date IS 'تاريخ صرف الشيك - يستخدم فقط عندما تكون طريقة الدفع شيك';
