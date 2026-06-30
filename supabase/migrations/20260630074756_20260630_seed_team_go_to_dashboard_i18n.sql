INSERT INTO public.ui_translations (locale, namespace, key, value)
VALUES
  ('en', 'common', 'team.go_to_dashboard', 'Go to Dashboard'),
  ('es', 'common', 'team.go_to_dashboard', 'Ir al panel'),
  ('fr', 'common', 'team.go_to_dashboard', 'Aller au tableau de bord'),
  ('de', 'common', 'team.go_to_dashboard', 'Zum Dashboard'),
  ('it', 'common', 'team.go_to_dashboard', 'Vai alla dashboard'),
  ('sv', 'common', 'team.go_to_dashboard', 'Gå till instrumentpanelen'),
  ('fi', 'common', 'team.go_to_dashboard', 'Siirry kojelautaan'),
  ('ja', 'common', 'team.go_to_dashboard', 'ダッシュボードへ')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;
