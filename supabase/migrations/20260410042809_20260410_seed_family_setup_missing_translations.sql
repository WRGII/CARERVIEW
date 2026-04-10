/*
  # Seed Missing Family Circle Setup Translation Keys

  ## Summary
  Adds all translation keys used by the FamilyCircleSetup component that were
  missing from the ui_translations table. Without these keys the widget renders
  raw key names (e.g. "family_setup.subtitle") instead of actual text.

  ## New Keys Added
  - family_setup.subtitle       - Subtitle text for the setup card
  - family_setup.patient_label  - Label for the patient name input
  - family_setup.patient_placeholder - Placeholder for patient name field
  - family_setup.patient_required    - Validation error when patient name is empty
  - family_setup.invite_label        - Label prefix for each caregiver invite slot
  - family_setup.caregiver_name_placeholder - Placeholder for caregiver name field
  - family_setup.create_failed       - Generic error when team creation fails
  - family_setup.invite_links_title  - Heading shown after invite links are generated
  - family_setup.invite_links_note   - Explanatory note shown below invite links
  - common.optional_parens           - "(optional)" parenthetical label
  - team.invite_placeholder          - Email placeholder for invite inputs

  ## Locales Covered
  en, es, fr, de, it, sv, fi

  ## Notes
  Uses INSERT ... ON CONFLICT DO NOTHING so re-running is safe.
*/

