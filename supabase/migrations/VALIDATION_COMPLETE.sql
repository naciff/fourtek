-- COMPREHENSIVE VALIDATION QUERY
-- Run this to validate the entire setup

-- Step 1: Check Clarissa's user ID
SELECT 'Clarissa User ID:' as check, id, email 
FROM auth.users 
WHERE email = 'clarissa.naciff@gmail.com';

-- Step 2: Check Clarissa's organization membership
SELECT 'Clarissa Orgs:' as check, uo.*, o.name
FROM public.user_organizations uo
JOIN public.organizations o ON o.id = uo.organization_id
WHERE uo.user_id = (SELECT id FROM auth.users WHERE email = 'clarissa.naciff@gmail.com');

-- Step 3: Check if clients have the right organization_id
SELECT 'Sample Clients:' as check, id, corporate_name, organization_id
FROM public.clients
LIMIT 5;

-- Step 4: Check RLS policies on clients
SELECT 'RLS Policies:' as check, policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'clients';

-- Step 5: Check RLS policies on user_organizations (look for recursion)
SELECT 'User Org Policies:' as check, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'user_organizations';

-- Step 6: CRITICAL - Try to manually check if policy would allow access
-- This simulates what happens when Clarissa queries clients
SELECT 'Access Check:' as check,
  c.id,
  c.corporate_name,
  c.organization_id,
  (c.organization_id IN (
    SELECT organization_id 
    FROM public.user_organizations 
    WHERE user_id = '3b865486-4df4-44cc-b87d-c896e9348c54'
  )) as "should_have_access"
FROM public.clients c
LIMIT 5;
