-- Create client_pcn table
CREATE TABLE IF NOT EXISTS public.client_pcn (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id uuid,
    description text,
    version text,
    file_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.client_pcn ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PCN visible for owner" ON public.client_pcn FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "PCN insert for owner" ON public.client_pcn FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "PCN update for owner" ON public.client_pcn FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "PCN delete for owner" ON public.client_pcn FOR DELETE USING (auth.uid() = user_id);

-- Notify
SELECT pg_notify('pgrst', 'reload schema');
