/*
  # Seed obs_edit.* and fix obs_form.* translation keys – all non-EN locales

  Adds the same set of keys added in the EN migration to all other supported
  locales: es, fr, de, it, sv, fi.

  Also applies the scored_count variable-name fix and placeholder fixes for
  every locale where the old broken values exist.
*/

-- ── Spanish (es) ─────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value)
VALUES
  ('es', 'obs_edit.form_adl',             'AVD'),
  ('es', 'obs_edit.form_iadl',            'AIVD'),
  ('es', 'obs_edit.form_comprehensive',   'Integral'),
  ('es', 'obs_edit.observation_label',    'Observación'),
  ('es', 'obs_edit.readonly_notice',      'Estás viendo esta observación en modo de solo lectura porque no eres el autor.'),
  ('es', 'obs_edit.frozen_notice',        'Tu cuenta ha sido suspendida. No puedes editar observaciones en este momento.'),
  ('es', 'obs_edit.render_error',         'Algo salió mal al cargar esta observación.'),
  ('es', 'obs_edit.render_error_detail',  'Por favor, actualiza la página o vuelve al panel.'),
  ('es', 'obs_form.comprehensive_label',  'Integral (AVD + AIVD)')
ON CONFLICT (locale, key) DO NOTHING;

UPDATE ui_translations SET value = '{scored} de {total} puntuados'
WHERE locale = 'es' AND key = 'obs_form.scored_count' AND value LIKE '%{count}%';

UPDATE ui_translations SET value = 'Observaciones generales sobre la visita de hoy…'
WHERE locale = 'es' AND key = 'obs_form.notes_placeholder' AND value = 'Add notes for';

UPDATE ui_translations SET value = 'Añadir notas específicas para esta categoría…'
WHERE locale = 'es' AND key = 'obs_form.cat_notes_placeholder' AND value = 'Add notes for';

-- ── French (fr) ──────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value)
VALUES
  ('fr', 'obs_edit.form_adl',             'AVQ'),
  ('fr', 'obs_edit.form_iadl',            'AIVQ'),
  ('fr', 'obs_edit.form_comprehensive',   'Complet'),
  ('fr', 'obs_edit.observation_label',    'Observation'),
  ('fr', 'obs_edit.readonly_notice',      'Vous consultez cette observation en lecture seule car vous n''en êtes pas l''auteur.'),
  ('fr', 'obs_edit.frozen_notice',        'Votre compte a été suspendu. Vous ne pouvez pas modifier les observations pour le moment.'),
  ('fr', 'obs_edit.render_error',         'Un problème est survenu lors du chargement de cette observation.'),
  ('fr', 'obs_edit.render_error_detail',  'Veuillez actualiser la page ou retourner au tableau de bord.'),
  ('fr', 'obs_form.comprehensive_label',  'Complet (AVQ + AIVQ)')
ON CONFLICT (locale, key) DO NOTHING;

UPDATE ui_translations SET value = '{scored} sur {total} notés'
WHERE locale = 'fr' AND key = 'obs_form.scored_count' AND value LIKE '%{count}%';

UPDATE ui_translations SET value = 'Observations générales sur la visite d''aujourd''hui…'
WHERE locale = 'fr' AND key = 'obs_form.notes_placeholder' AND value = 'Add notes for';

UPDATE ui_translations SET value = 'Ajouter des notes pour cette catégorie…'
WHERE locale = 'fr' AND key = 'obs_form.cat_notes_placeholder' AND value = 'Add notes for';

-- ── German (de) ──────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value)
VALUES
  ('de', 'obs_edit.form_adl',             'ADL'),
  ('de', 'obs_edit.form_iadl',            'IADL'),
  ('de', 'obs_edit.form_comprehensive',   'Umfassend'),
  ('de', 'obs_edit.observation_label',    'Beobachtung'),
  ('de', 'obs_edit.readonly_notice',      'Sie sehen diese Beobachtung im Nur-Lese-Modus, da Sie nicht der Autor sind.'),
  ('de', 'obs_edit.frozen_notice',        'Ihr Konto wurde gesperrt. Sie können derzeit keine Beobachtungen bearbeiten.'),
  ('de', 'obs_edit.render_error',         'Beim Laden dieser Beobachtung ist ein Fehler aufgetreten.'),
  ('de', 'obs_edit.render_error_detail',  'Bitte aktualisieren Sie die Seite oder kehren Sie zum Dashboard zurück.'),
  ('de', 'obs_form.comprehensive_label',  'Umfassend (ADL + IADL)')
ON CONFLICT (locale, key) DO NOTHING;

UPDATE ui_translations SET value = '{scored} von {total} bewertet'
WHERE locale = 'de' AND key = 'obs_form.scored_count' AND value LIKE '%{count}%';

UPDATE ui_translations SET value = 'Allgemeine Beobachtungen zum heutigen Besuch…'
WHERE locale = 'de' AND key = 'obs_form.notes_placeholder' AND value = 'Add notes for';

