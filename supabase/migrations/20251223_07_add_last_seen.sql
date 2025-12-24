-- Migration to add last_seen_at for online status tracking
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
