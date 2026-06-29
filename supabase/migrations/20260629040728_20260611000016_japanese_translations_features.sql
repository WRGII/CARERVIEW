-- Japanese translations: features
INSERT INTO public.ui_translations (locale, key, value) VALUES
('ja', 'memory_book.title', 'メモリーブック'),
('ja', 'memory_book.tab_overview', '概要'),
('ja', 'memory_book.tab_identity', 'アイデンティティ'),
('ja', 'memory_book.tab_contacts', '連絡先'),
('ja', 'memory_book.tab_medical', '医療'),
('ja', 'memory_book.section_contacts', 'ケアネットワークと連絡先'),
('ja', 'memory_book.section_medical', '医療情報'),
('ja', 'memory_book.contacts_title', '連絡先'),
('ja', 'memory_book.medical_title', '医療情報'),
('ja', 'memory_book.prefs_title', '好みと快適さ')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();