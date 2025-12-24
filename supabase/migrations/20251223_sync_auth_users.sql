-- Sync existing auth.users with public.users table
-- This creates missing records in public.users for users that exist in auth

-- First, let's see what we have
-- SELECT id, email, raw_user_meta_data->>'full_name' as name FROM auth.users;

-- Insert missing users from auth.users to public.users
INSERT INTO public.users (user_id, email, full_name, "group", permissions, password_hash, created_at)
SELECT 
  au.id as user_id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
  'gestor' as "group",
  '[]'::jsonb as permissions,
  '' as password_hash, -- Auth handles passwords, this is just for legacy
  au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON pu.user_id = au.id
WHERE pu.id IS NULL; -- Only insert if doesn't exist

-- Update existing users in public.users to link with auth.users if not linked
UPDATE public.users pu
SET user_id = au.id
FROM auth.users au
WHERE pu.email = au.email 
  AND (pu.user_id IS NULL OR pu.user_id != au.id);

-- Reload schema
SELECT pg_notify('pgrst','reload schema');