UPDATE ui_translations SET value = 'Notizen für diese Kategorie hinzufügen…'
WHERE locale = 'de' AND key = 'obs_form.cat_notes_placeholder' AND value = 'Add notes for';

-- ── Italian (it) ─────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value)
VALUES
  ('it', 'obs_edit.form_adl',             'ADL'),
  ('it', 'obs_edit.form_iadl',            'IADL'),
  ('it', 'obs_edit.form_comprehensive',   'Completo'),
  ('it', 'obs_edit.observation_label',    'Osservazione'),
  ('it', 'obs_edit.readonly_notice',      'Stai visualizzando questa osservazione in modalità di sola lettura perché non sei l''autore.'),
  ('it', 'obs_edit.frozen_notice',        'Il tuo account è stato sospeso. Non puoi modificare le osservazioni al momento.'),
  ('it', 'obs_edit.render_error',         'Si è verificato un problema durante il caricamento di questa osservazione.'),
  ('it', 'obs_edit.render_error_detail',  'Aggiorna la pagina o torna alla dashboard.'),
  ('it', 'obs_form.comprehensive_label',  'Completo (ADL + IADL)')
ON CONFLICT (locale, key) DO NOTHING;

UPDATE ui_translations SET value = '{scored} di {total} valutati'
WHERE locale = 'it' AND key = 'obs_form.scored_count' AND value LIKE '%{count}%';

UPDATE ui_translations SET value = 'Osservazioni generali sulla visita di oggi…'
WHERE locale = 'it' AND key = 'obs_form.notes_placeholder' AND value = 'Add notes for';

UPDATE ui_translations SET value = 'Aggiungi note per questa categoria…'
WHERE locale = 'it' AND key = 'obs_form.cat_notes_placeholder' AND value = 'Add notes for';

-- ── Swedish (sv) ─────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value)
VALUES
  ('sv', 'obs_edit.form_adl',             'ADL'),
  ('sv', 'obs_edit.form_iadl',            'IADL'),
  ('sv', 'obs_edit.form_comprehensive',   'Övergripande'),
  ('sv', 'obs_edit.observation_label',    'Observation'),
  ('sv', 'obs_edit.readonly_notice',      'Du visar denna observation i skrivskyddat läge eftersom du inte är författaren.'),
  ('sv', 'obs_edit.frozen_notice',        'Ditt konto har stängts av. Du kan inte redigera observationer just nu.'),
  ('sv', 'obs_edit.render_error',         'Något gick fel när observationen laddades.'),
  ('sv', 'obs_edit.render_error_detail',  'Uppdatera sidan eller gå tillbaka till instrumentpanelen.'),
  ('sv', 'obs_form.comprehensive_label',  'Övergripande (ADL + IADL)')
ON CONFLICT (locale, key) DO NOTHING;

UPDATE ui_translations SET value = '{scored} av {total} bedömda'
WHERE locale = 'sv' AND key = 'obs_form.scored_count' AND value LIKE '%{count}%';

UPDATE ui_translations SET value = 'Allmänna observationer från dagens besök…'
WHERE locale = 'sv' AND key = 'obs_form.notes_placeholder' AND value = 'Add notes for';

UPDATE ui_translations SET value = 'Lägg till anteckningar för denna kategori…'
WHERE locale = 'sv' AND key = 'obs_form.cat_notes_placeholder' AND value = 'Add notes for';

-- ── Finnish (fi) ─────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value)
VALUES
  ('fi', 'obs_edit.form_adl',             'ADL'),
  ('fi', 'obs_edit.form_iadl',            'IADL'),
  ('fi', 'obs_edit.form_comprehensive',   'Kattava'),
  ('fi', 'obs_edit.observation_label',    'Havainto'),
  ('fi', 'obs_edit.readonly_notice',      'Katselet tätä havaintoa vain luku -tilassa, koska et ole sen tekijä.'),
  ('fi', 'obs_edit.frozen_notice',        'Tilisi on jäädytetty. Et voi muokata havaintoja tällä hetkellä.'),
  ('fi', 'obs_edit.render_error',         'Havainnon lataaminen epäonnistui.'),
  ('fi', 'obs_edit.render_error_detail',  'Päivitä sivu tai palaa kojelautaan.'),
  ('fi', 'obs_form.comprehensive_label',  'Kattava (ADL + IADL)')
ON CONFLICT (locale, key) DO NOTHING;

UPDATE ui_translations SET value = '{scored} / {total} pisteytetty'
WHERE locale = 'fi' AND key = 'obs_form.scored_count' AND value LIKE '%{count}%';

UPDATE ui_translations SET value = 'Yleiset havainnot tämän päivän käynnistä…'
WHERE locale = 'fi' AND key = 'obs_form.notes_placeholder' AND value = 'Add notes for';

UPDATE ui_translations SET value = 'Lisää muistiinpanoja tälle kategorialle…'
WHERE locale = 'fi' AND key = 'obs_form.cat_notes_placeholder' AND value = 'Add notes for';
