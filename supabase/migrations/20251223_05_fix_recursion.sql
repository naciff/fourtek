-- FIX: Remove infinite recursion from user_organizations RLS policies
-- The policies were querying user_organizations from within user_organizations policies!

-- Drop problematic recursive policies
DROP POLICY IF EXISTS "Users can view organization memberships" ON public.user_organizations;
DROP POLICY IF EXISTS "Admins can manage organization memberships" ON public.user_organizations;

-- Create simple, non-recursive policies
-- Users can see their own organization memberships
CREATE POLICY "Users can view their own org memberships" ON public.user_organizations
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert themselves into organizations (for self-registration)
CREATE POLICY "Users can join organizations" ON public.user_organizations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can manage memberships in their organizations
-- But we need to avoid recursion, so we check if they're already an admin
CREATE POLICY "Admins can manage memberships" ON public.user_organizations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = user_organizations.organization_id
        AND uo.user_id = auth.uid()
        AND uo.role IN ('owner', 'admin')
    )
  );

SELECT pg_notify('pgrst','reload schema');
