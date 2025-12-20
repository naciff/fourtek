-- FIX Migration: Force recreation of prov74_checklist to ensure schema matches UI
-- This handles the case where the table existed with a different structure
-- and the previous "IF NOT EXISTS" migration didn't update it.

DROP TABLE IF EXISTS public.prov74_checklist;

CREATE TABLE public.prov74_checklist (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id uuid,
    situacao text, -- 'Realizado' or 'Agendado'
    data_hora timestamp with time zone,
    observacao text,
    imagem_url text,
    itens jsonb, -- Stores the list of checked items e.g. ["nobreak", "antivirus"]
    created_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.prov74_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prov74 visible for owner" ON public.prov74_checklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Prov74 insert for owner" ON public.prov74_checklist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Prov74 update for owner" ON public.prov74_checklist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Prov74 delete for owner" ON public.prov74_checklist FOR DELETE USING (auth.uid() = user_id);

-- Notify
SELECT pg_notify('pgrst', 'reload schema');
