-- CareView — FINAL RLS & POLICY MIGRATION (matches current state; Postgres 14)
BEGIN;

-- Enable RLS on the relevant tables
ALTER TABLE "public"."access_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."categories"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."legend"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."observations"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."questions"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."responses"     ENABLE ROW LEVEL SECURITY;

-- =========================
-- public.access_tokens
-- =========================

-- INSERT: only WITH CHECK (no USING)
DROP POLICY IF EXISTS "access_tokens_admin_insert" ON "public"."access_tokens";
CREATE POLICY "access_tokens_admin_insert" ON "public"."access_tokens"
  FOR INSERT TO PUBLIC
  WITH CHECK ((app.get_current_role() = 'admin'::text));

-- SELECT: USING only
DROP POLICY IF EXISTS "access_tokens_admin_select" ON "public"."access_tokens";
CREATE POLICY "access_tokens_admin_select" ON "public"."access_tokens"
  FOR SELECT TO PUBLIC
  USING ((app.get_current_role() = 'admin'::text));

-- UPDATE: USING + WITH CHECK
DROP POLICY IF EXISTS "access_tokens_admin_update" ON "public"."access_tokens";
CREATE POLICY "access_tokens_admin_update" ON "public"."access_tokens"
  FOR UPDATE TO PUBLIC
  USING ((app.get_current_role() = 'admin'::text))
  WITH CHECK ((app.get_current_role() = 'admin'::text));

-- DELETE: USING only (deny all)
DROP POLICY IF EXISTS "access_tokens_no_delete" ON "public"."access_tokens";
CREATE POLICY "access_tokens_no_delete" ON "public"."access_tokens"
  FOR DELETE TO PUBLIC
  USING (false);

-- SELECT: allow validate flow when the feature flag is ON
DROP POLICY IF EXISTS "access_tokens_validate_select" ON "public"."access_tokens";
CREATE POLICY "access_tokens_validate_select" ON "public"."access_tokens"
  FOR SELECT TO PUBLIC
  USING ( current_setting('app.allow_validate', true) = 'on' );

-- =========================
-- public.categories
-- =========================
DROP POLICY IF EXISTS "categories_admin_select" ON "public"."categories";
CREATE POLICY "categories_admin_select" ON "public"."categories"
  FOR SELECT TO PUBLIC
  USING ((app.get_current_role() = 'admin'::text));

-- =========================
-- public.legend
-- =========================
DROP POLICY IF EXISTS "legend_admin_select" ON "public"."legend";
CREATE POLICY "legend_admin_select" ON "public"."legend"
  FOR SELECT TO PUBLIC
  USING ((app.get_current_role" = 'admin'::text));

-- =========================
-- public.observations
-- =========================
DROP POLICY IF EXISTS "observations_admin_select" ON "public"."observations";
CREATE POLICY "observations_admin_select" ON "public"."observations"
  FOR SELECT TO PUBLIC
  USING ((app.get_current_role() = 'admin'::text));

-- =========================
-- public.questions
-- =========================
DROP POLICY IF EXISTS "questions_admin_select" ON "public"."questions";
CREATE POLICY "questions_admin_select" ON "public"."questions"
  FOR SELECT TO PUBLIC
  USING ((app.get_current_role() = 'admin'::text));

-- =========================
-- public.responses
-- =========================
DROP POLICY IF EXISTS "responses_admin_select" ON "public"."responses";
CREATE POLICY "responses_admin_select" ON "public"."responses"
  FOR SELECT TO PUBLIC
  USING ((app.get_current_role() = 'admin'::text));

COMMIT;
chore(db): add final RLS & policy migration
