-- FIX: Add WITH CHECK to RLS policies
-- The policies were missing WITH CHECK clause which is needed for INSERT/UPDATE

DO $$
BEGIN
  -- CLIENTS
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    DROP POLICY IF EXISTS "Clients org access" ON public.clients;
    
    EXECUTE 'CREATE POLICY "Clients org access" ON public.clients
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- CONTRACTS  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contracts') THEN
    DROP POLICY IF EXISTS "Contracts org access" ON public.contracts;
    
    EXECUTE 'CREATE POLICY "Contracts org access" ON public.contracts
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

  -- REPRESENTATIVES
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'representatives') THEN
    DROP POLICY IF EXISTS "Representatives org access" ON public.representatives;
    
    EXECUTE 'CREATE POLICY "Representatives org access" ON public.representatives
      FOR ALL
      USING (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        organization_id IN (
          SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
        )
      )';
  END IF;

END $$;

SELECT pg_notify('pgrst','reload schema');
