-- Japanese translations: care_plan and care_hub
INSERT INTO ui_translations (locale, key, value) VALUES
('ja', 'care_plan_gaps.auth_health_decisions', '健康決定権限'),
('ja', 'care_plan_gaps.auth_financial_authority', '財務権限'),
('ja', 'care_plan_gaps.resp_household', '家事支援'),
('ja', 'care_plan_gaps.resp_personal_care', '個人介護と移動'),
('ja', 'care_plan_gaps.resp_emotional', '精神的支援'),
('ja', 'care_hub.builder_title', 'ケアプラン'),
('ja', 'care_hub.builder_subtitle', 'チームを調整する'),
('ja', 'care_hub.page_title', 'ケアハブ'),
('ja', 'care_hub.all_sections_complete', 'すべてのセクションが完成しており、ギャップは特定されていません。'),
('ja', 'care_hub.tool_memory_book_title', 'メモリーブック')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();