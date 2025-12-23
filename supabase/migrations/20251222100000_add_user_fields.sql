-- Rename table usuarios to users if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usuarios') THEN
    ALTER TABLE IF EXISTS "public"."usuarios" RENAME TO "users";
  END IF;
END $$;

-- Add last_login and phone columns to users table
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMPTZ;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
