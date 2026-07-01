-- Seed missing Memory Book translation keys across all 8 locales
INSERT INTO ui_translations (locale, namespace, key, value) VALUES

-- ── role_resident ────────────────────────────────────────────────────────────
('en','common','memory_book.role_resident','Resident'),
('es','common','memory_book.role_resident','Residente'),
('fr','common','memory_book.role_resident','Résident·e'),
('de','common','memory_book.role_resident','Bewohner·in'),
('it','common','memory_book.role_resident','Residente'),
('sv','common','memory_book.role_resident','Boende'),
('fi','common','memory_book.role_resident','Asukas'),
('ja','common','memory_book.role_resident','入居者'),

-- ── role_caregiver ───────────────────────────────────────────────────────────
('en','common','memory_book.role_caregiver','Caregiver'),
('es','common','memory_book.role_caregiver','Cuidador·a'),
('fr','common','memory_book.role_caregiver','Aidant·e'),
('de','common','memory_book.role_caregiver','Pflegeperson'),
('it','common','memory_book.role_caregiver','Caregiver'),
('sv','common','memory_book.role_caregiver','Vårdgivare'),
('fi','common','memory_book.role_caregiver','Hoitaja'),
('ja','common','memory_book.role_caregiver','介護者'),

-- ── viewing_as ───────────────────────────────────────────────────────────────
('en','common','memory_book.viewing_as','Viewing as'),
('es','common','memory_book.viewing_as','Viendo como'),
('fr','common','memory_book.viewing_as','Consultation en tant que'),
('de','common','memory_book.viewing_as','Anzeige als'),
('it','common','memory_book.viewing_as','Visualizzando come'),
('sv','common','memory_book.viewing_as','Visar som'),
('fi','common','memory_book.viewing_as','Katsotaan roolina'),
('ja','common','memory_book.viewing_as','表示中:'),

-- ── print_subtitle ───────────────────────────────────────────────────────────
('en','common','memory_book.print_subtitle','Generate a printable summary'),
('es','common','memory_book.print_subtitle','Generar un resumen imprimible'),
('fr','common','memory_book.print_subtitle','Générer un résumé imprimable'),
('de','common','memory_book.print_subtitle','Druckbare Zusammenfassung erstellen'),
('it','common','memory_book.print_subtitle','Genera un riepilogo stampabile'),
('sv','common','memory_book.print_subtitle','Skapa en utskrivbar sammanfattning'),
('fi','common','memory_book.print_subtitle','Luo tulostettava yhteenveto'),
('ja','common','memory_book.print_subtitle','印刷用サマリーを生成する'),

-- ── tab_overview (add 7 missing locales; ja already exists) ─────────────────
('en','common','memory_book.tab_overview','Overview'),
('es','common','memory_book.tab_overview','Resumen'),
('fr','common','memory_book.tab_overview','Aperçu'),
('de','common','memory_book.tab_overview','Übersicht'),
('it','common','memory_book.tab_overview','Panoramica'),
('sv','common','memory_book.tab_overview','Översikt'),
('fi','common','memory_book.tab_overview','Yleiskatsaus'),

-- ── tab_memory_book (all 8 locales) ─────────────────────────────────────────
('en','common','memory_book.tab_memory_book','Memory Book'),
('es','common','memory_book.tab_memory_book','Libro de Memoria'),
('fr','common','memory_book.tab_memory_book','Livre de Mémoire'),
('de','common','memory_book.tab_memory_book','Erinnerungsbuch'),
('it','common','memory_book.tab_memory_book','Libro dei Ricordi'),
('sv','common','memory_book.tab_memory_book','Minnesbok'),
('fi','common','memory_book.tab_memory_book','Muistikirja'),
('ja','common','memory_book.tab_memory_book','メモリーブック'),

-- ── tab_daily_living (add 7 missing locales; ja already exists) ─────────────
('en','common','memory_book.tab_daily_living','Daily Living'),
('es','common','memory_book.tab_daily_living','Vida Diaria'),
('fr','common','memory_book.tab_daily_living','Vie Quotidienne'),
('de','common','memory_book.tab_daily_living','Alltag'),
('it','common','memory_book.tab_daily_living','Vita Quotidiana'),
('sv','common','memory_book.tab_daily_living','Dagligt Liv'),
('fi','common','memory_book.tab_daily_living','Päivittäinen Elämä'),

-- ── tab_routines (all 8 locales) ────────────────────────────────────────────
('en','common','memory_book.tab_routines','Routines'),
('es','common','memory_book.tab_routines','Rutinas'),
('fr','common','memory_book.tab_routines','Routines'),
('de','common','memory_book.tab_routines','Routinen'),
('it','common','memory_book.tab_routines','Routine'),
('sv','common','memory_book.tab_routines','Rutiner'),
('fi','common','memory_book.tab_routines','Rutiinit'),
('ja','common','memory_book.tab_routines','ルーティン'),