INSERT INTO ui_translations (key, locale, value) VALUES
  -- English
  ('family_setup.subtitle',                  'en', 'Your Family Circle plan includes up to 3 caregivers. Set up your shared team below.'),
  ('family_setup.patient_label',             'en', 'Who are you caring for?'),
  ('family_setup.patient_placeholder',       'en', 'e.g. Mum, Dad, Margaret'),
  ('family_setup.patient_required',          'en', 'Please enter the name of the person you are caring for.'),
  ('family_setup.invite_label',              'en', 'Caregiver'),
  ('family_setup.caregiver_name_placeholder','en', 'Full name'),
  ('family_setup.create_failed',             'en', 'Failed to create Family Circle. Please try again.'),
  ('family_setup.invite_links_title',        'en', 'Invite links'),
  ('family_setup.invite_links_note',         'en', 'Share these links with your co-caregivers. Each link is single-use.'),
  ('common.optional_parens',                 'en', '(optional)'),
  ('team.invite_placeholder',                'en', 'Email address'),

  -- Spanish
  ('family_setup.subtitle',                  'es', 'Tu plan de Círculo Familiar incluye hasta 3 cuidadores. Configura tu equipo compartido a continuación.'),
  ('family_setup.patient_label',             'es', '¿A quién estás cuidando?'),
  ('family_setup.patient_placeholder',       'es', 'p. ej. Mamá, Papá, Margarita'),
  ('family_setup.patient_required',          'es', 'Por favor ingresa el nombre de la persona a la que estás cuidando.'),
  ('family_setup.invite_label',              'es', 'Cuidador/a'),
  ('family_setup.caregiver_name_placeholder','es', 'Nombre completo'),
  ('family_setup.create_failed',             'es', 'No se pudo crear el Círculo Familiar. Por favor, intenta de nuevo.'),
  ('family_setup.invite_links_title',        'es', 'Enlaces de invitación'),
  ('family_setup.invite_links_note',         'es', 'Comparte estos enlaces con tus co-cuidadores. Cada enlace es de un solo uso.'),
  ('common.optional_parens',                 'es', '(opcional)'),
  ('team.invite_placeholder',                'es', 'Correo electrónico'),

  -- French
  ('family_setup.subtitle',                  'fr', 'Votre plan Family Circle inclut jusqu''à 3 aidants. Configurez votre équipe partagée ci-dessous.'),
  ('family_setup.patient_label',             'fr', 'Pour qui prenez-vous soin?'),
  ('family_setup.patient_placeholder',       'fr', 'ex. Maman, Papa, Marguerite'),
  ('family_setup.patient_required',          'fr', 'Veuillez saisir le nom de la personne dont vous prenez soin.'),
  ('family_setup.invite_label',              'fr', 'Aidant(e)'),
  ('family_setup.caregiver_name_placeholder','fr', 'Nom complet'),
  ('family_setup.create_failed',             'fr', 'Impossible de créer le Family Circle. Veuillez réessayer.'),
  ('family_setup.invite_links_title',        'fr', 'Liens d''invitation'),
  ('family_setup.invite_links_note',         'fr', 'Partagez ces liens avec vos co-aidants. Chaque lien est à usage unique.'),
  ('common.optional_parens',                 'fr', '(facultatif)'),
  ('team.invite_placeholder',                'fr', 'Adresse e-mail'),

  -- German
  ('family_setup.subtitle',                  'de', 'Ihr Family Circle-Plan umfasst bis zu 3 Pflegende. Richten Sie Ihr gemeinsames Team unten ein.'),
  ('family_setup.patient_label',             'de', 'Für wen pflegen Sie?'),
  ('family_setup.patient_placeholder',       'de', 'z. B. Mutti, Vati, Margarete'),
  ('family_setup.patient_required',          'de', 'Bitte geben Sie den Namen der pflegebedürftigen Person ein.'),
  ('family_setup.invite_label',              'de', 'Pflegende Person'),
  ('family_setup.caregiver_name_placeholder','de', 'Vollständiger Name'),
  ('family_setup.create_failed',             'de', 'Family Circle konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'),
  ('family_setup.invite_links_title',        'de', 'Einladungslinks'),
  ('family_setup.invite_links_note',         'de', 'Teilen Sie diese Links mit Ihren Mitpflegenden. Jeder Link ist einmalig verwendbar.'),
  ('common.optional_parens',                 'de', '(optional)'),
  ('team.invite_placeholder',                'de', 'E-Mail-Adresse'),

  -- Italian
  ('family_setup.subtitle',                  'it', 'Il tuo piano Family Circle include fino a 3 caregiver. Configura il tuo team condiviso qui sotto.'),
  ('family_setup.patient_label',             'it', 'Di chi ti prendi cura?'),
  ('family_setup.patient_placeholder',       'it', 'es. Mamma, Papà, Margherita'),
  ('family_setup.patient_required',          'it', 'Inserisci il nome della persona di cui ti prendi cura.'),
  ('family_setup.invite_label',              'it', 'Caregiver'),
  ('family_setup.caregiver_name_placeholder','it', 'Nome completo'),
  ('family_setup.create_failed',             'it', 'Impossibile creare il Family Circle. Riprova.'),
  ('family_setup.invite_links_title',        'it', 'Link di invito'),
  ('family_setup.invite_links_note',         'it', 'Condividi questi link con i tuoi co-caregiver. Ogni link è monouso.'),
  ('common.optional_parens',                 'it', '(facoltativo)'),
  ('team.invite_placeholder',                'it', 'Indirizzo email'),

  -- Swedish
  ('family_setup.subtitle',                  'sv', 'Din Family Circle-plan inkluderar upp till 3 vårdgivare. Konfigurera ditt delade team nedan.'),
  ('family_setup.patient_label',             'sv', 'Vem vårdar du?'),
  ('family_setup.patient_placeholder',       'sv', 't.ex. Mamma, Pappa, Margareta'),
  ('family_setup.patient_required',          'sv', 'Ange namnet på den person du vårdar.'),
  ('family_setup.invite_label',              'sv', 'Vårdgivare'),
  ('family_setup.caregiver_name_placeholder','sv', 'Fullständigt namn'),
  ('family_setup.create_failed',             'sv', 'Det gick inte att skapa Family Circle. Försök igen.'),
  ('family_setup.invite_links_title',        'sv', 'Inbjudningslänkar'),
  ('family_setup.invite_links_note',         'sv', 'Dela dessa länkar med dina medvårdgivare. Varje länk är engångsbruk.'),
  ('common.optional_parens',                 'sv', '(valfritt)'),
  ('team.invite_placeholder',                'sv', 'E-postadress'),

  -- Finnish
  ('family_setup.subtitle',                  'fi', 'Family Circle -suunnitelmasi sisältää enintään 3 hoitajaa. Määritä jaettu tiimisi alla.'),
  ('family_setup.patient_label',             'fi', 'Ketä hoidat?'),
  ('family_setup.patient_placeholder',       'fi', 'esim. Äiti, Isä, Marjatta'),
  ('family_setup.patient_required',          'fi', 'Anna hoidettavan henkilön nimi.'),
  ('family_setup.invite_label',              'fi', 'Hoitaja'),
  ('family_setup.caregiver_name_placeholder','fi', 'Koko nimi'),
  ('family_setup.create_failed',             'fi', 'Family Circlen luominen epäonnistui. Yritä uudelleen.'),
  ('family_setup.invite_links_title',        'fi', 'Kutsulinkit'),
  ('family_setup.invite_links_note',         'fi', 'Jaa nämä linkit kanssahoitajillesi. Jokainen linkki on kertakäyttöinen.'),
  ('common.optional_parens',                 'fi', '(valinnainen)'),
  ('team.invite_placeholder',                'fi', 'Sähköpostiosoite')

ON CONFLICT (key, locale) DO NOTHING;
