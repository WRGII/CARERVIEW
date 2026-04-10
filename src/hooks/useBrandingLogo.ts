import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

async function fetchLogoUrl(): Promise<string | null> {
  // 1) Try site_settings table (matches existing Footer usage)
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('logo_url')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data?.logo_url) return data.logo_url;
  } catch {
    // ignore, fall through to fallback
  }

  // 2) Final fallback (local asset shipped with app)
  return "/CareView_logo_1_colored_highres.png";
}

export function useBrandingLogo() {
  return useQuery({
    queryKey: ["branding", "logo"],
    queryFn: fetchLogoUrl,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 6, // 6 hours
    retry: 1,
  });
}