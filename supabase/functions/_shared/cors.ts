const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "";

export function getAllowedOrigin(req: Request): string {
  const incoming = req.headers.get("origin") || "";
  if (!PUBLIC_SITE_URL) return incoming || "*";
  if (incoming === PUBLIC_SITE_URL) return incoming;
  const host = incoming.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const siteHost = PUBLIC_SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const bare = siteHost.replace(/^www\./, "");
  if (host === bare || host === `www.${bare}`) return incoming;
  return PUBLIC_SITE_URL;
}

export function corsHeaders(req: Request, methods = "POST, OPTIONS"): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": getAllowedOrigin(req),
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };
}

export function json(body: unknown, status: number, req: Request, methods?: string) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req, methods) });
}

export function preflight(req: Request, methods = "POST, OPTIONS") {
  return new Response(null, { status: 200, headers: corsHeaders(req, methods) });
}
