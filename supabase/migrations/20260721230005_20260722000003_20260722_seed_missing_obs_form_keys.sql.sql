-- Seed missing obs_form.* keys across all 8 locales
-- These keys are referenced in ObservationForm.tsx but were never seeded

INSERT INTO ui_translations (locale, namespace, key, value)
VALUES
  -- obs_form.save_error
  ('en', 'obs_form', 'save_error', 'Failed to save. Please try again.'),
  ('es', 'obs_form', 'save_error', 'Error al guardar. Inténtalo de nuevo.'),
  ('fr', 'obs_form', 'save_error', 'Échec de l''enregistrement. Veuillez réessayer.'),
  ('de', 'obs_form', 'save_error', 'Speichern fehlgeschlagen. Bitte erneut versuchen.'),
  ('it', 'obs_form', 'save_error', 'Salvataggio non riuscito. Riprova.'),
  ('sv', 'obs_form', 'save_error', 'Kunde inte spara. Försök igen.'),
  ('fi', 'obs_form', 'save_error', 'Tallennus epäonnistui. Yritä uudelleen.'),
  ('ja', 'obs_form', 'save_error', '保存に失敗しました。もう一度お試しください。'),

  -- obs_form.error_loading
  ('en', 'obs_form', 'error_loading', 'Could not load questions. Please try again.'),
  ('es', 'obs_form', 'error_loading', 'No se pudieron cargar las preguntas. Inténtalo de nuevo.'),
  ('fr', 'obs_form', 'error_loading', 'Impossible de charger les questions. Veuillez réessayer.'),
  ('de', 'obs_form', 'error_loading', 'Fragen konnten nicht geladen werden. Bitte erneut versuchen.'),
  ('it', 'obs_form', 'error_loading', 'Impossibile caricare le domande. Riprova.'),
  ('sv', 'obs_form', 'error_loading', 'Kunde inte läsa in frågor. Försök igen.'),
  ('fi', 'obs_form', 'error_loading', 'Kysymyksiä ei voitu ladata. Yritä uudelleen.'),
  ('ja', 'obs_form', 'error_loading', '質問を読み込めませんでした。もう一度お試しください。'),

  -- obs_form.contact_support
  ('en', 'obs_form', 'contact_support', 'If this persists, contact support.'),
  ('es', 'obs_form', 'contact_support', 'Si el problema persiste, contacta con soporte.'),
  ('fr', 'obs_form', 'contact_support', 'Si le problème persiste, contactez le support.'),
  ('de', 'obs_form', 'contact_support', 'Wenn das Problem weiterhin besteht, wenden Sie sich an den Support.'),
  ('it', 'obs_form', 'contact_support', 'Se il problema persiste, contatta l''assistenza.'),
  ('sv', 'obs_form', 'contact_support', 'Om problemet kvarstår, kontakta supporten.'),
  ('fi', 'obs_form', 'contact_support', 'Jos ongelma jatkuu, ota yhteyttä tukeen.'),
  ('ja', 'obs_form', 'contact_support', '問題が解決しない場合は、サポートにお問い合わせください。'),

  -- obs_form.guidance_bold
  ('en', 'obs_form', 'guidance_bold', 'How to use this form'),
  ('es', 'obs_form', 'guidance_bold', 'Cómo usar este formulario'),
  ('fr', 'obs_form', 'guidance_bold', 'Comment utiliser ce formulaire'),
  ('de', 'obs_form', 'guidance_bold', 'So verwenden Sie dieses Formular'),
  ('it', 'obs_form', 'guidance_bold', 'Come usare questo modulo'),
  ('sv', 'obs_form', 'guidance_bold', 'Så använder du formuläret'),
  ('fi', 'obs_form', 'guidance_bold', 'Näin käytät lomaketta'),
  ('ja', 'obs_form', 'guidance_bold', 'このフォームの使い方'),

  -- obs_form.saving
  ('en', 'obs_form', 'saving', 'Saving…'),
  ('es', 'obs_form', 'saving', 'Guardando…'),
  ('fr', 'obs_form', 'saving', 'Enregistrement…'),
  ('de', 'obs_form', 'saving', 'Speichern…'),
  ('it', 'obs_form', 'saving', 'Salvataggio…'),
  ('sv', 'obs_form', 'saving', 'Sparar…'),
  ('fi', 'obs_form', 'saving', 'Tallennetaan…'),
  ('ja', 'obs_form', 'saving', '保存中…'),

  -- obs_form.saved
  ('en', 'obs_form', 'saved', 'Saved'),
  ('es', 'obs_form', 'saved', 'Guardado'),
  ('fr', 'obs_form', 'saved', 'Enregistré'),
  ('de', 'obs_form', 'saved', 'Gespeichert'),
  ('it', 'obs_form', 'saved', 'Salvato'),
  ('sv', 'obs_form', 'saved', 'Sparat'),
  ('fi', 'obs_form', 'saved', 'Tallennettu'),
  ('ja', 'obs_form', 'saved', '保存済み'),

  -- obs_form.save_failed
  ('en', 'obs_form', 'save_failed', 'Save failed'),
  ('es', 'obs_form', 'save_failed', 'Error al guardar'),
  ('fr', 'obs_form', 'save_failed', 'Échec de l''enregistrement'),
  ('de', 'obs_form', 'save_failed', 'Speichern fehlgeschlagen'),
  ('it', 'obs_form', 'save_failed', 'Salvataggio non riuscito'),
  ('sv', 'obs_form', 'save_failed', 'Kunde inte spara'),
  ('fi', 'obs_form', 'save_failed', 'Tallennus epäonnistui'),
  ('ja', 'obs_form', 'save_failed', '保存に失敗'),

  -- obs_form.resident_label
  ('en', 'obs_form', 'resident_label', 'Resident'),
  ('es', 'obs_form', 'resident_label', 'Residente'),
  ('fr', 'obs_form', 'resident_label', 'Résident'),
  ('de', 'obs_form', 'resident_label', 'Bewohner'),
  ('it', 'obs_form', 'resident_label', 'Residente'),
  ('sv', 'obs_form', 'resident_label', 'Boende'),
  ('fi', 'obs_form', 'resident_label', 'Asukas'),
  ('ja', 'obs_form', 'resident_label', '入居者'),

  -- obs_form.resident_placeholder
  ('en', 'obs_form', 'resident_placeholder', 'Enter their name'),
  ('es', 'obs_form', 'resident_placeholder', 'Introduce su nombre'),
  ('fr', 'obs_form', 'resident_placeholder', 'Entrez son nom'),
  ('de', 'obs_form', 'resident_placeholder', 'Namen eingeben'),
  ('it', 'obs_form', 'resident_placeholder', 'Inserisci il nome'),
  ('sv', 'obs_form', 'resident_placeholder', 'Ange namnet'),
  ('fi', 'obs_form', 'resident_placeholder', 'Syötä nimi'),
  ('ja', 'obs_form', 'resident_placeholder', '名前を入力'),

  -- obs_form.adl_type_label
  ('en', 'obs_form', 'adl_type_label', 'Daily Living (ADL)'),
  ('es', 'obs_form', 'adl_type_label', 'Vida diaria (ADL)'),
  ('fr', 'obs_form', 'adl_type_label', 'Vie quotidienne (ADL)'),
  ('de', 'obs_form', 'adl_type_label', 'Tägliches Leben (ADL)'),
  ('it', 'obs_form', 'adl_type_label', 'Vita quotidiana (ADL)'),
  ('sv', 'obs_form', 'adl_type_label', 'Dagligt liv (ADL)'),
  ('fi', 'obs_form', 'adl_type_label', 'Päivittäinen elämä (ADL)'),
  ('ja', 'obs_form', 'adl_type_label', '日常生活（ADL）'),

  -- obs_form.iadl_type_label
  ('en', 'obs_form', 'iadl_type_label', 'Life Skills (IADL)'),
  ('es', 'obs_form', 'iadl_type_label', 'Habilidades de la vida (IADL)'),
  ('fr', 'obs_form', 'iadl_type_label', 'Compétences de vie (IADL)'),
  ('de', 'obs_form', 'iadl_type_label', 'Lebenskompetenzen (IADL)'),
  ('it', 'obs_form', 'iadl_type_label', 'Competenze di vita (IADL)'),
  ('sv', 'obs_form', 'iadl_type_label', 'Livsfärdigheter (IADL)'),
  ('fi', 'obs_form', 'iadl_type_label', 'Elämäntaidot (IADL)'),
  ('ja', 'obs_form', 'iadl_type_label', '生活技能（IADL）'),

  -- obs_form.category_scored (with {scored} and {total} interpolation)
  ('en', 'obs_form', 'category_scored', '{scored} of {total} scored'),
  ('es', 'obs_form', 'category_scored', '{scored} de {total} completadas'),
  ('fr', 'obs_form', 'category_scored', '{scored} sur {total} évaluées'),
  ('de', 'obs_form', 'category_scored', '{scored} von {total} bewertet'),
  ('it', 'obs_form', 'category_scored', '{scored} di {total} valutate'),
  ('sv', 'obs_form', 'category_scored', '{scored} av {total} poängsatta'),
  ('fi', 'obs_form', 'category_scored', '{scored}/{total} pisteytetty'),
  ('ja', 'obs_form', 'category_scored', '{scored}/{total}件評価済み'),

  -- obs_form.cat_notes_placeholder
  ('en', 'obs_form', 'cat_notes_placeholder', 'Notes for'),
  ('es', 'obs_form', 'cat_notes_placeholder', 'Notas para'),
  ('fr', 'obs_form', 'cat_notes_placeholder', 'Notes pour'),
  ('de', 'obs_form', 'cat_notes_placeholder', 'Notizen für'),
  ('it', 'obs_form', 'cat_notes_placeholder', 'Note per'),
  ('sv', 'obs_form', 'cat_notes_placeholder', 'Anteckningar för'),
  ('fi', 'obs_form', 'cat_notes_placeholder', 'Muistiinpanot kohteelle'),
  ('ja', 'obs_form', 'cat_notes_placeholder', 'メモ:'),

  -- obs_form.no_score_hint
  ('en', 'obs_form', 'no_score_hint', 'You don''t need to answer every question — even a few scores are helpful.'),
  ('es', 'obs_form', 'no_score_hint', 'No necesitas responder todas las preguntas — incluso unas pocas puntuaciones son útiles.'),
  ('fr', 'obs_form', 'no_score_hint', 'Vous n''avez pas besoin de répondre à toutes les questions — quelques évaluations suffisent.'),
  ('de', 'obs_form', 'no_score_hint', 'Sie müssen nicht jede Frage beantworten — auch wenige Bewertungen helfen.'),
  ('it', 'obs_form', 'no_score_hint', 'Non devi rispondere a tutte le domande — anche poche valutazioni sono utili.'),
  ('sv', 'obs_form', 'no_score_hint', 'Du behöver inte svara på alla frågor — även några få poäng är till hjälp.'),
  ('fi', 'obs_form', 'no_score_hint', 'Sinun ei tarvitse vastata kaikkiin kysymyksiin — muutama pistekin auttaa.'),
  ('ja', 'obs_form', 'no_score_hint', 'すべての質問に答える必要はありません — わずかな評価でも役立ちます。'),

  -- obs_form.last_saved_at
  ('en', 'obs_form', 'last_saved_at', 'Last saved'),
  ('es', 'obs_form', 'last_saved_at', 'Último guardado'),
  ('fr', 'obs_form', 'last_saved_at', 'Dernier enregistrement'),
  ('de', 'obs_form', 'last_saved_at', 'Zuletzt gespeichert'),
  ('it', 'obs_form', 'last_saved_at', 'Ultimo salvataggio'),
  ('sv', 'obs_form', 'last_saved_at', 'Senast sparat'),
  ('fi', 'obs_form', 'last_saved_at', 'Viimeksi tallennettu'),
  ('ja', 'obs_form', 'last_saved_at', '最終保存')
ON CONFLICT (locale, namespace, key) DO UPDATE
SET value = EXCLUDED.value;
