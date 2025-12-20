-- Add classes column to prov74_checklist table
ALTER TABLE public.prov74_checklist ADD COLUMN IF NOT EXISTS classes jsonb DEFAULT '[]'::jsonb;

-- Notify schema reload
SELECT pg_notify('pgrst', 'reload schema');
