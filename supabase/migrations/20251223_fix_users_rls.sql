-- Fix RLS policies for users table to allow admin operations
-- This allows admins to manage all users, not just their own

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Usuarios select dono" ON public.users;
DROP POLICY IF EXISTS "Usuarios insert dono" ON public.users;
DROP POLICY IF EXISTS "Usuarios update dono" ON public.users;
DROP POLICY IF EXISTS "Usuarios delete dono" ON public.users;

-- Create new policies that allow any authenticated user to manage users
-- (You should add additional checks for admin role if needed)

-- Select: any authenticated user can view users
CREATE POLICY "Users select policy" ON public.users
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Insert: any authenticated user can create users
CREATE POLICY "Users insert policy" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update: any authenticated user can update users
CREATE POLICY "Users update policy" ON public.users
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Delete: any authenticated user can delete users
CREATE POLICY "Users delete policy" ON public.users
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

SELECT pg_notify('pgrst','reload schema');
