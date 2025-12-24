-- Create integration_settings table
CREATE TABLE IF NOT EXISTS public.integration_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    whatsapp_api_key TEXT,
    whatsapp_instance TEXT,
    smtp_host TEXT,
    smtp_port TEXT,
    smtp_user TEXT,
    smtp_pass TEXT,
    smtp_from TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their organization integration settings" ON public.integration_settings
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage their organization integration settings" ON public.integration_settings
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Insert default entry for the main organization if it doesn't exist
INSERT INTO public.integration_settings (organization_id)
SELECT id FROM public.organizations WHERE id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT (organization_id) DO NOTHING;

SELECT pg_notify('pgrst', 'reload schema');
