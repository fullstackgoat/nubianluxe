-- Enable Row Level Security on the Prisma migrations metadata table.
-- This table is auto-created by Prisma and was previously left without RLS,
-- meaning anyone with the NEXT_PUBLIC_SUPABASE_ANON_KEY could read/modify
-- migration history via PostgREST.
--
-- Prisma itself connects as the `postgres` role, which BYPASSES RLS, so
-- migration tracking continues to work normally. With RLS enabled and no
-- policies, the anon and authenticated roles are denied all access.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
