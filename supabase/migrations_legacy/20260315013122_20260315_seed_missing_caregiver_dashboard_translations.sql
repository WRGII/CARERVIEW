/*
  # Seed missing caregiver dashboard translation keys

  ## Problem
  The caregiver dashboard (/caregiver) and its sub-components were rendering raw
  translation keys (e.g. "obs_list.score_reference") instead of real text because
  these keys were added to the codebase after the initial i18n seed migration and
  were never inserted into the ui_translations table.

  ## Keys added

  ### caregiver.* (CaregiverPage.tsx)
  - caregiver.new_obs_btn       – "New Observation" button label
  - caregiver.dementia_ref_title – Dementia reference card title
  - caregiver.dementia_ref_body  – Dementia reference card subtitle
  - caregiver.observations_title – Observations section heading
  - caregiver.observations_body  – Observations section sub-heading
  - caregiver.obs_delete_failed  – Toast error when delete fails
  - caregiver.obs_load_failed    – Error prefix when loading obs for export
  - caregiver.obs_not_found      – Error when obs row is missing
  - caregiver.legend_load_failed – Error prefix when legend fetch fails

  ### obs_list.* (ObservationList.tsx + ScoreLegendDisplay.tsx)
  - obs_list.score_reference   – Score legend panel title
  - obs_list.score_ref_loading – Score legend loading state
  - obs_list.score_ref_error   – Score legend error state
  - obs_list.score_ref_empty   – Score legend empty state
  - obs_list.error             – Generic observation list error
  - obs_list.unnamed_patient   – Fallback when patient_name is null
  - obs_list.delete_confirm    – Delete confirmation message (uses {name} and {date})

  ### scale.* (ScoreLegendDisplay.tsx)
  - scale.section_label    – Uppercase eyebrow text above scale title
  - scale.title            – Main heading of the score scale widget
  - scale.more_help        – Left-side axis label ("more assistance needed")
  - scale.more_independent – Right-side axis label ("more independent")

  ### common.*
  - common.view_arrow – "View →" arrow link text used on the dementia ref card

  ## Locales
  All 7 active locales: en, es, it, fr, de, sv, fi
  Non-English locales use quality translations where possible; less-critical UI
  strings fall back to English and can be localised via the Admin Translations page.

  ## Safety
  Uses ON CONFLICT DO UPDATE so this migration is safe to re-run.
*/

