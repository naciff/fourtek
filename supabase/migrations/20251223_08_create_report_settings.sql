-- Create report_settings table
CREATE TABLE IF NOT EXISTS public.report_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    company_name TEXT,
    company_document TEXT,
    phone TEXT,
    email TEXT,
    address_street TEXT,
    address_number TEXT,
    address_complement TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    logo_url TEXT,
    header_text TEXT,
    footer_text TEXT,
    signatures JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.report_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their organization report settings" ON public.report_settings
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage their organization report settings" ON public.report_settings
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Insert default entry for the main organization if it doesn't exist
INSERT INTO public.report_settings (organization_id, company_name)
SELECT id, 'Fourtek' FROM public.organizations WHERE id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT (organization_id) DO NOTHING;

SELECT pg_notify('pgrst', 'reload schema');
