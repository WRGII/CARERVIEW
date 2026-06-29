
-- Corrected version with namespace column and proper ON CONFLICT
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  -- English
  ('en', 'common', 'family_setup.subtitle',                  'Your Family Circle plan includes up to 3 caregivers. Set up your shared team below.'),
  ('en', 'common', 'family_setup.patient_label',             'Who are you caring for?'),
  ('en', 'common', 'family_setup.patient_placeholder',       'e.g. Mum, Dad, Margaret'),
  ('en', 'common', 'family_setup.patient_required',          'Please enter the name of the person you are caring for.'),
  ('en', 'common', 'family_setup.invite_label',              'Caregiver'),
  ('en', 'common', 'family_setup.caregiver_name_placeholder','Full name'),
  ('en', 'common', 'family_setup.create_failed',             'Failed to create Family Circle. Please try again.'),
  ('en', 'common', 'family_setup.invite_links_title',        'Invite links'),
  ('en', 'common', 'family_setup.invite_links_note',         'Share these links with your co-caregivers. Each link is single-use.'),
  ('en', 'common', 'common.optional_parens',                 '(optional)'),
  ('en', 'common', 'team.invite_placeholder',                'Email address'),

  -- Spanish
  ('es', 'common', 'family_setup.subtitle',                  'Tu plan de Círculo Familiar incluye hasta 3 cuidadores. Configura tu equipo compartido a continuación.'),
  ('es', 'common', 'family_setup.patient_label',             '¿A quién estás cuidando?'),
  ('es', 'common', 'family_setup.patient_placeholder',       'p. ej. Mamá, Papá, Margarita'),
  ('es', 'common', 'family_setup.patient_required',          'Por favor ingresa el nombre de la persona a la que estás cuidando.'),
  ('es', 'common', 'family_setup.invite_label',              'Cuidador/a'),
  ('es', 'common', 'family_setup.caregiver_name_placeholder','Nombre completo'),
  ('es', 'common', 'family_setup.create_failed',             'No se pudo crear el Círculo Familiar. Por favor, intenta de nuevo.'),
  ('es', 'common', 'family_setup.invite_links_title',        'Enlaces de invitación'),
  ('es', 'common', 'family_setup.invite_links_note',         'Comparte estos enlaces con tus co-cuidadores. Cada enlace es de un solo uso.'),
  ('es', 'common', 'common.optional_parens',                 '(opcional)'),
  ('es', 'common', 'team.invite_placeholder',                'Correo electrónico'),

  -- French
  ('fr', 'common', 'family_setup.subtitle',                  'Votre plan Family Circle inclut jusqu''à 3 aidants. Configurez votre équipe partagée ci-dessous.'),
  ('fr', 'common', 'family_setup.patient_label',             'Pour qui prenez-vous soin?'),
  ('fr', 'common', 'family_setup.patient_placeholder',       'ex. Maman, Papa, Marguerite'),
  ('fr', 'common', 'family_setup.patient_required',          'Veuillez saisir le nom de la personne dont vous prenez soin.'),
  ('fr', 'common', 'family_setup.invite_label',              'Aidant(e)'),
  ('fr', 'common', 'family_setup.caregiver_name_placeholder','Nom complet'),
  ('fr', 'common', 'family_setup.create_failed',             'Impossible de créer le Family Circle. Veuillez réessayer.'),
  ('fr', 'common', 'family_setup.invite_links_title',        'Liens d''invitation'),
  ('fr', 'common', 'family_setup.invite_links_note',         'Partagez ces liens avec vos co-aidants. Chaque lien est à usage unique.'),
  ('fr', 'common', 'common.optional_parens',                 '(facultatif)'),
  ('fr', 'common', 'team.invite_placeholder',                'Adresse e-mail'),

  -- German
  ('de', 'common', 'family_setup.subtitle',                  'Ihr Family Circle-Plan umfasst bis zu 3 Pflegende. Richten Sie Ihr gemeinsames Team unten ein.'),
  ('de', 'common', 'family_setup.patient_label',             'Für wen pflegen Sie?'),
  ('de', 'common', 'family_setup.patient_placeholder',       'z. B. Mutti, Vati, Margarete'),
  ('de', 'common', 'family_setup.patient_required',          'Bitte geben Sie den Namen der pflegebedürftigen Person ein.'),
  ('de', 'common', 'family_setup.invite_label',              'Pflegende Person'),
  ('de', 'common', 'family_setup.caregiver_name_placeholder','Vollständiger Name'),
  ('de', 'common', 'family_setup.create_failed',             'Family Circle konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'),
  ('de', 'common', 'family_setup.invite_links_title',        'Einladungslinks'),
  ('de', 'common', 'family_setup.invite_links_note',         'Teilen Sie diese Links mit Ihren Mitpflegenden. Jeder Link ist einmalig verwendbar.'),
  ('de', 'common', 'common.optional_parens',                 '(optional)'),
  ('de', 'common', 'team.invite_placeholder',                'E-Mail-Adresse'),

  -- Italian
  ('it', 'common', 'family_setup.subtitle',                  'Il tuo piano Family Circle include fino a 3 caregiver. Configura il tuo team condiviso qui sotto.'),
  ('it', 'common', 'family_setup.patient_label',             'Di chi ti prendi cura?'),
  ('it', 'common', 'family_setup.patient_placeholder',       'es. Mamma, Papà, Margherita'),
  ('it', 'common', 'family_setup.patient_required',          'Inserisci il nome della persona di cui ti prendi cura.'),
  ('it', 'common', 'family_setup.invite_label',              'Caregiver'),
  ('it', 'common', 'family_setup.caregiver_name_placeholder','Nome completo'),
  ('it', 'common', 'family_setup.create_failed',             'Impossibile creare il Family Circle. Riprova.'),
  ('it', 'common', 'family_setup.invite_links_title',        'Link di invito'),
  ('it', 'common', 'family_setup.invite_links_note',         'Condividi questi link con i tuoi co-caregiver. Ogni link è monouso.'),
  ('it', 'common', 'common.optional_parens',                 '(facoltativo)'),
  ('it', 'common', 'team.invite_placeholder',                'Indirizzo email'),

  -- Swedish
  ('sv', 'common', 'family_setup.subtitle',                  'Din Family Circle-plan inkluderar upp till 3 vårdgivare. Konfigurera ditt delade team nedan.'),
  ('sv', 'common', 'family_setup.patient_label',             'Vem vårdar du?'),
  ('sv', 'common', 'family_setup.patient_placeholder',       't.ex. Mamma, Pappa, Margareta'),
  ('sv', 'common', 'family_setup.patient_required',          'Ange namnet på den person du vårdar.'),
  ('sv', 'common', 'family_setup.invite_label',              'Vårdgivare'),
  ('sv', 'common', 'family_setup.caregiver_name_placeholder','Fullständigt namn'),
  ('sv', 'common', 'family_setup.create_failed',             'Det gick inte att skapa Family Circle. Försök igen.'),
  ('sv', 'common', 'family_setup.invite_links_title',        'Inbjudningslänkar'),
  ('sv', 'common', 'family_setup.invite_links_note',         'Dela dessa länkar med dina medvårdgivare. Varje länk är engångsbruk.'),
  ('sv', 'common', 'common.optional_parens',                 '(valfritt)'),
  ('sv', 'common', 'team.invite_placeholder',                'E-postadress'),

  -- Finnish
  ('fi', 'common', 'family_setup.subtitle',                  'Family Circle -suunnitelmasi sisältää enintään 3 hoitajaa. Määritä jaettu tiimisi alla.'),
  ('fi', 'common', 'family_setup.patient_label',             'Ketä hoidat?'),
  ('fi', 'common', 'family_setup.patient_placeholder',       'esim. Äiti, Isä, Marjatta'),
  ('fi', 'common', 'family_setup.patient_required',          'Anna hoidettavan henkilön nimi.'),
  ('fi', 'common', 'family_setup.invite_label',              'Hoitaja'),
  ('fi', 'common', 'family_setup.caregiver_name_placeholder','Koko nimi'),
  ('fi', 'common', 'family_setup.create_failed',             'Family Circlen luominen epäonnistui. Yritä uudelleen.'),
  ('fi', 'common', 'family_setup.invite_links_title',        'Kutsulinkit'),
  ('fi', 'common', 'family_setup.invite_links_note',         'Jaa nämä linkit kanssahoitajillesi. Jokainen linkki on kertakäyttöinen.'),
  ('fi', 'common', 'common.optional_parens',                 '(valinnainen)'),
  ('fi', 'common', 'team.invite_placeholder',                'Sähköpostiosoite')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
