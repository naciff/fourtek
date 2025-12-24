-- SIMPLEST POSSIBLE RLS - NO RECURSION
-- This removes ALL complexity and makes user_organizations completely open
-- Then we can add back complexity later if needed

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own org memberships" ON public.user_organizations;
DROP POLICY IF EXISTS "Users can join organizations" ON public.user_organizations;
DROP POLICY IF EXISTS "Admins can manage memberships" ON public.user_organizations;
DROP POLICY IF EXISTS "Users can view organization memberships" ON public.user_organizations;
DROP POLICY IF EXISTS "Admins can manage organization memberships" ON public.user_organizations;

-- Create the SIMPLEST possible policy - any authenticated user can read
CREATE POLICY "Anyone authenticated can view" ON public.user_organizations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- For insert/update/delete, only allow if user_id matches (prevents users from modifying others)
CREATE POLICY "Users manage own memberships" ON public.user_organizations
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

SELECT pg_notify('pgrst','reload schema');