-- ── tab_calendar (all 8 locales) ────────────────────────────────────────────
('en','common','memory_book.tab_calendar','Calendar'),
('es','common','memory_book.tab_calendar','Calendario'),
('fr','common','memory_book.tab_calendar','Calendrier'),
('de','common','memory_book.tab_calendar','Kalender'),
('it','common','memory_book.tab_calendar','Calendario'),
('sv','common','memory_book.tab_calendar','Kalender'),
('fi','common','memory_book.tab_calendar','Kalenteri'),
('ja','common','memory_book.tab_calendar','カレンダー'),

-- ── tab_tasks (all 8 locales) ────────────────────────────────────────────────
('en','common','memory_book.tab_tasks','Tasks'),
('es','common','memory_book.tab_tasks','Tareas'),
('fr','common','memory_book.tab_tasks','Tâches'),
('de','common','memory_book.tab_tasks','Aufgaben'),
('it','common','memory_book.tab_tasks','Attività'),
('sv','common','memory_book.tab_tasks','Uppgifter'),
('fi','common','memory_book.tab_tasks','Tehtävät'),
('ja','common','memory_book.tab_tasks','タスク'),

-- ── tab_observations (all 8 locales) ────────────────────────────────────────
('en','common','memory_book.tab_observations','Observations'),
('es','common','memory_book.tab_observations','Observaciones'),
('fr','common','memory_book.tab_observations','Observations'),
('de','common','memory_book.tab_observations','Beobachtungen'),
('it','common','memory_book.tab_observations','Osservazioni'),
('sv','common','memory_book.tab_observations','Observationer'),
('fi','common','memory_book.tab_observations','Havainnot'),
('ja','common','memory_book.tab_observations','観察記録'),

-- ── tab_change_log (all 8 locales) ──────────────────────────────────────────
('en','common','memory_book.tab_change_log','Change Log'),
('es','common','memory_book.tab_change_log','Registro de Cambios'),
('fr','common','memory_book.tab_change_log','Journal des Modifications'),
('de','common','memory_book.tab_change_log','Änderungsprotokoll'),
('it','common','memory_book.tab_change_log','Registro Modifiche'),
('sv','common','memory_book.tab_change_log','Ändringslogg'),
('fi','common','memory_book.tab_change_log','Muutosloki'),
('ja','common','memory_book.tab_change_log','変更履歴'),

-- ── tab_contacts (add 7 missing locales; ja already exists) ─────────────────
('en','common','memory_book.tab_contacts','Contacts'),
('es','common','memory_book.tab_contacts','Contactos'),
('fr','common','memory_book.tab_contacts','Contacts'),
('de','common','memory_book.tab_contacts','Kontakte'),
('it','common','memory_book.tab_contacts','Contatti'),
('sv','common','memory_book.tab_contacts','Kontakter'),
('fi','common','memory_book.tab_contacts','Yhteystiedot'),

-- ── tab_identity (add 7 missing locales; ja already exists) ─────────────────
('en','common','memory_book.tab_identity','Identity'),
('es','common','memory_book.tab_identity','Identidad'),
('fr','common','memory_book.tab_identity','Identité'),
('de','common','memory_book.tab_identity','Identität'),
('it','common','memory_book.tab_identity','Identità'),
('sv','common','memory_book.tab_identity','Identitet'),
('fi','common','memory_book.tab_identity','Henkilöllisyys'),

-- ── tab_medical (add 7 missing locales; ja already exists) ──────────────────
('en','common','memory_book.tab_medical','Medical'),
('es','common','memory_book.tab_medical','Médico'),
('fr','common','memory_book.tab_medical','Médical'),
('de','common','memory_book.tab_medical','Medizinisch'),
('it','common','memory_book.tab_medical','Medico'),
('sv','common','memory_book.tab_medical','Medicinskt'),
('fi','common','memory_book.tab_medical','Lääketieteellinen'),

-- ── tab_prefs (add 7 missing locales; ja already exists) ────────────────────
('en','common','memory_book.tab_prefs','Preferences'),
('es','common','memory_book.tab_prefs','Preferencias'),
('fr','common','memory_book.tab_prefs','Préférences'),
('de','common','memory_book.tab_prefs','Präferenzen'),
('it','common','memory_book.tab_prefs','Preferenze'),
('sv','common','memory_book.tab_prefs','Preferenser'),
('fi','common','memory_book.tab_prefs','Asetukset'),

