-- Create client_reports table
CREATE TABLE IF NOT EXISTS public.client_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id uuid,
    type text NOT NULL,
    report_date date,
    version text,
    file_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports visible for owner" ON public.client_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Reports insert for owner" ON public.client_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reports update for owner" ON public.client_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Reports delete for owner" ON public.client_reports FOR DELETE USING (auth.uid() = user_id);

-- Notify
SELECT pg_notify('pgrst', 'reload schema');
