import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

interface LogEmailParams {
  recipientHash: string;
  templateName: string;
  subject: string;
  status: "sent" | "failed";
  resendMessageId?: string;
  errorMessage?: string;
  edgeFunction: string;
}

export async function logEmail(params: LogEmailParams): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const srv = createClient(supabaseUrl, serviceRoleKey);

    await srv.from("email_audit_log").insert({
      recipient_hash: params.recipientHash,
      template_name: params.templateName,
      subject: params.subject,
      status: params.status,
      resend_message_id: params.resendMessageId ?? null,
      error_message: params.errorMessage ?? null,
      edge_function: params.edgeFunction,
    });
  } catch (err: unknown) {
    // Never let logging failures propagate to callers
    console.error("emailLogger: failed to insert audit row:", err instanceof Error ? err.message : err);
  }
}
