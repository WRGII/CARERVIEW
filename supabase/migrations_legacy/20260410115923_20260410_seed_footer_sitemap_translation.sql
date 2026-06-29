/*
  # Seed footer.sitemap translation key for all locales

  ## Summary
  Adds the footer.sitemap key which was previously hardcoded in Footer.tsx.
  Now the sitemap link label is translatable across all 7 supported locales.
*/

INSERT INTO ui_translations (key, locale, value) VALUES
('footer.sitemap', 'en', 'Sitemap'),
('footer.sitemap', 'es', 'Mapa del sitio'),
('footer.sitemap', 'it', 'Mappa del sito'),
('footer.sitemap', 'fr', 'Plan du site'),
('footer.sitemap', 'de', 'Seitenstruktur'),
('footer.sitemap', 'sv', 'Webbplatskarta'),
('footer.sitemap', 'fi', 'Sivukartta')
ON CONFLICT (key, locale) DO NOTHING;
