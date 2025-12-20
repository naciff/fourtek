-- Create the servers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.servers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    hostname TEXT,
    ip_address TEXT,
    os TEXT,
    username TEXT,
    password TEXT,
    description TEXT
);

-- Enable RLS (optional but recommended, matching other tables likely)
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access for authenticated users (simplified for this context)
-- Adjust based on actual RLS requirements
CREATE POLICY "Enable all for authenticated users" ON public.servers
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add dynamic fields (if table already existed without them)
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS external_link TEXT;
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS equipment_model TEXT;
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS disk_qty TEXT;
ALTER TABLE public.servers ADD COLUMN IF NOT EXISTS disk_size TEXT;
