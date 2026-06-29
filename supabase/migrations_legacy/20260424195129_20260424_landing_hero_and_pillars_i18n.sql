/*
  # Landing Page — Hero Rewrite and Four-Pillar Section i18n Keys

  Updates the hero headline, body, and CTA to lead with planning/coordination.
  Adds four-pillar section keys: Plan (1st), Coordinate (2nd), Observe (3rd), Update & Improve (4th).
  Also adds the hero pillar tagline.

  All 7 locales: en, es, it, fr, de, sv, fi
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES

-- Hero rewrite
('en', 'landing.hero_title', 'Caregiving needs a plan. CarerView builds it with you.'),
('es', 'landing.hero_title', 'El cuidado necesita un plan. CarerView lo construye contigo.'),
('it', 'landing.hero_title', 'L''assistenza ha bisogno di un piano. CarerView lo costruisce con te.'),
('fr', 'landing.hero_title', 'Les soins nécessitent un plan. CarerView le construit avec vous.'),
('de', 'landing.hero_title', 'Pflege braucht einen Plan. CarerView erstellt ihn mit Ihnen.'),
('sv', 'landing.hero_title', 'Omvårdnad kräver en plan. CarerView bygger den med dig.'),
('fi', 'landing.hero_title', 'Hoitaminen tarvitsee suunnitelman. CarerView rakentaa sen kanssasi.'),

('en', 'landing.hero_body', 'Most families start caregiving without a plan — unclear who holds medical authority, who steps in when the primary carer is exhausted, or what the person being cared for actually prefers. CarerView gives your team a structured plan, shared observations, and a feedback loop that keeps everyone coordinated and your loved one at the centre.'),
('es', 'landing.hero_body', 'La mayoría de las familias empiezan a cuidar sin un plan: sin saber quién tiene autoridad médica, quién interviene cuando el cuidador principal está agotado, o qué prefiere realmente la persona cuidada. CarerView da a tu equipo un plan estructurado, observaciones compartidas y un ciclo de retroalimentación que mantiene a todos coordinados y a tu ser querido en el centro.'),
('it', 'landing.hero_body', 'La maggior parte delle famiglie inizia ad assistere senza un piano — non è chiaro chi detiene l''autorità medica, chi interviene quando il caregiver principale è esausto, o cosa preferisce davvero la persona assistita. CarerView dà al tuo team un piano strutturato, osservazioni condivise e un ciclo di feedback che mantiene tutti coordinati e il tuo caro al centro.'),
('fr', 'landing.hero_body', 'La plupart des familles commencent à s''occuper d''un proche sans plan — sans savoir qui détient l''autorité médicale, qui intervient quand l''aidant principal est épuisé, ou ce que la personne aidée préfère réellement. CarerView donne à votre équipe un plan structuré, des observations partagées et une boucle de rétroaction qui maintient tout le monde coordonné.'),
('de', 'landing.hero_body', 'Die meisten Familien beginnen die Pflege ohne einen Plan — unklar, wer die medizinische Vollmacht hat, wer einspringt, wenn die Hauptpflegeperson erschöpft ist, oder was die gepflegte Person wirklich möchte. CarerView gibt Ihrem Team einen strukturierten Plan, gemeinsame Beobachtungen und eine Rückkopplungsschleife.'),
('sv', 'landing.hero_body', 'De flesta familjer börjar vårda utan en plan — oklart vem som har medicinsk behörighet, vem som träder in när den primära vårdaren är utmattad, eller vad den omvårdade personen faktiskt föredrar. CarerView ger ditt team en strukturerad plan, delade observationer och en återkopplingsloop.'),
('fi', 'landing.hero_body', 'Useimmat perheet alkavat hoitaa ilman suunnitelmaa — epäselvää kuka pitää lääketieteellistä valtuutusta, kuka astuu mukaan kun ensisijainen hoitaja on uupunut, tai mitä hoidettava henkilö todella haluaa. CarerView antaa tiimillesi jäsennellyn suunnitelman, jaetut havainnot ja palautesilmukan.'),

('en', 'landing.hero_cta_primary', 'Build your care plan'),
('es', 'landing.hero_cta_primary', 'Construye tu plan de cuidados'),
('it', 'landing.hero_cta_primary', 'Costruisci il tuo piano di cura'),
('fr', 'landing.hero_cta_primary', 'Construisez votre plan de soins'),
('de', 'landing.hero_cta_primary', 'Pflegeplan erstellen'),
('sv', 'landing.hero_cta_primary', 'Bygg din omvårdnadsplan'),
('fi', 'landing.hero_cta_primary', 'Rakenna hoitosuunnitelmasi'),

('en', 'landing.hero_cta_secondary', 'See how CarerView works'),
('es', 'landing.hero_cta_secondary', 'Ver cómo funciona CarerView'),
('it', 'landing.hero_cta_secondary', 'Scopri come funziona CarerView'),
('fr', 'landing.hero_cta_secondary', 'Voir comment fonctionne CarerView'),
('de', 'landing.hero_cta_secondary', 'So funktioniert CarerView'),
('sv', 'landing.hero_cta_secondary', 'Se hur CarerView fungerar'),
('fi', 'landing.hero_cta_secondary', 'Katso miten CarerView toimii'),

('en', 'landing.hero_pillar_tagline', 'Plan · Coordinate · Observe · Improve'),
('es', 'landing.hero_pillar_tagline', 'Planificar · Coordinar · Observar · Mejorar'),
('it', 'landing.hero_pillar_tagline', 'Pianifica · Coordina · Osserva · Migliora'),
('fr', 'landing.hero_pillar_tagline', 'Planifier · Coordonner · Observer · Améliorer'),
('de', 'landing.hero_pillar_tagline', 'Planen · Koordinieren · Beobachten · Verbessern'),
('sv', 'landing.hero_pillar_tagline', 'Planera · Koordinera · Observera · Förbättra'),
('fi', 'landing.hero_pillar_tagline', 'Suunnittele · Koordinoi · Havainnoi · Paranna'),

-- Four-pillar section heading
('en', 'landing.pillars_eyebrow', 'The CarerView system'),
('es', 'landing.pillars_eyebrow', 'El sistema CarerView'),
('it', 'landing.pillars_eyebrow', 'Il sistema CarerView'),
('fr', 'landing.pillars_eyebrow', 'Le système CarerView'),
('de', 'landing.pillars_eyebrow', 'Das CarerView-System'),
('sv', 'landing.pillars_eyebrow', 'CarerView-systemet'),
('fi', 'landing.pillars_eyebrow', 'CarerView-järjestelmä'),

('en', 'landing.pillars_title', 'A complete system for family caregiving'),
('es', 'landing.pillars_title', 'Un sistema completo para el cuidado familiar'),
('it', 'landing.pillars_title', 'Un sistema completo per l''assistenza familiare'),
('fr', 'landing.pillars_title', 'Un système complet pour les aidants familiaux'),
('de', 'landing.pillars_title', 'Ein vollständiges System für die Familienpflege'),
('sv', 'landing.pillars_title', 'Ett komplett system för familjevård'),
('fi', 'landing.pillars_title', 'Täydellinen järjestelmä perhehoidolle'),

('en', 'landing.pillars_body', 'CarerView brings together four things every care team needs — a clear plan, coordinated team, ongoing observations, and a way to keep the plan current as things change.'),
('es', 'landing.pillars_body', 'CarerView reúne las cuatro cosas que todo equipo de cuidado necesita: un plan claro, un equipo coordinado, observaciones continuas y una forma de mantener el plan actualizado a medida que las cosas cambian.'),
('it', 'landing.pillars_body', 'CarerView riunisce le quattro cose di cui ogni team di cura ha bisogno: un piano chiaro, un team coordinato, osservazioni continue e un modo per mantenere il piano aggiornato man mano che le cose cambiano.'),
('fr', 'landing.pillars_body', 'CarerView rassemble les quatre éléments dont chaque équipe de soins a besoin : un plan clair, une équipe coordonnée, des observations continues et un moyen de maintenir le plan à jour à mesure que les choses évoluent.'),
('de', 'landing.pillars_body', 'CarerView bringt die vier Dinge zusammen, die jedes Pflegeteam braucht: einen klaren Plan, ein koordiniertes Team, laufende Beobachtungen und eine Möglichkeit, den Plan aktuell zu halten, wenn sich die Dinge ändern.'),
('sv', 'landing.pillars_body', 'CarerView samlar de fyra saker varje vårdteam behöver — en tydlig plan, ett koordinerat team, löpande observationer och ett sätt att hålla planen aktuell när saker förändras.'),
('fi', 'landing.pillars_body', 'CarerView kokoaa yhteen neljä asiaa, joita jokainen hoitotiimi tarvitsee — selkeän suunnitelman, koordinoidun tiimin, jatkuvat havainnot ja tavan pitää suunnitelma ajan tasalla kun asiat muuttuvat.'),

-- Pillar 1: Plan
('en', 'landing.pillar_plan_title', 'Plan'),
('es', 'landing.pillar_plan_title', 'Planificar'),
('it', 'landing.pillar_plan_title', 'Pianifica'),
('fr', 'landing.pillar_plan_title', 'Planifier'),
('de', 'landing.pillar_plan_title', 'Planen'),
('sv', 'landing.pillar_plan_title', 'Planera'),
('fi', 'landing.pillar_plan_title', 'Suunnittele'),

('en', 'landing.pillar_plan_subtitle', 'Build the team''s operating plan'),
('es', 'landing.pillar_plan_subtitle', 'Construye el plan operativo del equipo'),
('it', 'landing.pillar_plan_subtitle', 'Costruisci il piano operativo del team'),
('fr', 'landing.pillar_plan_subtitle', 'Construisez le plan opérationnel de l''équipe'),
('de', 'landing.pillar_plan_subtitle', 'Erstellen Sie den Betriebsplan des Teams'),
('sv', 'landing.pillar_plan_subtitle', 'Bygg teamets handlingsplan'),
('fi', 'landing.pillar_plan_subtitle', 'Rakenna tiimin toimintasuunnitelma'),

('en', 'landing.pillar_plan_b1', 'Six structured sections: situation, authority, responsibilities, living arrangement, sustainability, and review'),
('es', 'landing.pillar_plan_b1', 'Seis secciones estructuradas: situación, autoridad, responsabilidades, arreglo de vida, sostenibilidad y revisión'),
('it', 'landing.pillar_plan_b1', 'Sei sezioni strutturate: situazione, autorità, responsabilità, sistemazione abitativa, sostenibilità e revisione'),
('fr', 'landing.pillar_plan_b1', 'Six sections structurées : situation, autorité, responsabilités, arrangement de vie, durabilité et révision'),
('de', 'landing.pillar_plan_b1', 'Sechs strukturierte Bereiche: Situation, Vollmacht, Verantwortlichkeiten, Wohnarrangement, Nachhaltigkeit und Überprüfung'),
('sv', 'landing.pillar_plan_b1', 'Sex strukturerade avsnitt: situation, behörighet, ansvar, boendesituation, hållbarhet och granskning'),
('fi', 'landing.pillar_plan_b1', 'Kuusi jäsenneltyä osiota: tilanne, valtuutus, vastuut, asumisjärjestely, kestävyys ja arviointi'),

('en', 'landing.pillar_plan_b2', 'Decision Engine flags gaps before they become crises — "No backup caregiver identified" or "Medical authority not documented"'),
('es', 'landing.pillar_plan_b2', 'El motor de decisiones detecta vacíos antes de que se conviertan en crisis: "Sin cuidador de respaldo identificado" o "Autoridad médica no documentada"'),
('it', 'landing.pillar_plan_b2', 'Il motore decisionale segnala le lacune prima che diventino crisi: "Nessun caregiver di riserva identificato" o "Autorità medica non documentata"'),
('fr', 'landing.pillar_plan_b2', 'Le moteur de décision signale les lacunes avant qu''elles ne deviennent des crises : "Aucun aidant de secours identifié" ou "Autorité médicale non documentée"'),
('de', 'landing.pillar_plan_b2', 'Die Entscheidungs-Engine erkennt Lücken, bevor sie zu Krisen werden: "Keine Vertretungspflegeperson identifiziert" oder "Medizinische Vollmacht nicht dokumentiert"'),
('sv', 'landing.pillar_plan_b2', 'Beslutsmotorn flaggar luckor innan de blir kriser — "Ingen reservvårdare identifierad" eller "Medicinsk behörighet inte dokumenterad"'),
('fi', 'landing.pillar_plan_b2', 'Päätösmoottori merkitsee puutteet ennen kuin niistä tulee kriisejä — "Varahoitajaa ei tunnistettu" tai "Lääketieteellistä valtuutusta ei dokumentoitu"'),

('en', 'landing.pillar_plan_b3', 'Caregiver sustainability is part of the plan — stress levels, backup cover, and respite are tracked alongside the care recipient''s needs'),
('es', 'landing.pillar_plan_b3', 'La sostenibilidad del cuidador es parte del plan: niveles de estrés, cobertura de respaldo y respiro se rastrean junto con las necesidades de la persona cuidada'),
('it', 'landing.pillar_plan_b3', 'La sostenibilità del caregiver fa parte del piano: livelli di stress, copertura di riserva e sollievo sono monitorati insieme alle esigenze della persona assistita'),
('fr', 'landing.pillar_plan_b3', 'La durabilité de l''aidant fait partie du plan — les niveaux de stress, la couverture de secours et le répit sont suivis parallèlement aux besoins de la personne aidée'),
('de', 'landing.pillar_plan_b3', 'Die Nachhaltigkeit der Pflegeperson ist Teil des Plans — Stressniveaus, Vertretungsabdeckung und Auszeiten werden zusammen mit den Bedürfnissen der gepflegten Person verfolgt'),
('sv', 'landing.pillar_plan_b3', 'Vårdarens hållbarhet är en del av planen — stressnivåer, reservtäckning och avlastning spåras parallellt med den omvårdades behov'),
('fi', 'landing.pillar_plan_b3', 'Hoitajan kestävyys on osa suunnitelmaa — stressitasot, varakattavuus ja lepo seurataan hoidettavan tarpeiden rinnalla'),

-- Pillar 2: Coordinate
('en', 'landing.pillar_coord_title', 'Coordinate'),
('es', 'landing.pillar_coord_title', 'Coordinar'),
('it', 'landing.pillar_coord_title', 'Coordina'),
('fr', 'landing.pillar_coord_title', 'Coordonner'),
('de', 'landing.pillar_coord_title', 'Koordinieren'),
('sv', 'landing.pillar_coord_title', 'Koordinera'),
('fi', 'landing.pillar_coord_title', 'Koordinoi'),

('en', 'landing.pillar_coord_subtitle', 'Bring the whole team onto the same page'),
('es', 'landing.pillar_coord_subtitle', 'Une a todo el equipo en la misma página'),
('it', 'landing.pillar_coord_subtitle', 'Porta tutto il team sulla stessa pagina'),
('fr', 'landing.pillar_coord_subtitle', 'Mettez toute l''équipe sur la même longueur d''onde'),
('de', 'landing.pillar_coord_subtitle', 'Bringen Sie das gesamte Team auf den gleichen Stand'),
('sv', 'landing.pillar_coord_subtitle', 'Samla hela teamet på samma sida'),
('fi', 'landing.pillar_coord_subtitle', 'Tuo koko tiimi samalle sivulle'),

('en', 'landing.pillar_coord_b1', 'Memory Book gives every team member instant context — who the person is, who to call, what to watch for, and what brings them comfort'),
('es', 'landing.pillar_coord_b1', 'El Libro de Memoria da a cada miembro del equipo contexto inmediato: quién es la persona, a quién llamar, qué observar y qué les trae comodidad'),
('it', 'landing.pillar_coord_b1', 'Il Memory Book dà a ogni membro del team il contesto immediato — chi è la persona, chi chiamare, cosa osservare e cosa porta loro conforto'),
('fr', 'landing.pillar_coord_b1', 'Le Memory Book donne à chaque membre de l''équipe le contexte immédiat — qui est la personne, qui appeler, quoi surveiller et ce qui lui apporte du réconfort'),
('de', 'landing.pillar_coord_b1', 'Das Memory Book gibt jedem Teammitglied sofortigen Kontext — wer die Person ist, wen man anrufen soll, worauf man achten muss und was ihr Trost bringt'),
('sv', 'landing.pillar_coord_b1', 'Memory Book ger varje teammedlem omedelbart sammanhang — vem personen är, vem man ska ringa, vad man ska hålla utkik efter och vad som ger dem tröst'),
('fi', 'landing.pillar_coord_b1', 'Muistokirja antaa jokaiselle tiimin jäsenelle välittömän kontekstin — kuka henkilö on, kenelle soittaa, mitä tarkkailla ja mikä tuo heille lohtua'),

('en', 'landing.pillar_coord_b2', 'Responsibilities are assigned — every team member knows exactly what they own, reducing overlap and gaps in care'),
('es', 'landing.pillar_coord_b2', 'Las responsabilidades están asignadas: cada miembro del equipo sabe exactamente qué le corresponde, reduciendo superposiciones y vacíos en el cuidado'),
('it', 'landing.pillar_coord_b2', 'Le responsabilità sono assegnate — ogni membro del team sa esattamente cosa gli compete, riducendo sovrapposizioni e lacune nell''assistenza'),
('fr', 'landing.pillar_coord_b2', 'Les responsabilités sont assignées — chaque membre de l''équipe sait exactement ce qui lui incombe, réduisant les chevauchements et les lacunes dans les soins'),
('de', 'landing.pillar_coord_b2', 'Verantwortlichkeiten sind zugewiesen — jedes Teammitglied weiß genau, wofür es zuständig ist, und reduziert Überschneidungen und Lücken in der Pflege'),
('sv', 'landing.pillar_coord_b2', 'Ansvar är tilldelat — varje teammedlem vet exakt vad de äger, vilket minskar överlapp och luckor i vården'),
('fi', 'landing.pillar_coord_b2', 'Vastuut on jaettu — jokainen tiimin jäsen tietää tarkalleen mitä heille kuuluu, vähentäen päällekkäisyyksiä ja puutteita hoidossa'),

('en', 'landing.pillar_coord_b3', 'Family Circle connects up to three caregivers with shared observations, a weekly digest, and role-based access'),
('es', 'landing.pillar_coord_b3', 'Family Circle conecta hasta tres cuidadores con observaciones compartidas, un resumen semanal y acceso basado en roles'),
('it', 'landing.pillar_coord_b3', 'Family Circle connette fino a tre caregiver con osservazioni condivise, un riepilogo settimanale e accesso basato sui ruoli'),
('fr', 'landing.pillar_coord_b3', 'Family Circle connecte jusqu''à trois aidants avec des observations partagées, un résumé hebdomadaire et un accès basé sur les rôles'),
('de', 'landing.pillar_coord_b3', 'Family Circle verbindet bis zu drei Pflegepersonen mit gemeinsamen Beobachtungen, einem wöchentlichen Digest und rollenbasiertem Zugriff'),
('sv', 'landing.pillar_coord_b3', 'Family Circle kopplar samman upp till tre vårdare med delade observationer, en veckosammanfattning och rollbaserad åtkomst'),
('fi', 'landing.pillar_coord_b3', 'Perhepiiri yhdistää jopa kolme hoitajaa jaetuilla havainnoilla, viikoittaisella yhteenvedolla ja rooliperusteisella käytöllä'),

-- Pillar 3: Observe
('en', 'landing.pillar_obs_title', 'Observe'),
('es', 'landing.pillar_obs_title', 'Observar'),
('it', 'landing.pillar_obs_title', 'Osserva'),
('fr', 'landing.pillar_obs_title', 'Observer'),
('de', 'landing.pillar_obs_title', 'Beobachten'),
('sv', 'landing.pillar_obs_title', 'Observera'),
('fi', 'landing.pillar_obs_title', 'Havainnoi'),

('en', 'landing.pillar_obs_subtitle', 'Track what is changing — keep your plan accurate'),
('es', 'landing.pillar_obs_subtitle', 'Rastrea lo que está cambiando — mantén tu plan preciso'),
('it', 'landing.pillar_obs_subtitle', 'Tieni traccia di ciò che sta cambiando — mantieni il tuo piano accurato'),
('fr', 'landing.pillar_obs_subtitle', 'Suivez ce qui change — gardez votre plan précis'),
('de', 'landing.pillar_obs_subtitle', 'Verfolgen Sie, was sich ändert — halten Sie Ihren Plan aktuell'),
('sv', 'landing.pillar_obs_subtitle', 'Spåra vad som förändras — håll din plan korrekt'),
('fi', 'landing.pillar_obs_subtitle', 'Seuraa mitä muuttuu — pidä suunnitelmasi tarkkana'),

('en', 'landing.pillar_obs_b1', 'Simple 1–5 ADL scale grounded in occupational therapy — no jargon, just clear shared language for the whole team'),
('es', 'landing.pillar_obs_b1', 'Escala ADL simple del 1 al 5 basada en terapia ocupacional: sin jerga, solo un lenguaje compartido claro para todo el equipo'),
('it', 'landing.pillar_obs_b1', 'Semplice scala ADL da 1 a 5 basata sulla terapia occupazionale — nessun gergo, solo un linguaggio condiviso chiaro per tutto il team'),
('fr', 'landing.pillar_obs_b1', 'Échelle ADL simple de 1 à 5 fondée sur l''ergothérapie — pas de jargon, juste un langage partagé clair pour toute l''équipe'),
('de', 'landing.pillar_obs_b1', 'Einfache 1-5 ADL-Skala basierend auf Ergotherapie — kein Fachjargon, nur eine klare gemeinsame Sprache für das gesamte Team'),
('sv', 'landing.pillar_obs_b1', 'Enkel 1–5 ADL-skala grundad i arbetsterapi — inget fackspråk, bara ett tydligt gemensamt språk för hela teamet'),
('fi', 'landing.pillar_obs_b1', 'Yksinkertainen 1–5 ADL-asteikko perustuu toimintaterapiaan — ei jargonia, vain selkeä yhteinen kieli koko tiimille'),

('en', 'landing.pillar_obs_b2', 'Trends over days, weeks, and months — patterns reveal when to adjust routines, medications, or care arrangements'),
('es', 'landing.pillar_obs_b2', 'Tendencias a lo largo de días, semanas y meses: los patrones revelan cuándo ajustar rutinas, medicamentos o arreglos de cuidado'),
('it', 'landing.pillar_obs_b2', 'Tendenze nel corso di giorni, settimane e mesi — i pattern rivelano quando aggiustare routine, farmaci o accordi di cura'),
('fr', 'landing.pillar_obs_b2', 'Tendances sur des jours, des semaines et des mois — les schémas révèlent quand ajuster les routines, les médicaments ou les arrangements de soins'),
('de', 'landing.pillar_obs_b2', 'Trends über Tage, Wochen und Monate — Muster zeigen, wann Routinen, Medikamente oder Pflegearrangements angepasst werden müssen'),
('sv', 'landing.pillar_obs_b2', 'Trender över dagar, veckor och månader — mönster avslöjar när rutiner, mediciner eller vårdarrangemang behöver justeras'),
('fi', 'landing.pillar_obs_b2', 'Trendit päivien, viikkojen ja kuukausien yli — mallit paljastavat milloin rutiineja, lääkitystä tai hoitojärjestelyjä on muutettava'),

('en', 'landing.pillar_obs_b3', 'Arrive at doctor appointments with specific observations — not fuzzy memories. Export to PDF or DOCX in one click'),
('es', 'landing.pillar_obs_b3', 'Llega a las citas médicas con observaciones específicas, no con recuerdos difusos. Exporta a PDF o DOCX en un clic'),
('it', 'landing.pillar_obs_b3', 'Arriva agli appuntamenti medici con osservazioni specifiche — non ricordi vaghi. Esporta in PDF o DOCX con un clic'),
('fr', 'landing.pillar_obs_b3', 'Arrivez aux rendez-vous médicaux avec des observations précises — pas des souvenirs flous. Exportez en PDF ou DOCX en un clic'),
('de', 'landing.pillar_obs_b3', 'Kommen Sie mit konkreten Beobachtungen zu Arztterminen — nicht mit unscharfen Erinnerungen. Mit einem Klick als PDF oder DOCX exportieren'),
('sv', 'landing.pillar_obs_b3', 'Kom till läkarbesök med specifika observationer — inte suddiga minnen. Exportera till PDF eller DOCX med ett klick'),
('fi', 'landing.pillar_obs_b3', 'Saavu lääkärivastaanotoille erityisillä havainnoilla — ei epäselvistä muistoista. Vie PDF- tai DOCX-muotoon yhdellä napsautuksella'),

-- Pillar 4: Update and Improve
('en', 'landing.pillar_review_title', 'Update & Improve'),
('es', 'landing.pillar_review_title', 'Actualizar y Mejorar'),
('it', 'landing.pillar_review_title', 'Aggiorna e Migliora'),
('fr', 'landing.pillar_review_title', 'Mettre à jour et Améliorer'),
('de', 'landing.pillar_review_title', 'Aktualisieren & Verbessern'),
('sv', 'landing.pillar_review_title', 'Uppdatera och Förbättra'),
('fi', 'landing.pillar_review_title', 'Päivitä ja Paranna'),

('en', 'landing.pillar_review_subtitle', 'A living plan that evolves with your family''s needs'),
('es', 'landing.pillar_review_subtitle', 'Un plan vivo que evoluciona con las necesidades de tu familia'),
('it', 'landing.pillar_review_subtitle', 'Un piano vivo che si evolve con le esigenze della tua famiglia'),
('fr', 'landing.pillar_review_subtitle', 'Un plan vivant qui évolue avec les besoins de votre famille'),
('de', 'landing.pillar_review_subtitle', 'Ein lebendiger Plan, der sich mit den Bedürfnissen Ihrer Familie entwickelt'),
('sv', 'landing.pillar_review_subtitle', 'En levande plan som utvecklas med din familjs behov'),
('fi', 'landing.pillar_review_subtitle', 'Elävä suunnitelma, joka kehittyy perheesi tarpeiden mukaan'),

('en', 'landing.pillar_review_b1', 'Your plan is not a document — it''s a living system. CarerView tells you when observations signal it''s time to review'),
('es', 'landing.pillar_review_b1', 'Tu plan no es un documento, es un sistema vivo. CarerView te dice cuándo las observaciones señalan que es hora de revisar'),
('it', 'landing.pillar_review_b1', 'Il tuo piano non è un documento — è un sistema vivo. CarerView ti dice quando le osservazioni segnalano che è ora di rivedere'),
('fr', 'landing.pillar_review_b1', 'Votre plan n''est pas un document — c''est un système vivant. CarerView vous indique quand les observations signalent qu''il est temps de réviser'),
('de', 'landing.pillar_review_b1', 'Ihr Plan ist kein Dokument — er ist ein lebendes System. CarerView teilt Ihnen mit, wann Beobachtungen signalisieren, dass es Zeit für eine Überprüfung ist'),
('sv', 'landing.pillar_review_b1', 'Din plan är inte ett dokument — det är ett levande system. CarerView berättar när observationer signalerar att det är dags att granska'),
('fi', 'landing.pillar_review_b1', 'Suunnitelmasi ei ole asiakirja — se on elävä järjestelmä. CarerView kertoo sinulle milloin havainnot viittaavat siihen, että on aika arvioida'),

('en', 'landing.pillar_review_b2', 'Five review triggers: health change, new caregiver, living arrangement shift, caregiver stress threshold, or scheduled quarterly review'),
('es', 'landing.pillar_review_b2', 'Cinco desencadenantes de revisión: cambio de salud, nuevo cuidador, cambio de arreglo de vida, umbral de estrés del cuidador o revisión trimestral programada'),
('it', 'landing.pillar_review_b2', 'Cinque trigger di revisione: cambiamento di salute, nuovo caregiver, cambio di sistemazione abitativa, soglia di stress del caregiver o revisione trimestrale programmata'),
('fr', 'landing.pillar_review_b2', 'Cinq déclencheurs de révision : changement de santé, nouveau soignant, changement d''arrangement de vie, seuil de stress de l''aidant ou révision trimestrielle planifiée'),
('de', 'landing.pillar_review_b2', 'Fünf Überprüfungsauslöser: Gesundheitsveränderung, neuer Pflegender, Wechsel der Wohnsituation, Stressschwelle der Pflegeperson oder geplante vierteljährliche Überprüfung'),
('sv', 'landing.pillar_review_b2', 'Fem granskningsutlösare: hälsoförändring, ny vårdare, förändring av boendesituation, vårdarens stresströskel eller schemalagd kvartalsvis granskning'),
('fi', 'landing.pillar_review_b2', 'Viisi arvioinnin käynnistintä: terveysmuutos, uusi hoitaja, asumisjärjestelyn muutos, hoitajan stressikynnys tai suunniteltu neljännesvuosittainen arviointi'),

('en', 'landing.pillar_review_b3', 'New to caregiving? Our free 8-module guide covers everything from legal authority to sustainable planning'),
('es', 'landing.pillar_review_b3', '¿Nuevo en el cuidado? Nuestra guía gratuita de 8 módulos cubre todo, desde la autoridad legal hasta la planificación sostenible'),
('it', 'landing.pillar_review_b3', 'Nuovo all''assistenza? La nostra guida gratuita in 8 moduli copre tutto, dall''autorità legale alla pianificazione sostenibile'),
('fr', 'landing.pillar_review_b3', 'Nouveau dans les soins ? Notre guide gratuit en 8 modules couvre tout, de l''autorité légale à la planification durable'),
('de', 'landing.pillar_review_b3', 'Neu in der Pflege? Unser kostenloser 8-Modul-Leitfaden deckt alles ab, von der rechtlichen Vollmacht bis zur nachhaltigen Planung'),
('sv', 'landing.pillar_review_b3', 'Ny inom vård? Vår kostnadsfria guide med 8 moduler täcker allt från rättslig behörighet till hållbar planering'),
('fi', 'landing.pillar_review_b3', 'Uusi hoitamisessa? Ilmainen 8-moduulin oppaamme kattaa kaiken juridisesta valtuutuksesta kestävään suunnitteluun')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
