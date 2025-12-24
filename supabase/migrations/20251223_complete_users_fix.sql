-- Complete migration to fix users table structure
-- Step 1: Rename table if needed
-- Step 2: Add missing columns
-- Step 3: Fix RLS policies

-- Rename usuarios to users if it hasn't been done
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usuarios') THEN
    ALTER TABLE public.usuarios RENAME TO users;
  END IF;
END $$;

-- Add user_id column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add other missing columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Make user_id NOT NULL after we populate it
-- (we'll do this later after syncing)

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Usuarios select dono" ON public.users;
DROP POLICY IF EXISTS "Usuarios insert dono" ON public.users;
DROP POLICY IF EXISTS "Usuarios update dono" ON public.users;
DROP POLICY IF EXISTS "Usuarios delete dono" ON public.users;

-- Drop any existing new policies
DROP POLICY IF EXISTS "Users select policy" ON public.users;
DROP POLICY IF EXISTS "Users insert policy" ON public.users;
DROP POLICY IF EXISTS "Users update policy" ON public.users;
DROP POLICY IF EXISTS "Users delete policy" ON public.users;

-- Create new permissive policies
CREATE POLICY "Users select policy" ON public.users
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users insert policy" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users update policy" ON public.users
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users delete policy" ON public.users
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Reload schema
SELECT pg_notify('pgrst','reload schema');
SELECT pg_notify('pgrst','reload config');