-- ── soon_label (all 8 locales) ───────────────────────────────────────────────
('en','common','memory_book.soon_label','Soon'),
('es','common','memory_book.soon_label','Próximamente'),
('fr','common','memory_book.soon_label','Bientôt'),
('de','common','memory_book.soon_label','Demnächst'),
('it','common','memory_book.soon_label','Presto'),
('sv','common','memory_book.soon_label','Snart'),
('fi','common','memory_book.soon_label','Pian'),
('ja','common','memory_book.soon_label','近日公開'),

-- ── overview_medical_summary (all 8 locales) ────────────────────────────────
('en','common','memory_book.overview_medical_summary','Medical Summary'),
('es','common','memory_book.overview_medical_summary','Resumen Médico'),
('fr','common','memory_book.overview_medical_summary','Résumé Médical'),
('de','common','memory_book.overview_medical_summary','Medizinische Zusammenfassung'),
('it','common','memory_book.overview_medical_summary','Riepilogo Medico'),
('sv','common','memory_book.overview_medical_summary','Medicinsk Sammanfattning'),
('fi','common','memory_book.overview_medical_summary','Lääketieteellinen Yhteenveto'),
('ja','common','memory_book.overview_medical_summary','医療サマリー'),

-- ── overview_view_all (all 8 locales) ───────────────────────────────────────
('en','common','memory_book.overview_view_all','View all'),
('es','common','memory_book.overview_view_all','Ver todo'),
('fr','common','memory_book.overview_view_all','Tout voir'),
('de','common','memory_book.overview_view_all','Alle anzeigen'),
('it','common','memory_book.overview_view_all','Vedi tutto'),
('sv','common','memory_book.overview_view_all','Visa alla'),
('fi','common','memory_book.overview_view_all','Näytä kaikki'),
('ja','common','memory_book.overview_view_all','すべて表示'),

-- ── overview_conditions (all 8 locales) ─────────────────────────────────────
('en','common','memory_book.overview_conditions','Conditions'),
('es','common','memory_book.overview_conditions','Condiciones'),
('fr','common','memory_book.overview_conditions','Conditions'),
('de','common','memory_book.overview_conditions','Erkrankungen'),
('it','common','memory_book.overview_conditions','Condizioni'),
('sv','common','memory_book.overview_conditions','Tillstånd'),
('fi','common','memory_book.overview_conditions','Sairaudet'),
('ja','common','memory_book.overview_conditions','疾患'),

-- ── overview_medications (all 8 locales) ────────────────────────────────────
('en','common','memory_book.overview_medications','Medications'),
('es','common','memory_book.overview_medications','Medicamentos'),
('fr','common','memory_book.overview_medications','Médicaments'),
('de','common','memory_book.overview_medications','Medikamente'),
('it','common','memory_book.overview_medications','Farmaci'),
('sv','common','memory_book.overview_medications','Läkemedel'),
('fi','common','memory_book.overview_medications','Lääkkeet'),
('ja','common','memory_book.overview_medications','薬'),

-- ── overview_allergies (all 8 locales) ──────────────────────────────────────
('en','common','memory_book.overview_allergies','Allergies'),
('es','common','memory_book.overview_allergies','Alergias'),
('fr','common','memory_book.overview_allergies','Allergies'),
('de','common','memory_book.overview_allergies','Allergien'),
('it','common','memory_book.overview_allergies','Allergie'),
('sv','common','memory_book.overview_allergies','Allergier'),
('fi','common','memory_book.overview_allergies','Allergiat'),
('ja','common','memory_book.overview_allergies','アレルギー'),

-- ── section_daily_living (all 8 locales) ────────────────────────────────────
('en','common','memory_book.section_daily_living','Daily Living & Preferences'),
('es','common','memory_book.section_daily_living','Vida Diaria y Preferencias'),
('fr','common','memory_book.section_daily_living','Vie Quotidienne et Préférences'),
('de','common','memory_book.section_daily_living','Alltag & Präferenzen'),
('it','common','memory_book.section_daily_living','Vita Quotidiana e Preferenze'),
('sv','common','memory_book.section_daily_living','Dagligt Liv och Preferenser'),
('fi','common','memory_book.section_daily_living','Päivittäinen Elämä ja Asetukset'),
('ja','common','memory_book.section_daily_living','日常生活と好み'),

-- ── patch missing 'ja' for 6 existing keys ───────────────────────────────────
('ja','common','memory_book.overview_coming_title','フェーズ2で追加予定'),
('ja','common','memory_book.overview_coming_desc','日課、食事、行動・安全、日誌、変更履歴はフェーズ2以降に利用可能になります。'),
('ja','common','memory_book.overview_no_summary','まだ個人サマリーが登録されていません。'),
('ja','common','memory_book.overview_no_summary_owner_hint',' メモリーブックタブで追加してください。'),
('ja','common','memory_book.role_owner','オーナー'),
('ja','common','memory_book.role_member','メンバー')

ON CONFLICT (locale, namespace, key) DO NOTHING;
