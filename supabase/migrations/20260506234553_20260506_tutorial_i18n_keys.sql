/*
  # Tutorial i18n Translation Keys

  ## Summary
  Adds and updates all translation keys needed for the tutorial feature across
  all 7 supported locales (en, es, it, fr, de, sv, fi).

  ## New Keys
  - `nav.tutorial` — nav/header link label ("Tour the App")
  - `footer.tutorial_link` — footer resources section link label
  - `tutorial.page_title` — /tutorial public page title
  - `tutorial.page_subtitle` — /tutorial public page subtitle
  - `tutorial.cta_start` — primary CTA for unauthenticated visitors
  - `tutorial.cta_restart` — secondary CTA for signed-in users
  - `tutorial.public_description` — short description for public page
  - `tutorial.step_label` — "Step X of Y" label
  - `tutorial.step1_title` through `tutorial.step5_title` — step titles (5 steps)
  - `tutorial.step1_body` through `tutorial.step5_body` — step body copy

  ## Updated Keys
  - Fixes it/fr/de locales that only had English fallback values for step keys
  - Aligns sv/fi `account_menu.restart_tutorial` key name
  - Adds `account_menu.restart_tutorial` for sv/fi (they used `account_menu.tutorial`)

  ## Notes
  - Uses ON CONFLICT DO UPDATE to safely overwrite English-fallback placeholders
*/

