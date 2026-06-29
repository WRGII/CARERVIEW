
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
('en', 'common', 'footer.sitemap', 'Sitemap'),
('es', 'common', 'footer.sitemap', 'Mapa del sitio'),
('it', 'common', 'footer.sitemap', 'Mappa del sito'),
('fr', 'common', 'footer.sitemap', 'Plan du site'),
('de', 'common', 'footer.sitemap', 'Seitenstruktur'),
('sv', 'common', 'footer.sitemap', 'Webbplatskarta'),
('fi', 'common', 'footer.sitemap', 'Sivukartta')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
