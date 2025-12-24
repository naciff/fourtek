-- Migration 3: Update RLS policies to use organization-based access (SAFE VERSION)
-- This allows multiple users in the same organization to share data
-- Only affects tables that actually exist

DO $$
BEGIN
  -- ============================================================================
  -- CLIENTS
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    DROP POLICY IF EXISTS "Clientes visíveis para o dono" ON public.clients;
    DROP POLICY IF EXISTS "Inserir clientes como dono" ON public.clients;
    DROP POLICY IF EXISTS "Atualizar clientes do dono" ON public.clients;
    DROP POLICY IF EXISTS "Excluir clientes do dono" ON public.clients;
    
    EXECUTE 'CREATE POLICY "Clients org access" ON public.clients
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- CONTRACTS
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contracts') THEN
    DROP POLICY IF EXISTS "Contratos visíveis para o dono" ON public.contracts;
    DROP POLICY IF EXISTS "Inserir contratos como dono" ON public.contracts;
    DROP POLICY IF EXISTS "Atualizar contratos do dono" ON public.contracts;
    DROP POLICY IF EXISTS "Excluir contratos do dono" ON public.contracts;
    
    EXECUTE 'CREATE POLICY "Contracts org access" ON public.contracts
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- REPRESENTATIVES
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'representatives') THEN
    DROP POLICY IF EXISTS "Representantes visíveis para o dono" ON public.representatives;
    DROP POLICY IF EXISTS "Inserir representantes como dono" ON public.representatives;
    DROP POLICY IF EXISTS "Atualizar representantes do dono" ON public.representatives;
    DROP POLICY IF EXISTS "Excluir representantes do dono" ON public.representatives;
    
    EXECUTE 'CREATE POLICY "Representatives org access" ON public.representatives
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- CLIENT_CONTACTS
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_contacts') THEN
    DROP POLICY IF EXISTS "Contatos visíveis para dono" ON public.client_contacts;
    DROP POLICY IF EXISTS "Inserir contato como dono" ON public.client_contacts;
    DROP POLICY IF EXISTS "Atualizar contato do dono" ON public.client_contacts;
    DROP POLICY IF EXISTS "Excluir contato do dono" ON public.client_contacts;
    
    EXECUTE 'CREATE POLICY "Client contacts org access" ON public.client_contacts
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- CLIENT_REPRESENTATIVES
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_representatives') THEN
    DROP POLICY IF EXISTS "Vínculos visíveis para o dono" ON public.client_representatives;
    DROP POLICY IF EXISTS "Inserir vínculos como dono" ON public.client_representatives;
    DROP POLICY IF EXISTS "Excluir vínculos do dono" ON public.client_representatives;
    DROP POLICY IF EXISTS "Vínculo representante visível" ON public.client_representatives;
    DROP POLICY IF EXISTS "Vínculo representante inserir" ON public.client_representatives;
    DROP POLICY IF EXISTS "Vínculo representante excluir" ON public.client_representatives;
    
    EXECUTE 'CREATE POLICY "Client representatives org access" ON public.client_representatives
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- CLIENT_SERVICES
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_services') THEN
    DROP POLICY IF EXISTS "Cliente-Serviço visível para o dono" ON public.client_services;
    DROP POLICY IF EXISTS "Inserir Cliente-Serviço como dono" ON public.client_services;
    DROP POLICY IF EXISTS "Excluir Cliente-Serviço do dono" ON public.client_services;
    
    EXECUTE 'CREATE POLICY "Client services org access" ON public.client_services
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- CONTRACT_ITEMS
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contract_items') THEN
    DROP POLICY IF EXISTS "Itens visíveis para dono do contrato" ON public.contract_items;
    DROP POLICY IF EXISTS "Inserir itens com contrato do dono" ON public.contract_items;
    DROP POLICY IF EXISTS "Atualizar itens do contrato do dono" ON public.contract_items;
    DROP POLICY IF EXISTS "Excluir itens do contrato do dono" ON public.contract_items;
    
    EXECUTE 'CREATE POLICY "Contract items org access" ON public.contract_items
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- DIRETORIA
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'diretoria') THEN
    DROP POLICY IF EXISTS "Diretoria visível para o dono" ON public.diretoria;
    DROP POLICY IF EXISTS "Inserir diretoria como dono" ON public.diretoria;
    DROP POLICY IF EXISTS "Atualizar diretoria do dono" ON public.diretoria;
    DROP POLICY IF EXISTS "Excluir diretoria do dono" ON public.diretoria;
    
    EXECUTE 'CREATE POLICY "Diretoria org access" ON public.diretoria
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- INVENTARIO
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventario') THEN
    DROP POLICY IF EXISTS "Inventário visível para o dono" ON public.inventario;
    DROP POLICY IF EXISTS "Inventário visível sem dono" ON public.inventario;
    DROP POLICY IF EXISTS "Inserir inventário como dono" ON public.inventario;
    DROP POLICY IF EXISTS "Atualizar inventário do dono" ON public.inventario;
    DROP POLICY IF EXISTS "Atualizar inventário sem dono" ON public.inventario;
    DROP POLICY IF EXISTS "Excluir inventário do dono" ON public.inventario;
    
    EXECUTE 'CREATE POLICY "Inventario org access" ON public.inventario
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- GESTAO
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gestao') THEN
    DROP POLICY IF EXISTS "Gestao visível para dono" ON public.gestao;
    DROP POLICY IF EXISTS "Gestao inserir dono" ON public.gestao;
    DROP POLICY IF EXISTS "Gestao atualizar dono" ON public.gestao;
    DROP POLICY IF EXISTS "Gestao excluir dono" ON public.gestao;
    
    EXECUTE 'CREATE POLICY "Gestao org access" ON public.gestao
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- PARCEIROS
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parceiros') THEN
    DROP POLICY IF EXISTS "Parceiros visível para dono" ON public.parceiros;
    DROP POLICY IF EXISTS "Parceiros inserir dono" ON public.parceiros;
    DROP POLICY IF EXISTS "Parceiros atualizar dono" ON public.parceiros;
    DROP POLICY IF EXISTS "Parceiros excluir dono" ON public.parceiros;
    
    EXECUTE 'CREATE POLICY "Parceiros org access" ON public.parceiros
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- FORNECEDORES
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fornecedores') THEN
    DROP POLICY IF EXISTS "Fornecedores visível para dono" ON public.fornecedores;
    DROP POLICY IF EXISTS "Fornecedores inserir dono" ON public.fornecedores;
    DROP POLICY IF EXISTS "Fornecedores atualizar dono" ON public.fornecedores;
    DROP POLICY IF EXISTS "Fornecedores excluir dono" ON public.fornecedores;
    
    EXECUTE 'CREATE POLICY "Fornecedores org access" ON public.fornecedores
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- ============================================================================
  -- COLABORADORES
  -- ============================================================================
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'colaboradores') THEN
    DROP POLICY IF EXISTS "Colaboradores visível para dono" ON public.colaboradores;
    DROP POLICY IF EXISTS "Colaboradores inserir dono" ON public.colaboradores;
    DROP POLICY IF EXISTS "Colaboradores atualizar dono" ON public.colaboradores;
    DROP POLICY IF EXISTS "Colaboradores excluir dono" ON public.colaboradores;
    
    EXECUTE 'CREATE POLICY "Colaboradores org access" ON public.colaboradores
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

END $$;

SELECT pg_notify('pgrst','reload schema');
