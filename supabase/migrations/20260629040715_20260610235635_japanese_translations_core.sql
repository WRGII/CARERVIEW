-- Japanese translations: core UI
INSERT INTO public.ui_translations (locale, key, value) VALUES
('ja', 'nav.sign_in', 'サインイン'),
('ja', 'nav.sign_out', 'サインアウト'),
('ja', 'nav.dashboard', 'ダッシュボード'),
('ja', 'nav.observations', '観察記録'),
('ja', 'nav.memory_book', 'メモリーブック'),
('ja', 'nav.care_plan', 'ケアプラン'),
('ja', 'nav.care_hub', 'ケアハブ'),
('ja', 'nav.new_carer', '新しい介護者'),
('ja', 'nav.tutorial', 'チュートリアル'),
('ja', 'common.app_name', 'CarerView'),
('ja', 'common.loading', '読み込み中…'),
('ja', 'common.save', '保存'),
('ja', 'common.saving', '保存中…'),
('ja', 'auth.sign_in', 'サインイン'),
('ja', 'auth.email', 'メールアドレス'),
('ja', 'auth.password', 'パスワード'),
('ja', 'create_account.title', 'アカウントを作成')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();