-- Migration 2: Add organization_id to all existing tables (SAFE VERSION)
-- This links all data records to their respective organizations
-- Only affects tables that actually exist

-- Add organization_id column to tables (IF EXISTS)
DO $$
BEGIN
  -- Clients
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS clients_org_idx ON public.clients(organization_id);
    UPDATE public.clients SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Contracts
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contracts') THEN
    ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS contracts_org_idx ON public.contracts(organization_id);
    UPDATE public.contracts SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Representatives
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'representatives') THEN
    ALTER TABLE public.representatives ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS representatives_org_idx ON public.representatives(organization_id);
    UPDATE public.representatives SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Client Contacts
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_contacts') THEN
    ALTER TABLE public.client_contacts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS client_contacts_org_idx ON public.client_contacts(organization_id);
    UPDATE public.client_contacts SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Client Representatives
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_representatives') THEN
    ALTER TABLE public.client_representatives ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS client_representatives_org_idx ON public.client_representatives(organization_id);
    UPDATE public.client_representatives SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Client Services
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_services') THEN
    ALTER TABLE public.client_services ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS client_services_org_idx ON public.client_services(organization_id);
    UPDATE public.client_services SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Contract Items
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contract_items') THEN
    ALTER TABLE public.contract_items ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS contract_items_org_idx ON public.contract_items(organization_id);
    UPDATE public.contract_items SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Diretoria
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'diretoria') THEN
    ALTER TABLE public.diretoria ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS diretoria_org_idx ON public.diretoria(organization_id);
    UPDATE public.diretoria SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Empresa (may not exist)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'empresa') THEN
    ALTER TABLE public.empresa ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS empresa_org_idx ON public.empresa(organization_id);
    UPDATE public.empresa SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Inventario
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventario') THEN
    ALTER TABLE public.inventario ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS inventario_org_idx ON public.inventario(organization_id);
    UPDATE public.inventario SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Gestao
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gestao') THEN
    ALTER TABLE public.gestao ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS gestao_org_idx ON public.gestao(organization_id);
    UPDATE public.gestao SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Parceiros
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parceiros') THEN
    ALTER TABLE public.parceiros ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS parceiros_org_idx ON public.parceiros(organization_id);
    UPDATE public.parceiros SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Fornecedores
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fornecedores') THEN
    ALTER TABLE public.fornecedores ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS fornecedores_org_idx ON public.fornecedores(organization_id);
    UPDATE public.fornecedores SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

  -- Colaboradores
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'colaboradores') THEN
    ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
    CREATE INDEX IF NOT EXISTS colaboradores_org_idx ON public.colaboradores(organization_id);
    UPDATE public.colaboradores SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
  END IF;

END $$;

SELECT pg_notify('pgrst','reload schema');
