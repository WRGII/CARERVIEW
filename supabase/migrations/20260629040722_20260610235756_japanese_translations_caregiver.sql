-- Japanese translations: caregiver app
INSERT INTO public.ui_translations (locale, key, value) VALUES
('ja', 'caregiver.new_obs_btn', '新しい観察'),
('ja', 'caregiver.observations_title', '観察記録'),
('ja', 'caregiver.observations_body', '時間の経過とともにケア評価の記録'),
('ja', 'new_obs.title', '新しい観察'),
('ja', 'obs_form.submit_btn', '観察を保存'),
('ja', 'obs_list.error', '観察の読み込みに失敗しました。ページを更新してください。'),
('ja', 'view_obs.title', '観察の詳細'),
('ja', 'team.caring_for', 'ケアの対象者:'),
('ja', 'welcome.title', 'CarerViewへようこそ')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();