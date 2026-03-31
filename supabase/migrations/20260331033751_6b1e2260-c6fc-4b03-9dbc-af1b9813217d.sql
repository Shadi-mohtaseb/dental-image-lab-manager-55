
-- Drop the unique constraint on name only
ALTER TABLE public.work_types DROP CONSTRAINT IF EXISTS work_types_name_key;

-- Add composite unique constraint on (name, user_id)
ALTER TABLE public.work_types ADD CONSTRAINT work_types_name_user_id_key UNIQUE (name, user_id);
