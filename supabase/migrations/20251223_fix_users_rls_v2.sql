-- Fix RLS policies for users table to allow admin operations
-- Safe version: Only creates if doesn't exist

DO $$
BEGIN
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Usuarios select dono" ON public.users;
  DROP POLICY IF EXISTS "Usuarios insert dono" ON public.users;
  DROP POLICY IF EXISTS "Usuarios update dono" ON public.users;
  DROP POLICY IF EXISTS "Usuarios delete dono" ON public.users;
  
  -- Drop new policies if they exist (for re-running)
  DROP POLICY IF EXISTS "Users select policy" ON public.users;
  DROP POLICY IF EXISTS "Users insert policy" ON public.users;
  DROP POLICY IF EXISTS "Users update policy" ON public.users;
  DROP POLICY IF EXISTS "Users delete policy" ON public.users;
END $$;

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

SELECT pg_notify('pgrst','reload schema');
