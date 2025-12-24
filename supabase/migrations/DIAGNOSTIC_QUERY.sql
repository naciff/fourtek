-- DIAGNOSTIC QUERY - Run this to check what's wrong
-- Copy results and send to me

-- 1. Check if organizations table exists and has data
SELECT 'Organizations:' as check_type, * FROM public.organizations LIMIT 5;

-- 2. Check if user_organizations has data
SELECT 'User Organizations:' as check_type, 
  uo.user_id, 
  au.email,
  uo.organization_id,
  o.name as org_name
FROM public.user_organizations uo
JOIN auth.users au ON au.id = uo.user_id
LEFT JOIN public.organizations o ON o.id = uo.organization_id
LIMIT 10;

-- 3. Check if clients have organization_id
SELECT 'Clients with org_id:' as check_type,
  COUNT(*) as total,
  COUNT(organization_id) as with_org_id,
  COUNT(*) - COUNT(organization_id) as without_org_id
FROM public.clients;

-- 4. Sample clients data
SELECT 'Sample Clients:' as check_type,
  id, 
  corporate_name,
  user_id,
  organization_id
FROM public.clients
LIMIT 5;

-- 5. Check RLS policies on clients
SELECT 'RLS Policies on clients:' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'clients';

-- 6. Check current user
SELECT 'Current User:' as check_type,
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email;
