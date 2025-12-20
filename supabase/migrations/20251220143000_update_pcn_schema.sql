-- Update client_pcn table schema
ALTER TABLE public.client_pcn
  ADD COLUMN IF NOT EXISTS pcn boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS politica_backup boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS politica_ti boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS encaminhado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS link text,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS version,
  DROP COLUMN IF EXISTS file_url;

-- Notify
SELECT pg_notify('pgrst', 'reload schema');