-- ── English ───────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('en', 'nav.tutorial',                 'Tour the App'),
  ('en', 'footer.tutorial_link',         'App Tour'),
  ('en', 'tutorial.page_title',          'See How CarerView Works'),
  ('en', 'tutorial.page_subtitle',       'A quick 5-step walkthrough of the core tools built for family caregivers.'),
  ('en', 'tutorial.cta_start',           'Start the Tour'),
  ('en', 'tutorial.cta_restart',         'Restart Tutorial'),
  ('en', 'tutorial.public_description',  'Walk through the Memory Book, Care Plan, Observations, and Team tools in minutes.'),
  ('en', 'tutorial.step_label',          'Step {current} of {total}'),
  ('en', 'tutorial.step1_title',         'Welcome to CarerView'),
  ('en', 'tutorial.step1_body',          'CarerView gives your care team three connected tools — a Memory Book, a Care Plan, and Observations — all in one place. This tour takes about two minutes.'),
  ('en', 'tutorial.step2_title',         'Memory Book: Know the Person'),
  ('en', 'tutorial.step2_body',          'The Memory Book stores everything that matters — identity, health history, medications, contacts, preferences, and practical details. Build it once, share it with your whole team.'),
  ('en', 'tutorial.step3_title',         'Care Plan: Coordinate the Team'),
  ('en', 'tutorial.step3_body',          'The Care Plan defines who does what, who holds authority, where care happens, and when to review the plan. It flags critical gaps so nothing falls through the cracks.'),
  ('en', 'tutorial.step4_title',         'Observations: Track Change'),
  ('en', 'tutorial.step4_body',          'Observations let you score daily living activities (ADL/IADL) on a simple scale. Over time, the trend tells you — and your care team''s doctor — exactly how things are changing.'),
  ('en', 'tutorial.step5_title',         'Invite Your Team'),
  ('en', 'tutorial.step5_body',          'Care works better with more hands. Add family members or other carers to your Family Circle so everyone can stay informed and share the load.'),
  ('en', 'tutorial.skip',                'Skip tour'),
  ('en', 'tutorial.skip_btn',            'Skip tour'),
  ('en', 'tutorial.skip_aria',           'Skip tutorial'),
  ('en', 'tutorial.nav_step_preview',    'Take a guided tour of the app''s features')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Spanish ───────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('es', 'nav.tutorial',                 'Recorrido por la app'),
  ('es', 'footer.tutorial_link',         'Recorrido por la app'),
  ('es', 'tutorial.page_title',          'Descubre cómo funciona CarerView'),
  ('es', 'tutorial.page_subtitle',       'Un recorrido guiado de 5 pasos por las herramientas principales para cuidadores familiares.'),
  ('es', 'tutorial.cta_start',           'Iniciar el recorrido'),
  ('es', 'tutorial.cta_restart',         'Reiniciar el tutorial'),
  ('es', 'tutorial.public_description',  'Conoce el Libro de Memorias, el Plan de Cuidados, las Observaciones y las herramientas del equipo en minutos.'),
  ('es', 'tutorial.step_label',          'Paso {current} de {total}'),
  ('es', 'tutorial.step1_title',         'Bienvenido a CarerView'),
  ('es', 'tutorial.step1_body',          'CarerView ofrece a tu equipo de cuidado tres herramientas conectadas: un Libro de Memorias, un Plan de Cuidados y Observaciones, todo en un solo lugar. Este recorrido dura unos dos minutos.'),
  ('es', 'tutorial.step2_title',         'Libro de Memorias: Conoce a la persona'),
  ('es', 'tutorial.step2_body',          'El Libro de Memorias almacena todo lo que importa: identidad, historial de salud, medicamentos, contactos, preferencias y detalles prácticos. Créalo una vez y compártelo con todo tu equipo.'),
  ('es', 'tutorial.step3_title',         'Plan de Cuidados: Coordina al equipo'),
  ('es', 'tutorial.step3_body',          'El Plan de Cuidados define quién hace qué, quién tiene autoridad, dónde se presta el cuidado y cuándo revisar el plan. Señala las brechas críticas para que nada quede sin atender.'),
  ('es', 'tutorial.step4_title',         'Observaciones: Registra el cambio'),
  ('es', 'tutorial.step4_body',          'Las Observaciones te permiten calificar actividades de la vida diaria (AVD/AIVD) en una escala sencilla. Con el tiempo, la tendencia indica exactamente cómo evolucionan las necesidades.'),
  ('es', 'tutorial.step5_title',         'Invita a tu equipo'),
  ('es', 'tutorial.step5_body',          'El cuidado funciona mejor cuando hay más manos. Añade familiares u otros cuidadores a tu Círculo Familiar para que todos estén informados y compartan la carga.'),
  ('es', 'tutorial.skip',                'Omitir recorrido'),
  ('es', 'tutorial.skip_btn',            'Omitir recorrido'),
  ('es', 'tutorial.skip_aria',           'Omitir tutorial'),
  ('es', 'tutorial.nav_step_preview',    'Haz un recorrido guiado de las funciones de la app'),
  ('es', 'account_menu.restart_tutorial','Reiniciar Tutorial')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Italian ───────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('it', 'nav.tutorial',                 'Tour dell''app'),
  ('it', 'footer.tutorial_link',         'Tour dell''app'),
  ('it', 'tutorial.page_title',          'Scopri come funziona CarerView'),
  ('it', 'tutorial.page_subtitle',       'Una guida rapida in 5 passaggi agli strumenti principali per i caregiver familiari.'),
  ('it', 'tutorial.cta_start',           'Inizia il tour'),
  ('it', 'tutorial.cta_restart',         'Ricomincia il tutorial'),
  ('it', 'tutorial.public_description',  'Esplora il Libro dei Ricordi, il Piano di Cura, le Osservazioni e gli strumenti del team in pochi minuti.'),
  ('it', 'tutorial.step_label',          'Passaggio {current} di {total}'),
  ('it', 'tutorial.step1_title',         'Benvenuto in CarerView'),
  ('it', 'tutorial.step1_body',          'CarerView offre al tuo team di cura tre strumenti collegati: un Libro dei Ricordi, un Piano di Cura e le Osservazioni, tutto in un unico posto. Questo tour dura circa due minuti.'),
  ('it', 'tutorial.step2_title',         'Libro dei Ricordi: Conosci la persona'),
  ('it', 'tutorial.step2_body',          'Il Libro dei Ricordi conserva tutto ciò che conta: identità, storia clinica, farmaci, contatti, preferenze e dettagli pratici. Crealo una volta e condividilo con tutto il team.'),
  ('it', 'tutorial.step3_title',         'Piano di Cura: Coordina il team'),
  ('it', 'tutorial.step3_body',          'Il Piano di Cura definisce chi fa cosa, chi ha l''autorità, dove avviene la cura e quando rivedere il piano. Segnala le lacune critiche affinché nulla vada perso.'),
  ('it', 'tutorial.step4_title',         'Osservazioni: Monitora il cambiamento'),
  ('it', 'tutorial.step4_body',          'Le Osservazioni ti permettono di valutare le attività della vita quotidiana (ADL/IADL) su una scala semplice. Nel tempo, la tendenza mostra esattamente come cambiano le esigenze.'),
  ('it', 'tutorial.step5_title',         'Invita il tuo team'),
  ('it', 'tutorial.step5_body',          'La cura funziona meglio con più persone. Aggiungi familiari o altri caregiver al tuo Cerchio Familiare in modo che tutti siano informati e condividano il carico.'),
  ('it', 'tutorial.skip',                'Salta il tour'),
  ('it', 'tutorial.skip_btn',            'Salta il tour'),
  ('it', 'tutorial.skip_aria',           'Salta il tutorial'),
  ('it', 'tutorial.nav_step_preview',    'Fai un tour guidato delle funzionalità dell''app'),
  ('it', 'account_menu.restart_tutorial','Ricomincia il Tutorial')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── French ────────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('fr', 'nav.tutorial',                 'Visite guidée'),
  ('fr', 'footer.tutorial_link',         'Visite guidée'),
  ('fr', 'tutorial.page_title',          'Découvrez comment fonctionne CarerView'),
  ('fr', 'tutorial.page_subtitle',       'Une visite guidée en 5 étapes des outils essentiels pour les aidants familiaux.'),
  ('fr', 'tutorial.cta_start',           'Commencer la visite'),
  ('fr', 'tutorial.cta_restart',         'Recommencer le tutoriel'),
  ('fr', 'tutorial.public_description',  'Explorez le Livre de Mémoire, le Plan de Soins, les Observations et les outils d''équipe en quelques minutes.'),
  ('fr', 'tutorial.step_label',          'Étape {current} sur {total}'),
  ('fr', 'tutorial.step1_title',         'Bienvenue sur CarerView'),
  ('fr', 'tutorial.step1_body',          'CarerView donne à votre équipe soignante trois outils connectés : un Livre de Mémoire, un Plan de Soins et des Observations, le tout au même endroit. Cette visite dure environ deux minutes.'),
  ('fr', 'tutorial.step2_title',         'Livre de Mémoire : Connaître la personne'),
  ('fr', 'tutorial.step2_body',          'Le Livre de Mémoire stocke tout ce qui compte : identité, antécédents de santé, médicaments, contacts, préférences et détails pratiques. Créez-le une fois, partagez-le avec toute votre équipe.'),
  ('fr', 'tutorial.step3_title',         'Plan de Soins : Coordonner l''équipe'),
  ('fr', 'tutorial.step3_body',          'Le Plan de Soins définit qui fait quoi, qui détient l''autorité, où les soins ont lieu et quand revoir le plan. Il signale les lacunes critiques pour que rien ne soit oublié.'),
  ('fr', 'tutorial.step4_title',         'Observations : Suivre l''évolution'),
  ('fr', 'tutorial.step4_body',          'Les Observations vous permettent d''évaluer les activités de la vie quotidienne (AVQ/AIVQ) sur une échelle simple. Au fil du temps, la tendance indique exactement comment les besoins évoluent.'),
  ('fr', 'tutorial.step5_title',         'Invitez votre équipe'),
  ('fr', 'tutorial.step5_body',          'Les soins fonctionnent mieux à plusieurs. Ajoutez des membres de la famille ou d''autres aidants à votre Cercle Familial pour que tout le monde soit informé et partage la charge.'),
  ('fr', 'tutorial.skip',                'Passer la visite'),
  ('fr', 'tutorial.skip_btn',            'Passer la visite'),
  ('fr', 'tutorial.skip_aria',           'Passer le tutoriel'),
  ('fr', 'tutorial.nav_step_preview',    'Faites une visite guidée des fonctionnalités de l''app'),
  ('fr', 'account_menu.restart_tutorial','Recommencer le tutoriel')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── German ────────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('de', 'nav.tutorial',                 'App-Tour'),
  ('de', 'footer.tutorial_link',         'App-Tour'),
  ('de', 'tutorial.page_title',          'So funktioniert CarerView'),
  ('de', 'tutorial.page_subtitle',       'Eine kurze 5-Schritte-Führung durch die wichtigsten Werkzeuge für pflegende Angehörige.'),
  ('de', 'tutorial.cta_start',           'Tour starten'),
  ('de', 'tutorial.cta_restart',         'Tutorial neu starten'),
  ('de', 'tutorial.public_description',  'Entdecken Sie das Erinnerungsbuch, den Pflegeplan, Beobachtungen und Team-Tools in wenigen Minuten.'),
  ('de', 'tutorial.step_label',          'Schritt {current} von {total}'),
  ('de', 'tutorial.step1_title',         'Willkommen bei CarerView'),
  ('de', 'tutorial.step1_body',          'CarerView stellt Ihrem Pflegeteam drei verbundene Werkzeuge bereit: ein Erinnerungsbuch, einen Pflegeplan und Beobachtungen – alles an einem Ort. Diese Tour dauert etwa zwei Minuten.'),
  ('de', 'tutorial.step2_title',         'Erinnerungsbuch: Die Person kennen'),
  ('de', 'tutorial.step2_body',          'Das Erinnerungsbuch speichert alles Wichtige: Identität, Gesundheitsgeschichte, Medikamente, Kontakte, Vorlieben und praktische Details. Einmal erstellt, mit dem gesamten Team geteilt.'),
  ('de', 'tutorial.step3_title',         'Pflegeplan: Das Team koordinieren'),
  ('de', 'tutorial.step3_body',          'Der Pflegeplan legt fest, wer was tut, wer die Entscheidungsbefugnis hat, wo die Pflege stattfindet und wann der Plan überprüft wird. Er zeigt kritische Lücken auf, damit nichts übersehen wird.'),
  ('de', 'tutorial.step4_title',         'Beobachtungen: Veränderungen verfolgen'),
  ('de', 'tutorial.step4_body',          'Beobachtungen ermöglichen die Bewertung täglicher Aktivitäten (ADL/IADL) auf einer einfachen Skala. Im Laufe der Zeit zeigt der Trend genau, wie sich die Bedürfnisse verändern.'),
  ('de', 'tutorial.step5_title',         'Ihr Team einladen'),
  ('de', 'tutorial.step5_body',          'Pflege funktioniert besser mit mehr Händen. Fügen Sie Familienmitglieder oder andere Pflegepersonen zu Ihrem Familienkreis hinzu, damit alle informiert sind und sich die Last teilen.'),
  ('de', 'tutorial.skip',                'Tour überspringen'),
  ('de', 'tutorial.skip_btn',            'Tour überspringen'),
  ('de', 'tutorial.skip_aria',           'Tutorial überspringen'),
  ('de', 'tutorial.nav_step_preview',    'Machen Sie eine geführte Tour durch die App-Funktionen'),
  ('de', 'account_menu.restart_tutorial','Tutorial neu starten')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Swedish ───────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('sv', 'nav.tutorial',                 'App-genomgång'),
  ('sv', 'footer.tutorial_link',         'App-genomgång'),
  ('sv', 'tutorial.page_title',          'Se hur CarerView fungerar'),
  ('sv', 'tutorial.page_subtitle',       'En snabb genomgång i 5 steg av de viktigaste verktygen för anhörigvårdare.'),
  ('sv', 'tutorial.cta_start',           'Starta genomgången'),
  ('sv', 'tutorial.cta_restart',         'Starta om handledning'),
  ('sv', 'tutorial.public_description',  'Utforska Minnesboken, Vårdplanen, Observationerna och teamverktygen på några minuter.'),
  ('sv', 'tutorial.step_label',          'Steg {current} av {total}'),
  ('sv', 'tutorial.step1_title',         'Välkommen till CarerView'),
  ('sv', 'tutorial.step1_body',          'CarerView ger ditt vårdteam tre sammankopplade verktyg: en Minnesbok, en Vårdplan och Observationer – allt på ett ställe. Den här genomgången tar ungefär två minuter.'),
  ('sv', 'tutorial.step2_title',         'Minnesbok: Lär känna personen'),
  ('sv', 'tutorial.step2_body',          'Minnesboken lagrar allt som spelar roll: identitet, hälsohistorik, läkemedel, kontakter, preferenser och praktiska detaljer. Bygg den en gång, dela med hela teamet.'),
  ('sv', 'tutorial.step3_title',         'Vårdplan: Koordinera teamet'),
  ('sv', 'tutorial.step3_body',          'Vårdplanen fastställer vem som gör vad, vem som har befogenhet, var vården sker och när planen ska granskas. Den markerar kritiska luckor så att inget faller igenom.'),
  ('sv', 'tutorial.step4_title',         'Observationer: Följ förändringen'),
  ('sv', 'tutorial.step4_body',          'Observationer låter dig poängsätta dagliga aktiviteter (ADL/IADL) på en enkel skala. Med tiden visar trenden exakt hur behoven förändras.'),
  ('sv', 'tutorial.step5_title',         'Bjud in ditt team'),
  ('sv', 'tutorial.step5_body',          'Vård fungerar bättre med fler händer. Lägg till familjemedlemmar eller andra vårdare i din Familjekrets så att alla är informerade och delar på bördan.'),
  ('sv', 'tutorial.skip',                'Hoppa över genomgången'),
  ('sv', 'tutorial.skip_btn',            'Hoppa över genomgången'),
  ('sv', 'tutorial.skip_aria',           'Hoppa över handledning'),
  ('sv', 'tutorial.nav_step_preview',    'Gör en guidad genomgång av appens funktioner'),
  ('sv', 'account_menu.restart_tutorial','Starta om handledning')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ── Finnish ───────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (locale, key, value) VALUES
  ('fi', 'nav.tutorial',                 'Sovelluskierros'),
  ('fi', 'footer.tutorial_link',         'Sovelluskierros'),
  ('fi', 'tutorial.page_title',          'Katso kuinka CarerView toimii'),
  ('fi', 'tutorial.page_subtitle',       'Nopea 5-vaiheinen opas omaishoitajille suunnatuista päätyökaluista.'),
  ('fi', 'tutorial.cta_start',           'Aloita kierros'),
  ('fi', 'tutorial.cta_restart',         'Käynnistä opas uudelleen'),
  ('fi', 'tutorial.public_description',  'Tutustu Muistikirjaan, Hoitosuunnitelmaan, Havaintoihin ja tiimityökaluihin muutamassa minuutissa.'),
  ('fi', 'tutorial.step_label',          'Vaihe {current} / {total}'),
  ('fi', 'tutorial.step1_title',         'Tervetuloa CarerViewhun'),
  ('fi', 'tutorial.step1_body',          'CarerView antaa hoitotiimillesi kolme yhteydessä olevaa työkalua: Muistikirjan, Hoitosuunnitelman ja Havainnot – kaikki yhdessä paikassa. Tämä kierros kestää noin kaksi minuuttia.'),
  ('fi', 'tutorial.step2_title',         'Muistikirja: Tunne henkilö'),
  ('fi', 'tutorial.step2_body',          'Muistikirja tallentaa kaiken oleellisen: henkilöllisyyden, terveyshistorian, lääkitykset, yhteystiedot, mieltymykset ja käytännön yksityiskohdat. Rakenna se kerran, jaa koko tiimille.'),
  ('fi', 'tutorial.step3_title',         'Hoitosuunnitelma: Koordinoi tiimi'),
  ('fi', 'tutorial.step3_body',          'Hoitosuunnitelma määrittelee kuka tekee mitä, kenellä on päätösvalta, missä hoito tapahtuu ja milloin suunnitelma tarkistetaan. Se merkitsee kriittiset puutteet, jotta mikään ei jää huomaamatta.'),
  ('fi', 'tutorial.step4_title',         'Havainnot: Seuraa muutosta'),
  ('fi', 'tutorial.step4_body',          'Havaintojen avulla voit pisteyttää päivittäisiä toimintoja (ADL/IADL) yksinkertaisella asteikolla. Ajan myötä trendi kertoo tarkasti, kuinka tarpeet muuttuvat.'),
  ('fi', 'tutorial.step5_title',         'Kutsu tiimisi'),
  ('fi', 'tutorial.step5_body',          'Hoito toimii paremmin useamman käden voimin. Lisää perheenjäseniä tai muita hoitajia Perhepiiristäsi, jotta kaikki pysyvät ajan tasalla ja jakavat taakan.'),
  ('fi', 'tutorial.skip',                'Ohita kierros'),
  ('fi', 'tutorial.skip_btn',            'Ohita kierros'),
  ('fi', 'tutorial.skip_aria',           'Ohita opas'),
  ('fi', 'tutorial.nav_step_preview',    'Tee opastettu kierros sovelluksen ominaisuuksista'),
  ('fi', 'account_menu.restart_tutorial','Käynnistä opas uudelleen')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
