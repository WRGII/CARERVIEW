-- Register Japanese as a supported locale
INSERT INTO public.supported_locales (code, label, is_active, is_default, sort_order)
VALUES ('ja', '日本語', true, false, 8)
ON CONFLICT (code) DO NOTHING;
