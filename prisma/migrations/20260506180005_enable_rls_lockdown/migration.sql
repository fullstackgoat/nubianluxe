-- Lock down public tables behind Row Level Security.
-- The Prisma client connects as the `postgres` role, which BYPASSES RLS,
-- so application queries are unaffected. With RLS enabled and zero policies,
-- the public anon and authenticated roles (used by the Supabase JS client)
-- are denied all access — protecting against leaked NEXT_PUBLIC_SUPABASE_ANON_KEY.
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BlockedDate" ENABLE ROW LEVEL SECURITY;
