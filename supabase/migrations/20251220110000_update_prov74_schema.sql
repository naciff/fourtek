-- Migration to update/create prov74_checklist table to support history/events
-- We will store the checked items as a JSONB array/object to keep it flexible
-- and allow for the "snapshot" nature of the report.

CREATE TABLE IF NOT EXISTS public.prov74_checklist (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id uuid, -- who performed the check
    situacao text CHECK (situacao IN ('Realizado', 'Agendado')),
    data_hora timestamp with time zone,
    observacao text,
    imagem_url text,
    itens jsonb, -- Stores the list of checked items e.g. ["nobreak", "antivirus"]
    created_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.prov74_checklist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Prov74 visible for owner" ON public.prov74_checklist;
CREATE POLICY "Prov74 visible for owner" ON public.prov74_checklist FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Prov74 insert for owner" ON public.prov74_checklist;
CREATE POLICY "Prov74 insert for owner" ON public.prov74_checklist FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Prov74 update for owner" ON public.prov74_checklist;
CREATE POLICY "Prov74 update for owner" ON public.prov74_checklist FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Prov74 delete for owner" ON public.prov74_checklist;
CREATE POLICY "Prov74 delete for owner" ON public.prov74_checklist FOR DELETE USING (auth.uid() = user_id);

-- Notify for realtime
SELECT pg_notify('pgrst', 'reload schema');
