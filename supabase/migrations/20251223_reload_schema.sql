-- Force Supabase to reload schema cache
-- This is needed after renaming usuarios to users table

SELECT pg_notify('pgrst','reload schema');
SELECT pg_notify('pgrst','reload config');
