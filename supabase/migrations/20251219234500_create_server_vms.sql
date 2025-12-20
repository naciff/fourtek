CREATE TABLE IF NOT EXISTS public.server_vms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE,
    vm_name TEXT NOT NULL,
    ip TEXT,
    os TEXT,
    username TEXT,
    password TEXT,
    description TEXT
);

-- Enable RLS
ALTER TABLE public.server_vms ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Enable all for authenticated users" ON public.server_vms
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
