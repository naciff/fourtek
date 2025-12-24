-- Migration 1: Create Organizations tables
-- This enables multi-tenant architecture where multiple users share data within the same organization

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user-organization relationship (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_organizations (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, organization_id)
);

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- RLS policies for organizations
CREATE POLICY "Users can view their organizations" ON public.organizations
  FOR SELECT
  USING (
    id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update their organizations" ON public.organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM public.user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS policies for user_organizations
CREATE POLICY "Users can view organization memberships" ON public.user_organizations
  FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage organization memberships" ON public.user_organizations
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS organizations_slug_idx ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS user_organizations_user_idx ON public.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS user_organizations_org_idx ON public.user_organizations(organization_id);

-- Insert default organization "Fourtek"
INSERT INTO public.organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Fourtek', 'fourtek')
ON CONFLICT (slug) DO NOTHING;

-- Link all existing auth users to the default organization as admins
INSERT INTO public.user_organizations (user_id, organization_id, role)
SELECT id, '00000000-0000-0000-0000-000000000001', 'admin'
FROM auth.users
ON CONFLICT DO NOTHING;

SELECT pg_notify('pgrst','reload schema');
