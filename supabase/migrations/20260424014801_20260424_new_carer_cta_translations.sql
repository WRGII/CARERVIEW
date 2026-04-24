/*
  # New Carer CTA Translation Keys

  Adds i18n translation keys for the two subscription CTA placements
  added to each page of the New Carer guide section.

  ## New Keys

  ### Shared UI labels (all locales)
  - `new_carer.cta_try_free`    — inline arrow-link label on mid CTAs
  - `new_carer.cta_get_started` — primary button on end CTAs
  - `new_carer.cta_sign_in`     — secondary "already have an account" link

  ### Per-page CTAs
  - `new_carer.cta_mid_[module]_headline` / `new_carer.cta_mid_[module]_body`
  - `new_carer.cta_end_[module]_headline` / `new_carer.cta_end_[module]_body`
  Modules: hub, bp, cp, roles, living, docs, health, sustain, review

  ## Locales
  en, es, it, fr, de, sv, fi
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- ── Shared labels ────────────────────────────────────────────────────────────

('en', 'new_carer.cta_try_free',    'Try CarerView free'),
('es', 'new_carer.cta_try_free',    'Prueba CarerView gratis'),
('it', 'new_carer.cta_try_free',    'Prova CarerView gratis'),
('fr', 'new_carer.cta_try_free',    'Essayer CarerView gratuitement'),
('de', 'new_carer.cta_try_free',    'CarerView kostenlos testen'),
('sv', 'new_carer.cta_try_free',    'Testa CarerView gratis'),
('fi', 'new_carer.cta_try_free',    'Kokeile CarerView''ia ilmaiseksi'),

('en', 'new_carer.cta_get_started', 'Get started free'),
('es', 'new_carer.cta_get_started', 'Empieza gratis'),
('it', 'new_carer.cta_get_started', 'Inizia gratuitamente'),
('fr', 'new_carer.cta_get_started', 'Commencer gratuitement'),
('de', 'new_carer.cta_get_started', 'Kostenlos starten'),
('sv', 'new_carer.cta_get_started', 'Kom igång gratis'),
('fi', 'new_carer.cta_get_started', 'Aloita ilmaiseksi'),

('en', 'new_carer.cta_sign_in',     'Already have an account? Sign in'),
('es', 'new_carer.cta_sign_in',     '¿Ya tienes cuenta? Inicia sesión'),
('it', 'new_carer.cta_sign_in',     'Hai già un account? Accedi'),
('fr', 'new_carer.cta_sign_in',     'Déjà un compte ? Se connecter'),
('de', 'new_carer.cta_sign_in',     'Bereits ein Konto? Anmelden'),
('sv', 'new_carer.cta_sign_in',     'Har du redan ett konto? Logga in'),
('fi', 'new_carer.cta_sign_in',     'Onko sinulla jo tili? Kirjaudu sisään'),

-- ── Hub page ─────────────────────────────────────────────────────────────────

('en', 'new_carer.cta_mid_hub_headline', 'CarerView puts everything in one place'),
('es', 'new_carer.cta_mid_hub_headline', 'CarerView reúne todo en un solo lugar'),
('it', 'new_carer.cta_mid_hub_headline', 'CarerView riunisce tutto in un unico posto'),
('fr', 'new_carer.cta_mid_hub_headline', 'CarerView centralise tout en un seul endroit'),
('de', 'new_carer.cta_mid_hub_headline', 'CarerView bringt alles an einem Ort zusammen'),
('sv', 'new_carer.cta_mid_hub_headline', 'CarerView samlar allt på ett ställe'),
('fi', 'new_carer.cta_mid_hub_headline', 'CarerView kokoaa kaiken yhteen paikkaan'),

('en', 'new_carer.cta_mid_hub_body', 'Your care plan, contacts, health record, and team — all in a shared space that everyone can access when it matters.'),
('es', 'new_carer.cta_mid_hub_body', 'Tu plan de cuidados, contactos, historial médico y equipo — todo en un espacio compartido accesible cuando más importa.'),
('it', 'new_carer.cta_mid_hub_body', 'Il tuo piano di cura, contatti, cartella sanitaria e team — tutto in uno spazio condiviso accessibile quando conta.'),
('fr', 'new_carer.cta_mid_hub_body', 'Votre plan de soins, contacts, dossier médical et équipe — tout dans un espace partagé accessible quand c''est important.'),
('de', 'new_carer.cta_mid_hub_body', 'Ihr Pflegeplan, Kontakte, Gesundheitsakte und Team — alles in einem gemeinsamen Bereich, der immer zugänglich ist.'),
('sv', 'new_carer.cta_mid_hub_body', 'Din vårdplan, kontakter, hälsojournaler och team — allt i ett delat utrymme som alla kan komma åt när det behövs.'),
('fi', 'new_carer.cta_mid_hub_body', 'Hoitosuunnitelmasi, yhteystiedot, terveystiedot ja tiimi — kaikki jaetussa tilassa, johon kaikki pääsevät tarvittaessa.'),

('en', 'new_carer.cta_end_hub_headline', 'Ready to bring your care plan to life?'),
('es', 'new_carer.cta_end_hub_headline', '¿Listo para dar vida a tu plan de cuidados?'),
('it', 'new_carer.cta_end_hub_headline', 'Pronto a dare vita al tuo piano di cura?'),
('fr', 'new_carer.cta_end_hub_headline', 'Prêt à concrétiser votre plan de soins ?'),
('de', 'new_carer.cta_end_hub_headline', 'Bereit, Ihren Pflegeplan in die Tat umzusetzen?'),
('sv', 'new_carer.cta_end_hub_headline', 'Redo att förverkliga din vårdplan?'),
('fi', 'new_carer.cta_end_hub_headline', 'Valmis toteuttamaan hoitosuunnitelmasi?'),

('en', 'new_carer.cta_end_hub_body', 'CarerView is the tool built for exactly this — tracking what matters, sharing with family, and staying on top of a situation that changes over time.'),
('es', 'new_carer.cta_end_hub_body', 'CarerView es la herramienta diseñada para esto — rastrear lo importante, compartir con la familia y mantenerse al día en una situación que cambia con el tiempo.'),
('it', 'new_carer.cta_end_hub_body', 'CarerView è lo strumento creato per questo — tracciare ciò che conta, condividere con la famiglia e rimanere aggiornati in una situazione che cambia nel tempo.'),
('fr', 'new_carer.cta_end_hub_body', 'CarerView est l''outil conçu pour cela — suivre ce qui compte, partager avec la famille et rester informé dans une situation qui évolue avec le temps.'),
('de', 'new_carer.cta_end_hub_body', 'CarerView ist das Tool, das genau dafür entwickelt wurde — das Wichtige verfolgen, mit der Familie teilen und in einer sich verändernden Situation den Überblick behalten.'),
('sv', 'new_carer.cta_end_hub_body', 'CarerView är verktyget byggt för exakt detta — spåra det som är viktigt, dela med familjen och hålla koll på en situation som förändras över tid.'),
('fi', 'new_carer.cta_end_hub_body', 'CarerView on työkalu, joka on rakennettu juuri tähän — tärkeiden asioiden seuranta, jakaminen perheen kanssa ja tilanteen hallinta ajan kuluessa.'),

-- ── Big Picture ───────────────────────────────────────────────────────────────

('en', 'new_carer.cta_mid_bp_headline', 'Map your care situation in CarerView'),
('es', 'new_carer.cta_mid_bp_headline', 'Mapea tu situación de cuidado en CarerView'),
('it', 'new_carer.cta_mid_bp_headline', 'Mappa la tua situazione di cura in CarerView'),
('fr', 'new_carer.cta_mid_bp_headline', 'Cartographiez votre situation de soins dans CarerView'),
('de', 'new_carer.cta_mid_bp_headline', 'Bilden Sie Ihre Pflegesituation in CarerView ab'),
('sv', 'new_carer.cta_mid_bp_headline', 'Kartlägg din vårdsituation i CarerView'),
('fi', 'new_carer.cta_mid_bp_headline', 'Kartoita hoitotilanteesi CarerView''ssa'),

('en', 'new_carer.cta_mid_bp_body', 'CarerView uses the same ADL/IADL framework as healthcare professionals — so your observations build a clear, shareable picture over time.'),
('es', 'new_carer.cta_mid_bp_body', 'CarerView usa el mismo marco ADL/IADL que los profesionales de la salud — tus observaciones construyen una imagen clara y compartible a lo largo del tiempo.'),
('it', 'new_carer.cta_mid_bp_body', 'CarerView usa lo stesso framework ADL/IADL dei professionisti sanitari — le tue osservazioni costruiscono un quadro chiaro e condivisibile nel tempo.'),
('fr', 'new_carer.cta_mid_bp_body', 'CarerView utilise le même cadre AVQ/AVDI que les professionnels de santé — vos observations construisent une image claire et partageable dans le temps.'),
('de', 'new_carer.cta_mid_bp_body', 'CarerView verwendet dasselbe ADL/IADL-Framework wie medizinische Fachkräfte — Ihre Beobachtungen ergeben ein klares, teilbares Bild über die Zeit.'),
('sv', 'new_carer.cta_mid_bp_body', 'CarerView använder samma ADL/IADL-ramverk som sjukvårdspersonal — dina observationer bygger en tydlig, delbar bild över tid.'),
('fi', 'new_carer.cta_mid_bp_body', 'CarerView käyttää samaa ADL/IADL-viitekehystä kuin terveydenhuollon ammattilaiset — havaintosi rakentavat selkeän, jaettavan kuvan ajan myötä.'),

('en', 'new_carer.cta_end_bp_headline', 'Seeing the full picture is where CarerView starts'),
('es', 'new_carer.cta_end_bp_headline', 'Ver el panorama completo es donde empieza CarerView'),
('it', 'new_carer.cta_end_bp_headline', 'Vedere il quadro completo è da dove inizia CarerView'),
('fr', 'new_carer.cta_end_bp_headline', 'Voir la situation dans son ensemble, c''est là que CarerView commence'),
('de', 'new_carer.cta_end_bp_headline', 'Das Gesamtbild zu sehen ist der Ausgangspunkt von CarerView'),
('sv', 'new_carer.cta_end_bp_headline', 'Att se hela bilden är där CarerView börjar'),
('fi', 'new_carer.cta_end_bp_headline', 'Kokonaistilanteen näkeminen on se, mistä CarerView alkaa'),

('en', 'new_carer.cta_end_bp_body', 'Create a free account to start logging what is happening, who is involved, and how things are changing — before the details scatter.'),
('es', 'new_carer.cta_end_bp_body', 'Crea una cuenta gratuita para empezar a registrar lo que ocurre, quién está involucrado y cómo cambian las cosas — antes de que los detalles se pierdan.'),
('it', 'new_carer.cta_end_bp_body', 'Crea un account gratuito per iniziare a registrare cosa succede, chi è coinvolto e come le cose cambiano — prima che i dettagli si disperdano.'),
('fr', 'new_carer.cta_end_bp_body', 'Créez un compte gratuit pour commencer à noter ce qui se passe, qui est impliqué et comment les choses évoluent — avant que les détails ne s''éparpillent.'),
('de', 'new_carer.cta_end_bp_body', 'Erstellen Sie ein kostenloses Konto, um zu erfassen, was passiert, wer beteiligt ist und wie sich die Dinge verändern — bevor die Details verloren gehen.'),
('sv', 'new_carer.cta_end_bp_body', 'Skapa ett gratis konto för att börja logga vad som händer, vem som är involverad och hur saker förändras — innan detaljerna försvinner.'),
('fi', 'new_carer.cta_end_bp_body', 'Luo ilmainen tili aloittaaksesi kirjaamaan mitä tapahtuu, ketkä ovat mukana ja miten asiat muuttuvat — ennen kuin yksityiskohdat hajoavat.'),

-- ── Care Plan ─────────────────────────────────────────────────────────────────

('en', 'new_carer.cta_mid_cp_headline', 'Build your care plan in CarerView'),
('es', 'new_carer.cta_mid_cp_headline', 'Construye tu plan de cuidados en CarerView'),
('it', 'new_carer.cta_mid_cp_headline', 'Costruisci il tuo piano di cura in CarerView'),
('fr', 'new_carer.cta_mid_cp_headline', 'Construisez votre plan de soins dans CarerView'),
('de', 'new_carer.cta_mid_cp_headline', 'Erstellen Sie Ihren Pflegeplan in CarerView'),
('sv', 'new_carer.cta_mid_cp_headline', 'Bygg din vårdplan i CarerView'),
('fi', 'new_carer.cta_mid_cp_headline', 'Rakenna hoitosuunnitelmasi CarerView''ssa'),

('en', 'new_carer.cta_mid_cp_body', 'CarerView''s care planning tools walk through each of these eight pillars — turning strategic questions into a shared, living record for your team.'),
('es', 'new_carer.cta_mid_cp_body', 'Las herramientas de planificación de CarerView recorren cada uno de estos ocho pilares — convirtiendo preguntas estratégicas en un registro compartido y vivo para tu equipo.'),
('it', 'new_carer.cta_mid_cp_body', 'Gli strumenti di pianificazione di CarerView percorrono ognuno di questi otto pilastri — trasformando domande strategiche in un registro condiviso e aggiornato per il tuo team.'),
('fr', 'new_carer.cta_mid_cp_body', 'Les outils de planification de CarerView parcourent chacun de ces huit piliers — transformant les questions stratégiques en un dossier partagé et évolutif pour votre équipe.'),
('de', 'new_carer.cta_mid_cp_body', 'CarerViews Pflegeplanungstools führen durch jeden dieser acht Pfeiler — und verwandeln strategische Fragen in eine gemeinsame, lebendige Dokumentation für Ihr Team.'),
('sv', 'new_carer.cta_mid_cp_body', 'CarerViews planeringsverktyg går igenom var och en av dessa åtta pelare — och omvandlar strategiska frågor till en delad, levande dokumentation för ditt team.'),
('fi', 'new_carer.cta_mid_cp_body', 'CarerView''n suunnittelutyökalut käyvät läpi jokaisen näistä kahdeksasta pilarista — muuttaen strategiset kysymykset jaetuksi, eläviksi tiedoiksi tiimillesi.'),

('en', 'new_carer.cta_end_cp_headline', 'A care plan works best when it lives somewhere everyone can see'),
('es', 'new_carer.cta_end_cp_headline', 'Un plan de cuidados funciona mejor cuando está en un lugar donde todos pueden verlo'),
('it', 'new_carer.cta_end_cp_headline', 'Un piano di cura funziona meglio quando tutti possono vederlo'),
('fr', 'new_carer.cta_end_cp_headline', 'Un plan de soins fonctionne mieux quand il est accessible à tous'),
('de', 'new_carer.cta_end_cp_headline', 'Ein Pflegeplan funktioniert am besten, wenn er für alle sichtbar ist'),
('sv', 'new_carer.cta_end_cp_headline', 'En vårdplan fungerar bäst när den finns tillgänglig för alla'),
('fi', 'new_carer.cta_end_cp_headline', 'Hoitosuunnitelma toimii parhaiten, kun kaikki näkevät sen'),

('en', 'new_carer.cta_end_cp_body', 'CarerView keeps your plan, observations, and team contacts in one shared space — so the plan stays current and everyone stays aligned.'),
('es', 'new_carer.cta_end_cp_body', 'CarerView mantiene tu plan, observaciones y contactos del equipo en un espacio compartido — para que el plan esté actualizado y todos estén alineados.'),
('it', 'new_carer.cta_end_cp_body', 'CarerView mantiene il tuo piano, le osservazioni e i contatti del team in un unico spazio condiviso — così il piano rimane aggiornato e tutti sono allineati.'),
('fr', 'new_carer.cta_end_cp_body', 'CarerView garde votre plan, vos observations et les contacts de votre équipe dans un espace partagé — pour que le plan reste à jour et tout le monde aligné.'),
('de', 'new_carer.cta_end_cp_body', 'CarerView hält Ihren Plan, Beobachtungen und Teamkontakte in einem gemeinsamen Bereich — damit der Plan aktuell bleibt und alle auf dem gleichen Stand sind.'),
('sv', 'new_carer.cta_end_cp_body', 'CarerView håller din plan, observationer och teamkontakter i ett delat utrymme — så att planen förblir aktuell och alla är samstämmiga.'),
('fi', 'new_carer.cta_end_cp_body', 'CarerView pitää suunnitelmasi, havainnot ja tiimin yhteystiedot yhdessä jaetussa tilassa — joten suunnitelma pysyy ajan tasalla ja kaikki pysyvät samalla sivulla.'),

-- ── Roles ─────────────────────────────────────────────────────────────────────

('en', 'new_carer.cta_mid_roles_headline', 'Assign roles your whole team can see'),
('es', 'new_carer.cta_mid_roles_headline', 'Asigna roles que todo tu equipo pueda ver'),
('it', 'new_carer.cta_mid_roles_headline', 'Assegna ruoli che tutto il tuo team può vedere'),
('fr', 'new_carer.cta_mid_roles_headline', 'Attribuez des rôles visibles par toute votre équipe'),
('de', 'new_carer.cta_mid_roles_headline', 'Weisen Sie Rollen zu, die das gesamte Team sehen kann'),
('sv', 'new_carer.cta_mid_roles_headline', 'Tilldela roller som hela ditt team kan se'),
('fi', 'new_carer.cta_mid_roles_headline', 'Määritä roolit, jotka koko tiimisi näkee'),

('en', 'new_carer.cta_mid_roles_body', 'CarerView''s team tools let you invite family members, assign responsibilities, and share updates — so nothing falls through the cracks between people.'),
('es', 'new_carer.cta_mid_roles_body', 'Las herramientas de equipo de CarerView te permiten invitar a familiares, asignar responsabilidades y compartir actualizaciones — para que nada se pierda entre personas.'),
('it', 'new_carer.cta_mid_roles_body', 'Gli strumenti di team di CarerView ti permettono di invitare familiari, assegnare responsabilità e condividere aggiornamenti — così niente cade nelle crepe tra le persone.'),
('fr', 'new_carer.cta_mid_roles_body', 'Les outils d''équipe de CarerView vous permettent d''inviter des membres de la famille, d''assigner des responsabilités et de partager des mises à jour — pour que rien ne tombe entre les mailles.'),
('de', 'new_carer.cta_mid_roles_body', 'CarerViews Teamtools ermöglichen es Ihnen, Familienmitglieder einzuladen, Verantwortlichkeiten zuzuweisen und Updates zu teilen — damit nichts zwischen den Beteiligten verloren geht.'),
('sv', 'new_carer.cta_mid_roles_body', 'CarerViews teamverktyg låter dig bjuda in familjemedlemmar, tilldela ansvar och dela uppdateringar — så att ingenting faller mellan stolarna.'),
('fi', 'new_carer.cta_mid_roles_body', 'CarerView''n tiimityökalut antavat sinulle mahdollisuuden kutsua perheenjäseniä, määrittää vastuita ja jakaa päivityksiä — jotta mikään ei jää henkilöiden väliin.'),

('en', 'new_carer.cta_end_roles_headline', 'Shared responsibility needs a shared record'),
('es', 'new_carer.cta_end_roles_headline', 'La responsabilidad compartida necesita un registro compartido'),
('it', 'new_carer.cta_end_roles_headline', 'La responsabilità condivisa ha bisogno di un registro condiviso'),
('fr', 'new_carer.cta_end_roles_headline', 'Une responsabilité partagée nécessite un dossier partagé'),
('de', 'new_carer.cta_end_roles_headline', 'Geteilte Verantwortung braucht eine gemeinsame Dokumentation'),
('sv', 'new_carer.cta_end_roles_headline', 'Delat ansvar kräver ett delat register'),
('fi', 'new_carer.cta_end_roles_headline', 'Jaettu vastuu tarvitsee jaetun kirjanpidon'),

('en', 'new_carer.cta_end_roles_body', 'CarerView keeps everyone on the same page — observations, contacts, tasks, and the care plan all in one place for the whole team.'),
('es', 'new_carer.cta_end_roles_body', 'CarerView mantiene a todos en la misma página — observaciones, contactos, tareas y el plan de cuidados en un solo lugar para todo el equipo.'),
('it', 'new_carer.cta_end_roles_body', 'CarerView tiene tutti sulla stessa pagina — osservazioni, contatti, attività e il piano di cura tutti in un unico posto per l''intero team.'),
('fr', 'new_carer.cta_end_roles_body', 'CarerView maintient tout le monde sur la même longueur d''onde — observations, contacts, tâches et le plan de soins dans un seul endroit pour toute l''équipe.'),
('de', 'new_carer.cta_end_roles_body', 'CarerView hält alle auf dem gleichen Stand — Beobachtungen, Kontakte, Aufgaben und den Pflegeplan an einem Ort für das gesamte Team.'),
('sv', 'new_carer.cta_end_roles_body', 'CarerView håller alla på samma sida — observationer, kontakter, uppgifter och vårdplanen på ett ställe för hela teamet.'),
('fi', 'new_carer.cta_end_roles_body', 'CarerView pitää kaikki samalla sivulla — havainnot, yhteystiedot, tehtävät ja hoitosuunnitelman yhdessä paikassa koko tiimille.'),

-- ── Living Arrangements ───────────────────────────────────────────────────────

('en', 'new_carer.cta_mid_living_headline', 'Document your housing decisions in CarerView'),
('es', 'new_carer.cta_mid_living_headline', 'Documenta tus decisiones de vivienda en CarerView'),
('it', 'new_carer.cta_mid_living_headline', 'Documenta le tue decisioni abitative in CarerView'),
('fr', 'new_carer.cta_mid_living_headline', 'Documentez vos décisions de logement dans CarerView'),
('de', 'new_carer.cta_mid_living_headline', 'Dokumentieren Sie Ihre Wohnentscheidungen in CarerView'),
('sv', 'new_carer.cta_mid_living_headline', 'Dokumentera dina boendebeslut i CarerView'),
('fi', 'new_carer.cta_mid_living_headline', 'Dokumentoi asumispäätöksesi CarerView''ssa'),

('en', 'new_carer.cta_mid_living_body', 'Log safety observations and track how the home environment is changing — useful data when decisions about care settings need to be revisited.'),
('es', 'new_carer.cta_mid_living_body', 'Registra observaciones de seguridad y rastrea cómo cambia el entorno del hogar — datos útiles cuando hay que revisar decisiones sobre el entorno de cuidado.'),
('it', 'new_carer.cta_mid_living_body', 'Registra osservazioni sulla sicurezza e traccia come cambia l''ambiente domestico — dati utili quando bisogna rivedere le decisioni sull''ambiente di cura.'),
('fr', 'new_carer.cta_mid_living_body', 'Notez les observations de sécurité et suivez l''évolution de l''environnement domestique — des données utiles quand il faut reconsidérer les décisions sur le cadre de soins.'),
('de', 'new_carer.cta_mid_living_body', 'Erfassen Sie Sicherheitsbeobachtungen und verfolgen Sie, wie sich das häusliche Umfeld verändert — nützliche Daten, wenn Entscheidungen über Pflegesettings überdacht werden müssen.'),
('sv', 'new_carer.cta_mid_living_body', 'Logga säkerhetsobservationer och följ hur hemmiljön förändras — användbar data när beslut om vårdinrättningar behöver omprövas.'),
('fi', 'new_carer.cta_mid_living_body', 'Kirjaa turvallisuushavaintoja ja seuraa kodin ympäristön muutoksia — hyödyllistä tietoa, kun hoitoympäristöä koskevia päätöksiä on tarkistettava.'),

('en', 'new_carer.cta_end_living_headline', 'Track how living arrangements are working over time'),
('es', 'new_carer.cta_end_living_headline', 'Rastrea cómo funcionan los arreglos de vivienda con el tiempo'),
('it', 'new_carer.cta_end_living_headline', 'Monitora come funzionano le sistemazioni abitative nel tempo'),
('fr', 'new_carer.cta_end_living_headline', 'Suivez l''évolution de l''efficacité des arrangements de logement'),
('de', 'new_carer.cta_end_living_headline', 'Verfolgen Sie, wie Wohnvereinbarungen im Laufe der Zeit funktionieren'),
('sv', 'new_carer.cta_end_living_headline', 'Följ hur boendeförhållandena fungerar över tid'),
('fi', 'new_carer.cta_end_living_headline', 'Seuraa, kuinka asumisjärjestelyt toimivat ajan myötä'),

('en', 'new_carer.cta_end_living_body', 'CarerView''s observation tools let you log what you notice at home — building an evidence base that makes future housing decisions much clearer.'),
('es', 'new_carer.cta_end_living_body', 'Las herramientas de observación de CarerView te permiten registrar lo que notas en casa — construyendo una base de evidencia que hace las futuras decisiones de vivienda mucho más claras.'),
('it', 'new_carer.cta_end_living_body', 'Gli strumenti di osservazione di CarerView ti permettono di registrare cosa noti a casa — costruendo una base di prove che rende molto più chiare le future decisioni abitative.'),
('fr', 'new_carer.cta_end_living_body', 'Les outils d''observation de CarerView vous permettent de noter ce que vous constatez à domicile — constituant une base factuelle qui clarifie les futures décisions de logement.'),
('de', 'new_carer.cta_end_living_body', 'CarerViews Beobachtungstools ermöglichen es Ihnen, zu erfassen, was Sie zu Hause bemerken — und so eine Wissensbasis aufzubauen, die zukünftige Wohnentscheidungen viel klarer macht.'),
('sv', 'new_carer.cta_end_living_body', 'CarerViews observationsverktyg låter dig logga vad du märker hemma — och bygger en faktabas som gör framtida boendebeslut mycket tydligare.'),
('fi', 'new_carer.cta_end_living_body', 'CarerView''n havainnointityökalut antavat sinulle mahdollisuuden kirjata kotona huomaamiasi asioita — rakentaen näyttöpohjan, joka selkeyttää tulevia asumispäätöksiä.'),

-- ── Documents & Authority ─────────────────────────────────────────────────────

('en', 'new_carer.cta_mid_docs_headline', 'Keep your documents checklist in one secure place'),
('es', 'new_carer.cta_mid_docs_headline', 'Mantén tu lista de documentos en un lugar seguro'),
('it', 'new_carer.cta_mid_docs_headline', 'Tieni la tua lista documenti in un unico posto sicuro'),
('fr', 'new_carer.cta_mid_docs_headline', 'Gardez votre liste de documents dans un endroit sécurisé'),
('de', 'new_carer.cta_mid_docs_headline', 'Bewahren Sie Ihre Dokumentencheckliste an einem sicheren Ort auf'),
('sv', 'new_carer.cta_mid_docs_headline', 'Ha din dokumentchecklista på ett säkert ställe'),
('fi', 'new_carer.cta_mid_docs_headline', 'Pidä asiakirjaluettelosi yhdessä turvallisessa paikassa'),

('en', 'new_carer.cta_mid_docs_body', 'CarerView''s Memory Book stores key contacts, documents, and legal records — accessible by the whole team, even in an emergency.'),
('es', 'new_carer.cta_mid_docs_body', 'El Libro de Memoria de CarerView almacena contactos clave, documentos y registros legales — accesibles para todo el equipo, incluso en una emergencia.'),
('it', 'new_carer.cta_mid_docs_body', 'Il Libro dei Ricordi di CarerView archivia contatti chiave, documenti e registri legali — accessibili da tutto il team, anche in un''emergenza.'),
('fr', 'new_carer.cta_mid_docs_body', 'Le Livre de Mémoire de CarerView stocke les contacts clés, documents et dossiers juridiques — accessibles par toute l''équipe, même en cas d''urgence.'),
('de', 'new_carer.cta_mid_docs_body', 'CarerViews Memory Book speichert wichtige Kontakte, Dokumente und Rechtsakten — zugänglich für das gesamte Team, auch im Notfall.'),
('sv', 'new_carer.cta_mid_docs_body', 'CarerViews Memory Book lagrar viktiga kontakter, dokument och juridiska handlingar — tillgängliga för hela teamet, även i en nödsituation.'),
('fi', 'new_carer.cta_mid_docs_body', 'CarerView''n Muistikirja tallentaa tärkeimmät yhteystiedot, asiakirjat ja juridiset tiedot — koko tiimin saatavilla, myös hätätilanteessa.'),

('en', 'new_carer.cta_end_docs_headline', 'Don''t leave important documents scattered'),
('es', 'new_carer.cta_end_docs_headline', 'No dejes documentos importantes dispersos'),
('it', 'new_carer.cta_end_docs_headline', 'Non lasciare documenti importanti sparsi'),
('fr', 'new_carer.cta_end_docs_headline', 'Ne laissez pas vos documents importants éparpillés'),
('de', 'new_carer.cta_end_docs_headline', 'Lassen Sie wichtige Dokumente nicht verstreut'),
('sv', 'new_carer.cta_end_docs_headline', 'Lämna inte viktiga dokument utspridda'),
('fi', 'new_carer.cta_end_docs_headline', 'Älä jätä tärkeitä asiakirjoja hajallaan'),

('en', 'new_carer.cta_end_docs_body', 'CarerView gives you a structured place to record what documents exist, where they are, and who has authority — reducing risk when it matters most.'),
('es', 'new_carer.cta_end_docs_body', 'CarerView te da un lugar estructurado para registrar qué documentos existen, dónde están y quién tiene autoridad — reduciendo el riesgo cuando más importa.'),
('it', 'new_carer.cta_end_docs_body', 'CarerView ti dà un posto strutturato per registrare quali documenti esistono, dove si trovano e chi ha l''autorità — riducendo il rischio quando conta di più.'),
('fr', 'new_carer.cta_end_docs_body', 'CarerView vous offre un endroit structuré pour noter quels documents existent, où ils se trouvent et qui a l''autorité — réduisant les risques quand c''est le plus important.'),
('de', 'new_carer.cta_end_docs_body', 'CarerView bietet Ihnen einen strukturierten Ort, um zu erfassen, welche Dokumente existieren, wo sie sich befinden und wer die Autorität hat — was das Risiko in kritischen Momenten reduziert.'),
('sv', 'new_carer.cta_end_docs_body', 'CarerView ger dig en strukturerad plats för att registrera vilka dokument som finns, var de är och vem som har behörighet — vilket minskar risken när det är som viktigast.'),
('fi', 'new_carer.cta_end_docs_body', 'CarerView antaa sinulle jäsennellyn paikan kirjata, mitä asiakirjoja on olemassa, missä ne ovat ja kenellä on valtuudet — vähentäen riskiä silloin kun se on tärkeintä.'),

-- ── Health Coordination ───────────────────────────────────────────────────────

('en', 'new_carer.cta_mid_health_headline', 'One system for health records, in CarerView'),
('es', 'new_carer.cta_mid_health_headline', 'Un sistema para registros de salud, en CarerView'),
('it', 'new_carer.cta_mid_health_headline', 'Un sistema per i dati sanitari, in CarerView'),
('fr', 'new_carer.cta_mid_health_headline', 'Un système pour les dossiers de santé, dans CarerView'),
('de', 'new_carer.cta_mid_health_headline', 'Ein System für Gesundheitsdaten, in CarerView'),
('sv', 'new_carer.cta_mid_health_headline', 'Ett system för hälsojournaler, i CarerView'),
('fi', 'new_carer.cta_mid_health_headline', 'Yksi järjestelmä terveystiedoille, CarerView''ssa'),

('en', 'new_carer.cta_mid_health_body', 'Log observations using the same ADL/IADL categories healthcare professionals use — so your records are meaningful at every appointment.'),
('es', 'new_carer.cta_mid_health_body', 'Registra observaciones usando las mismas categorías ADL/IADL que usan los profesionales de salud — para que tus registros sean significativos en cada cita.'),
('it', 'new_carer.cta_mid_health_body', 'Registra osservazioni usando le stesse categorie ADL/IADL usate dai professionisti sanitari — così i tuoi dati sono significativi ad ogni visita.'),
('fr', 'new_carer.cta_mid_health_body', 'Consignez des observations en utilisant les mêmes catégories AVQ/AVDI que les professionnels de santé — pour que vos dossiers aient du sens à chaque rendez-vous.'),
('de', 'new_carer.cta_mid_health_body', 'Erfassen Sie Beobachtungen mit denselben ADL/IADL-Kategorien, die medizinische Fachkräfte verwenden — damit Ihre Daten bei jedem Termin aussagekräftig sind.'),
('sv', 'new_carer.cta_mid_health_body', 'Logga observationer med samma ADL/IADL-kategorier som sjukvårdspersonal använder — så att dina journaler är meningsfulla vid varje besök.'),
('fi', 'new_carer.cta_mid_health_body', 'Kirjaa havaintoja käyttäen samoja ADL/IADL-kategorioita kuin terveydenhuollon ammattilaiset — jotta tietosi ovat merkityksellisiä jokaisella käynnillä.'),

('en', 'new_carer.cta_end_health_headline', 'Your care record belongs in CarerView, not a notebook'),
('es', 'new_carer.cta_end_health_headline', 'Tu registro de cuidados pertenece a CarerView, no a un cuaderno'),
('it', 'new_carer.cta_end_health_headline', 'Il tuo registro di cura appartiene a CarerView, non a un quaderno'),
('fr', 'new_carer.cta_end_health_headline', 'Votre dossier de soins appartient à CarerView, pas à un carnet'),
('de', 'new_carer.cta_end_health_headline', 'Ihre Pflegedokumentation gehört in CarerView, nicht in ein Notizbuch'),
('sv', 'new_carer.cta_end_health_headline', 'Din vårdjournal hör hemma i CarerView, inte i ett anteckningsblock'),
('fi', 'new_carer.cta_end_health_headline', 'Hoitokirjauksesi kuuluu CarerView''hun, ei muistikirjaan'),

('en', 'new_carer.cta_end_health_body', 'Create a free account and start building a dated, shareable health record — one your whole care team can access and build on together.'),
('es', 'new_carer.cta_end_health_body', 'Crea una cuenta gratuita y empieza a construir un registro de salud fechado y compartible — uno al que todo tu equipo de cuidado pueda acceder y enriquecer juntos.'),
('it', 'new_carer.cta_end_health_body', 'Crea un account gratuito e inizia a costruire un registro sanitario datato e condivisibile — a cui tutto il tuo team di cura può accedere e contribuire insieme.'),
('fr', 'new_carer.cta_end_health_body', 'Créez un compte gratuit et commencez à constituer un dossier médical daté et partageable — que toute votre équipe de soins peut consulter et enrichir ensemble.'),
('de', 'new_carer.cta_end_health_body', 'Erstellen Sie ein kostenloses Konto und beginnen Sie, eine datierte, teilbare Gesundheitsdokumentation aufzubauen — auf die Ihr gesamtes Pflegeteam zugreifen und gemeinsam aufbauen kann.'),
('sv', 'new_carer.cta_end_health_body', 'Skapa ett gratis konto och börja bygga en daterad, delbar hälsojournal — en som hela ditt vårdteam kan komma åt och bygga vidare på tillsammans.'),
('fi', 'new_carer.cta_end_health_body', 'Luo ilmainen tili ja aloita päivätyn, jaettavan terveyskirjanpidon rakentaminen — sellaisen, johon koko hoitotiimisi pääsee käsiksi ja jota voidaan rakentaa yhdessä.'),

-- ── Sustainability ────────────────────────────────────────────────────────────

('en', 'new_carer.cta_mid_sustain_headline', 'Sustainable caring needs structure, not just willpower'),
('es', 'new_carer.cta_mid_sustain_headline', 'El cuidado sostenible necesita estructura, no solo fuerza de voluntad'),
('it', 'new_carer.cta_mid_sustain_headline', 'La cura sostenibile ha bisogno di struttura, non solo di forza di volontà'),
('fr', 'new_carer.cta_mid_sustain_headline', 'Des soins durables nécessitent de la structure, pas seulement de la volonté'),
('de', 'new_carer.cta_mid_sustain_headline', 'Nachhaltiges Pflegen braucht Struktur, nicht nur Willenskraft'),
('sv', 'new_carer.cta_mid_sustain_headline', 'Hållbar omsorg kräver struktur, inte bara viljestyrka'),
('fi', 'new_carer.cta_mid_sustain_headline', 'Kestävä hoitaminen tarvitsee rakennetta, ei pelkkää tahdonvoimaa'),

('en', 'new_carer.cta_mid_sustain_body', 'CarerView gives your care team a shared record, clear responsibilities, and a place to flag what''s changing — reducing the invisible weight on one person.'),
('es', 'new_carer.cta_mid_sustain_body', 'CarerView da a tu equipo de cuidado un registro compartido, responsabilidades claras y un lugar para señalar lo que cambia — reduciendo el peso invisible sobre una sola persona.'),
('it', 'new_carer.cta_mid_sustain_body', 'CarerView dà al tuo team di cura un registro condiviso, responsabilità chiare e un posto per segnalare cosa sta cambiando — riducendo il peso invisibile su una sola persona.'),
('fr', 'new_carer.cta_mid_sustain_body', 'CarerView offre à votre équipe de soins un dossier partagé, des responsabilités claires et un endroit pour signaler les changements — réduisant le poids invisible sur une seule personne.'),
('de', 'new_carer.cta_mid_sustain_body', 'CarerView gibt Ihrem Pflegeteam eine gemeinsame Dokumentation, klare Verantwortlichkeiten und einen Ort, um zu melden, was sich verändert — und reduziert die unsichtbare Last auf einer Person.'),
('sv', 'new_carer.cta_mid_sustain_body', 'CarerView ger ditt vårdteam ett delat register, tydliga ansvarsområden och en plats för att flagga vad som förändras — minskar den osynliga bördan på en person.'),
('fi', 'new_carer.cta_mid_sustain_body', 'CarerView antaa hoitotiimillesi jaetun kirjanpidon, selkeät vastuut ja paikan merkitä muutoksia — vähentäen yhdelle henkilölle kohdistuvaa näkymätöntä taakkaa.'),

('en', 'new_carer.cta_end_sustain_headline', 'A tool that carries some of the weight with you'),
('es', 'new_carer.cta_end_sustain_headline', 'Una herramienta que lleva parte del peso contigo'),
('it', 'new_carer.cta_end_sustain_headline', 'Uno strumento che porta parte del peso con te'),
('fr', 'new_carer.cta_end_sustain_headline', 'Un outil qui porte une partie du poids avec vous'),
('de', 'new_carer.cta_end_sustain_headline', 'Ein Tool, das einen Teil der Last mit Ihnen trägt'),
('sv', 'new_carer.cta_end_sustain_headline', 'Ett verktyg som bär en del av bördan med dig'),
('fi', 'new_carer.cta_end_sustain_headline', 'Työkalu, joka kantaa osan taakasta kanssasi'),

('en', 'new_carer.cta_end_sustain_body', 'CarerView organises what you''re tracking, shares it with your team, and keeps a dated record — so the full picture isn''t just in your head.'),
('es', 'new_carer.cta_end_sustain_body', 'CarerView organiza lo que rastreas, lo comparte con tu equipo y mantiene un registro fechado — para que el panorama completo no esté solo en tu cabeza.'),
('it', 'new_carer.cta_end_sustain_body', 'CarerView organizza ciò che stai monitorando, lo condivide con il tuo team e mantiene un registro datato — così il quadro completo non è solo nella tua testa.'),
('fr', 'new_carer.cta_end_sustain_body', 'CarerView organise ce que vous suivez, le partage avec votre équipe et conserve un dossier daté — pour que la situation complète ne soit pas seulement dans votre tête.'),
('de', 'new_carer.cta_end_sustain_body', 'CarerView organisiert, was Sie verfolgen, teilt es mit Ihrem Team und führt eine datierte Dokumentation — damit das Gesamtbild nicht nur in Ihrem Kopf ist.'),
('sv', 'new_carer.cta_end_sustain_body', 'CarerView organiserar vad du spårar, delar det med ditt team och håller ett daterat register — så att hela bilden inte bara finns i ditt huvud.'),
('fi', 'new_carer.cta_end_sustain_body', 'CarerView järjestää sen, mitä seuraat, jakaa sen tiimisi kanssa ja pitää päivättyä kirjanpitoa — joten koko kuva ei ole vain päässäsi.'),

-- ── Review Plan ───────────────────────────────────────────────────────────────

('en', 'new_carer.cta_mid_review_headline', 'Reviews are easier when your record is already there'),
('es', 'new_carer.cta_mid_review_headline', 'Las revisiones son más fáciles cuando tu registro ya está ahí'),
('it', 'new_carer.cta_mid_review_headline', 'Le revisioni sono più facili quando il tuo registro è già lì'),
('fr', 'new_carer.cta_mid_review_headline', 'Les révisions sont plus faciles quand votre dossier est déjà là'),
('de', 'new_carer.cta_mid_review_headline', 'Überprüfungen sind einfacher, wenn Ihre Dokumentation bereits vorhanden ist'),
('sv', 'new_carer.cta_mid_review_headline', 'Översyner är enklare när ditt register redan finns där'),
('fi', 'new_carer.cta_mid_review_headline', 'Tarkistukset ovat helpompia, kun kirjauksesi on jo olemassa'),

('en', 'new_carer.cta_mid_review_body', 'CarerView''s observation log gives you a dated, searchable history — so when a review comes around, you''re not relying on memory.'),
('es', 'new_carer.cta_mid_review_body', 'El registro de observaciones de CarerView te da un historial fechado y con búsqueda — para que cuando llegue una revisión, no tengas que depender de la memoria.'),
('it', 'new_carer.cta_mid_review_body', 'Il registro osservazioni di CarerView ti dà una cronologia datata e ricercabile — così quando arriva una revisione, non ti affidi alla memoria.'),
('fr', 'new_carer.cta_mid_review_body', 'Le journal d''observations de CarerView vous donne un historique daté et consultable — pour que lors d''une révision, vous ne dépendiez pas de votre mémoire.'),
('de', 'new_carer.cta_mid_review_body', 'CarerViews Beobachtungsprotokoll gibt Ihnen eine datierte, durchsuchbare Geschichte — damit Sie bei einer Überprüfung nicht auf Ihr Gedächtnis angewiesen sind.'),
('sv', 'new_carer.cta_mid_review_body', 'CarerViews observationslogg ger dig en daterad, sökbar historik — så att när en översyn kommer, behöver du inte lita på minnet.'),
('fi', 'new_carer.cta_mid_review_body', 'CarerView''n havainnointiloki antaa sinulle päivätyn, haettavan historian — joten kun tarkistus tulee, et ole muistisi varassa.'),

('en', 'new_carer.cta_end_review_headline', 'CarerView grows with your care situation'),
('es', 'new_carer.cta_end_review_headline', 'CarerView crece con tu situación de cuidado'),
('it', 'new_carer.cta_end_review_headline', 'CarerView cresce con la tua situazione di cura'),
('fr', 'new_carer.cta_end_review_headline', 'CarerView évolue avec votre situation de soins'),
('de', 'new_carer.cta_end_review_headline', 'CarerView wächst mit Ihrer Pflegesituation'),
('sv', 'new_carer.cta_end_review_headline', 'CarerView växer med din vårdsituation'),
('fi', 'new_carer.cta_end_review_headline', 'CarerView kasvaa hoitotilanteesi mukana'),

('en', 'new_carer.cta_end_review_body', 'As care needs change, your CarerView record changes with them — giving you a clear, shared history to make every future review easier.'),
('es', 'new_carer.cta_end_review_body', 'A medida que cambian las necesidades de cuidado, tu registro de CarerView cambia con ellas — dándote un historial claro y compartido para facilitar cada revisión futura.'),
('it', 'new_carer.cta_end_review_body', 'Man mano che le esigenze di cura cambiano, il tuo registro CarerView cambia con loro — dandoti una storia chiara e condivisa per rendere ogni revisione futura più semplice.'),
('fr', 'new_carer.cta_end_review_body', 'À mesure que les besoins de soins évoluent, votre dossier CarerView évolue avec eux — vous offrant un historique clair et partagé pour faciliter chaque révision future.'),
('de', 'new_carer.cta_end_review_body', 'Wenn sich die Pflegebedürfnisse ändern, ändert sich Ihre CarerView-Dokumentation mit ihnen — und gibt Ihnen eine klare, gemeinsame Geschichte, die jede zukünftige Überprüfung erleichtert.'),
('sv', 'new_carer.cta_end_review_body', 'När vårdbehoven förändras, förändras ditt CarerView-register med dem — vilket ger dig en tydlig, delad historik för att göra varje framtida översyn enklare.'),
('fi', 'new_carer.cta_end_review_body', 'Kun hoitotarpeet muuttuvat, CarerView-kirjauksesi muuttuu niiden mukana — antaen sinulle selkeän, jaetun historian, joka helpottaa jokaista tulevaa tarkistusta.')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
