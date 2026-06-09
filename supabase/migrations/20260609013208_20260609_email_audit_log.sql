-- Email audit log: records every email send attempt from edge functions
CREATE TABLE IF NOT EXISTS public.email_audit_log (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_hash    text        NOT NULL,
  template_name     text        NOT NULL,
  subject           text        NOT NULL,
  status            text        NOT NULL CHECK (status IN ('sent', 'failed')),
  resend_message_id text,
  error_message     text,
  edge_function     text        NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_audit_log' AND policyname = 'eal_service_role_all'
  ) THEN
    CREATE POLICY "eal_service_role_all" ON public.email_audit_log
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Admins (role = 'admin' in profiles) can read audit logs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_audit_log' AND policyname = 'eal_admin_select'
  ) THEN
    CREATE POLICY "eal_admin_select" ON public.email_audit_log
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_audit_log_created_at ON public.email_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_audit_log_template ON public.email_audit_log (template_name);
CREATE INDEX IF NOT EXISTS idx_email_audit_log_status ON public.email_audit_log (status);