INSERT INTO ui_translations (locale, key, value)
VALUES

  -- ============================================================
  -- caregiver.new_obs_btn
  -- ============================================================
  ('en', 'caregiver.new_obs_btn', 'New Observation'),
  ('es', 'caregiver.new_obs_btn', 'Nueva observación'),
  ('it', 'caregiver.new_obs_btn', 'Nuova osservazione'),
  ('fr', 'caregiver.new_obs_btn', 'Nouvelle observation'),
  ('de', 'caregiver.new_obs_btn', 'Neue Beobachtung'),
  ('sv', 'caregiver.new_obs_btn', 'Ny observation'),
  ('fi', 'caregiver.new_obs_btn', 'Uusi havainto'),

  -- ============================================================
  -- caregiver.dementia_ref_title
  -- ============================================================
  ('en', 'caregiver.dementia_ref_title', 'Dementia Reference Scale'),
  ('es', 'caregiver.dementia_ref_title', 'Escala de referencia de demencia'),
  ('it', 'caregiver.dementia_ref_title', 'Scala di riferimento per la demenza'),
  ('fr', 'caregiver.dementia_ref_title', 'Échelle de référence sur la démence'),
  ('de', 'caregiver.dementia_ref_title', 'Demenz-Referenzskala'),
  ('sv', 'caregiver.dementia_ref_title', 'Demensreferensskala'),
  ('fi', 'caregiver.dementia_ref_title', 'Dementian viiteasteikko'),

  -- ============================================================
  -- caregiver.dementia_ref_body
  -- ============================================================
  ('en', 'caregiver.dementia_ref_body', 'View detailed guidance on dementia stages and care needs'),
  ('es', 'caregiver.dementia_ref_body', 'Ver orientación detallada sobre las etapas de la demencia y las necesidades de cuidado'),
  ('it', 'caregiver.dementia_ref_body', 'Visualizza la guida dettagliata sulle fasi della demenza e le esigenze di cura'),
  ('fr', 'caregiver.dementia_ref_body', 'Consultez des conseils détaillés sur les stades de la démence et les besoins en soins'),
  ('de', 'caregiver.dementia_ref_body', 'Detaillierte Anleitung zu Demenzstadien und Pflegebedarf anzeigen'),
  ('sv', 'caregiver.dementia_ref_body', 'Se detaljerad vägledning om demensens stadier och vårdbehov'),
  ('fi', 'caregiver.dementia_ref_body', 'Katso yksityiskohtainen opas dementian vaiheista ja hoitotarpeista'),

  -- ============================================================
  -- caregiver.observations_title
  -- ============================================================
  ('en', 'caregiver.observations_title', 'Your Observations'),
  ('es', 'caregiver.observations_title', 'Tus observaciones'),
  ('it', 'caregiver.observations_title', 'Le tue osservazioni'),
  ('fr', 'caregiver.observations_title', 'Vos observations'),
  ('de', 'caregiver.observations_title', 'Ihre Beobachtungen'),
  ('sv', 'caregiver.observations_title', 'Dina observationer'),
  ('fi', 'caregiver.observations_title', 'Havaintosi'),

  -- ============================================================
  -- caregiver.observations_body
  -- ============================================================
  ('en', 'caregiver.observations_body', 'A record of your care assessments over time'),
  ('es', 'caregiver.observations_body', 'Un registro de tus evaluaciones de cuidado a lo largo del tiempo'),
  ('it', 'caregiver.observations_body', 'Un registro delle tue valutazioni di cura nel tempo'),
  ('fr', 'caregiver.observations_body', 'Un historique de vos évaluations de soins au fil du temps'),
  ('de', 'caregiver.observations_body', 'Eine Aufzeichnung Ihrer Pflegebeurteilungen im Laufe der Zeit'),
  ('sv', 'caregiver.observations_body', 'En historik över dina omsorgsbedömningar över tid'),
  ('fi', 'caregiver.observations_body', 'Kirjaus hoitoarvioinneistasi ajan myötä'),

  -- ============================================================
  -- caregiver.obs_delete_failed
  -- ============================================================
  ('en', 'caregiver.obs_delete_failed', 'Failed to delete observation. Please try again.'),
  ('es', 'caregiver.obs_delete_failed', 'No se pudo eliminar la observación. Inténtalo de nuevo.'),
  ('it', 'caregiver.obs_delete_failed', 'Impossibile eliminare l''osservazione. Riprova.'),
  ('fr', 'caregiver.obs_delete_failed', 'Impossible de supprimer l''observation. Veuillez réessayer.'),
  ('de', 'caregiver.obs_delete_failed', 'Beobachtung konnte nicht gelöscht werden. Bitte versuche es erneut.'),
  ('sv', 'caregiver.obs_delete_failed', 'Det gick inte att ta bort observationen. Försök igen.'),
  ('fi', 'caregiver.obs_delete_failed', 'Havainnon poistaminen epäonnistui. Yritä uudelleen.'),

  -- ============================================================
  -- caregiver.obs_load_failed
  -- ============================================================
  ('en', 'caregiver.obs_load_failed', 'Failed to load observation'),
  ('es', 'caregiver.obs_load_failed', 'No se pudo cargar la observación'),
  ('it', 'caregiver.obs_load_failed', 'Impossibile caricare l''osservazione'),
  ('fr', 'caregiver.obs_load_failed', 'Impossible de charger l''observation'),
  ('de', 'caregiver.obs_load_failed', 'Beobachtung konnte nicht geladen werden'),
  ('sv', 'caregiver.obs_load_failed', 'Det gick inte att läsa in observationen'),
  ('fi', 'caregiver.obs_load_failed', 'Havainnon lataaminen epäonnistui'),

  -- ============================================================
  -- caregiver.obs_not_found
  -- ============================================================
  ('en', 'caregiver.obs_not_found', 'Observation not found'),
  ('es', 'caregiver.obs_not_found', 'Observación no encontrada'),
  ('it', 'caregiver.obs_not_found', 'Osservazione non trovata'),
  ('fr', 'caregiver.obs_not_found', 'Observation introuvable'),
  ('de', 'caregiver.obs_not_found', 'Beobachtung nicht gefunden'),
  ('sv', 'caregiver.obs_not_found', 'Observationen hittades inte'),
  ('fi', 'caregiver.obs_not_found', 'Havaintoa ei löydy'),

  -- ============================================================
  -- caregiver.legend_load_failed
  -- ============================================================
  ('en', 'caregiver.legend_load_failed', 'Failed to load score legend'),
  ('es', 'caregiver.legend_load_failed', 'No se pudo cargar la leyenda de puntuación'),
  ('it', 'caregiver.legend_load_failed', 'Impossibile caricare la legenda dei punteggi'),
  ('fr', 'caregiver.legend_load_failed', 'Impossible de charger la légende des scores'),
  ('de', 'caregiver.legend_load_failed', 'Punktzahl-Legende konnte nicht geladen werden'),
  ('sv', 'caregiver.legend_load_failed', 'Det gick inte att läsa in poängförklaringen'),
  ('fi', 'caregiver.legend_load_failed', 'Pistemäärän selitteen lataaminen epäonnistui'),

  -- ============================================================
  -- obs_list.score_reference
  -- ============================================================
  ('en', 'obs_list.score_reference', 'Score Reference'),
  ('es', 'obs_list.score_reference', 'Referencia de puntuación'),
  ('it', 'obs_list.score_reference', 'Riferimento punteggio'),
  ('fr', 'obs_list.score_reference', 'Référence de score'),
  ('de', 'obs_list.score_reference', 'Punktzahl-Referenz'),
  ('sv', 'obs_list.score_reference', 'Poängreferens'),
  ('fi', 'obs_list.score_reference', 'Pistemääräviite'),

  -- ============================================================
  -- obs_list.score_ref_loading
  -- ============================================================
  ('en', 'obs_list.score_ref_loading', 'Loading score reference…'),
  ('es', 'obs_list.score_ref_loading', 'Cargando referencia de puntuación…'),
  ('it', 'obs_list.score_ref_loading', 'Caricamento riferimento punteggio…'),
  ('fr', 'obs_list.score_ref_loading', 'Chargement de la référence de score…'),
  ('de', 'obs_list.score_ref_loading', 'Punktzahl-Referenz wird geladen…'),
  ('sv', 'obs_list.score_ref_loading', 'Läser in poängreferens…'),
  ('fi', 'obs_list.score_ref_loading', 'Ladataan pistemääräviitettä…'),

  -- ============================================================
  -- obs_list.score_ref_error
  -- ============================================================
  ('en', 'obs_list.score_ref_error', 'Could not load score reference.'),
  ('es', 'obs_list.score_ref_error', 'No se pudo cargar la referencia de puntuación.'),
  ('it', 'obs_list.score_ref_error', 'Impossibile caricare il riferimento al punteggio.'),
  ('fr', 'obs_list.score_ref_error', 'Impossible de charger la référence de score.'),
  ('de', 'obs_list.score_ref_error', 'Punktzahl-Referenz konnte nicht geladen werden.'),
  ('sv', 'obs_list.score_ref_error', 'Det gick inte att läsa in poängreferensen.'),
  ('fi', 'obs_list.score_ref_error', 'Pistemääräviitettä ei voitu ladata.'),

  -- ============================================================
  -- obs_list.score_ref_empty
  -- ============================================================
  ('en', 'obs_list.score_ref_empty', 'No score reference data available.'),
  ('es', 'obs_list.score_ref_empty', 'No hay datos de referencia de puntuación disponibles.'),
  ('it', 'obs_list.score_ref_empty', 'Nessun dato di riferimento punteggio disponibile.'),
  ('fr', 'obs_list.score_ref_empty', 'Aucune donnée de référence de score disponible.'),
  ('de', 'obs_list.score_ref_empty', 'Keine Punktzahl-Referenzdaten verfügbar.'),
  ('sv', 'obs_list.score_ref_empty', 'Inga poängreferensdata tillgängliga.'),
  ('fi', 'obs_list.score_ref_empty', 'Pistemääräviitetietoja ei ole saatavilla.'),

  -- ============================================================
  -- obs_list.error
  -- ============================================================
  ('en', 'obs_list.error', 'Failed to load observations. Please refresh the page.'),
  ('es', 'obs_list.error', 'No se pudieron cargar las observaciones. Actualiza la página.'),
  ('it', 'obs_list.error', 'Impossibile caricare le osservazioni. Aggiorna la pagina.'),
  ('fr', 'obs_list.error', 'Impossible de charger les observations. Veuillez actualiser la page.'),
  ('de', 'obs_list.error', 'Beobachtungen konnten nicht geladen werden. Bitte Seite neu laden.'),
  ('sv', 'obs_list.error', 'Det gick inte att läsa in observationerna. Ladda om sidan.'),
  ('fi', 'obs_list.error', 'Havaintojen lataaminen epäonnistui. Päivitä sivu.'),

  -- ============================================================
  -- obs_list.unnamed_patient
  -- ============================================================
  ('en', 'obs_list.unnamed_patient', 'Unnamed patient'),
  ('es', 'obs_list.unnamed_patient', 'Paciente sin nombre'),
  ('it', 'obs_list.unnamed_patient', 'Paziente senza nome'),
  ('fr', 'obs_list.unnamed_patient', 'Patient sans nom'),
  ('de', 'obs_list.unnamed_patient', 'Namenloser Patient'),
  ('sv', 'obs_list.unnamed_patient', 'Namnlös patient'),
  ('fi', 'obs_list.unnamed_patient', 'Nimetön potilas'),

  -- ============================================================
  -- obs_list.delete_confirm
  -- (supports {name} and {date} interpolation)
  -- ============================================================
  ('en', 'obs_list.delete_confirm', 'Are you sure you want to delete the observation for {name} on {date}? This cannot be undone.'),
  ('es', 'obs_list.delete_confirm', '¿Estás seguro de que deseas eliminar la observación de {name} del {date}? Esta acción no se puede deshacer.'),
  ('it', 'obs_list.delete_confirm', 'Sei sicuro di voler eliminare l''osservazione di {name} del {date}? Questa azione non può essere annullata.'),
  ('fr', 'obs_list.delete_confirm', 'Êtes-vous sûr de vouloir supprimer l''observation de {name} du {date} ? Cette action est irréversible.'),
  ('de', 'obs_list.delete_confirm', 'Möchtest du die Beobachtung für {name} vom {date} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'),
  ('sv', 'obs_list.delete_confirm', 'Är du säker på att du vill ta bort observationen för {name} den {date}? Det går inte att ångra.'),
  ('fi', 'obs_list.delete_confirm', 'Haluatko varmasti poistaa havainnon henkilölle {name} päivämäärältä {date}? Tätä toimintoa ei voi peruuttaa.'),

  -- ============================================================
  -- scale.section_label
  -- ============================================================
  ('en', 'scale.section_label', 'Scoring Scale'),
  ('es', 'scale.section_label', 'Escala de puntuación'),
  ('it', 'scale.section_label', 'Scala di valutazione'),
  ('fr', 'scale.section_label', 'Échelle de notation'),
  ('de', 'scale.section_label', 'Bewertungsskala'),
  ('sv', 'scale.section_label', 'Bedömningsskala'),
  ('fi', 'scale.section_label', 'Arviointiasteikko'),

  -- ============================================================
  -- scale.title
  -- ============================================================
  ('en', 'scale.title', 'Independence Scale'),
  ('es', 'scale.title', 'Escala de independencia'),
  ('it', 'scale.title', 'Scala di indipendenza'),
  ('fr', 'scale.title', 'Échelle d''indépendance'),
  ('de', 'scale.title', 'Unabhängigkeitsskala'),
  ('sv', 'scale.title', 'Självständighetsskala'),
  ('fi', 'scale.title', 'Itsenäisyysasteikko'),

  -- ============================================================
  -- scale.more_help
  -- ============================================================
  ('en', 'scale.more_help', 'More assistance needed'),
  ('es', 'scale.more_help', 'Necesita más asistencia'),
  ('it', 'scale.more_help', 'Maggiore assistenza necessaria'),
  ('fr', 'scale.more_help', 'Plus d''aide nécessaire'),
  ('de', 'scale.more_help', 'Mehr Unterstützung benötigt'),
  ('sv', 'scale.more_help', 'Mer hjälp behövs'),
  ('fi', 'scale.more_help', 'Enemmän apua tarvitaan'),

  -- ============================================================
  -- scale.more_independent
  -- ============================================================
  ('en', 'scale.more_independent', 'More independent'),
  ('es', 'scale.more_independent', 'Más independiente'),
  ('it', 'scale.more_independent', 'Più indipendente'),
  ('fr', 'scale.more_independent', 'Plus autonome'),
  ('de', 'scale.more_independent', 'Selbstständiger'),
  ('sv', 'scale.more_independent', 'Mer självständig'),
  ('fi', 'scale.more_independent', 'Itsenäisempi'),

  -- ============================================================
  -- common.view_arrow
  -- ============================================================
  ('en', 'common.view_arrow', 'View →'),
  ('es', 'common.view_arrow', 'Ver →'),
  ('it', 'common.view_arrow', 'Vedi →'),
  ('fr', 'common.view_arrow', 'Voir →'),
  ('de', 'common.view_arrow', 'Ansehen →'),
  ('sv', 'common.view_arrow', 'Visa →'),
  ('fi', 'common.view_arrow', 'Näytä →')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
