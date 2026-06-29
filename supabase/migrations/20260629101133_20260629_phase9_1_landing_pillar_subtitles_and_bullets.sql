-- Phase 9.1: Landing page pillar subtitle and bullet keys
-- Seeds 15 missing keys (pillar_plan_b1-b3, pillar_coord_subtitle+b1-b3,
-- pillar_obs_subtitle+b1-b3, pillar_review_subtitle+b1-b3)
-- 7 native locales (en/es/it/fr/de/sv/fi) + JA EN-fallback
-- ON CONFLICT DO NOTHING — safe and idempotent

INSERT INTO public.ui_translations (locale, namespace, key, value) VALUES

-- pillar_plan_b1
('en','landing','pillar_plan_b1','Six structured sections: situation, authority, responsibilities, living arrangement, sustainability, and review'),
('es','landing','pillar_plan_b1','Seis secciones estructuradas: situación, autoridad, responsabilidades, arreglo de vida, sostenibilidad y revisión'),
('it','landing','pillar_plan_b1','Sei sezioni strutturate: situazione, autorità, responsabilità, sistemazione abitativa, sostenibilità e revisione'),
('fr','landing','pillar_plan_b1','Six sections structurées : situation, autorité, responsabilités, arrangement de vie, durabilité et révision'),
('de','landing','pillar_plan_b1','Sechs strukturierte Bereiche: Situation, Vollmacht, Verantwortlichkeiten, Wohnarrangement, Nachhaltigkeit und Überprüfung'),
('sv','landing','pillar_plan_b1','Sex strukturerade avsnitt: situation, behörighet, ansvar, boendesituation, hållbarhet och granskning'),
('fi','landing','pillar_plan_b1','Kuusi jäsenneltyä osiota: tilanne, valtuutus, vastuut, asumisjärjestely, kestävyys ja arviointi'),
('ja','landing','pillar_plan_b1','Six structured sections: situation, authority, responsibilities, living arrangement, sustainability, and review'),

-- pillar_plan_b2
('en','landing','pillar_plan_b2','Decision Engine flags gaps before they become crises — "No backup caregiver identified" or "Medical authority not documented"'),
('es','landing','pillar_plan_b2','El motor de decisiones detecta vacíos antes de que se conviertan en crisis: "Sin cuidador de respaldo identificado" o "Autoridad médica no documentada"'),
('it','landing','pillar_plan_b2','Il motore decisionale segnala le lacune prima che diventino crisi: "Nessun caregiver di riserva identificato" o "Autorità medica non documentata"'),
('fr','landing','pillar_plan_b2','Le moteur de décision signale les lacunes avant qu''elles ne deviennent des crises : "Aucun aidant de secours identifié" ou "Autorité médicale non documentée"'),
('de','landing','pillar_plan_b2','Die Entscheidungs-Engine erkennt Lücken, bevor sie zu Krisen werden: "Keine Vertretungspflegeperson identifiziert" oder "Medizinische Vollmacht nicht dokumentiert"'),
('sv','landing','pillar_plan_b2','Beslutsmotorn flaggar luckor innan de blir kriser — "Ingen reservvårdare identifierad" eller "Medicinsk behörighet inte dokumenterad"'),
('fi','landing','pillar_plan_b2','Päätösmoottori merkitsee puutteet ennen kuin niistä tulee kriisejä — "Varahoitajaa ei tunnistettu" tai "Lääketieteellistä valtuutusta ei dokumentoitu"'),
('ja','landing','pillar_plan_b2','Decision Engine flags gaps before they become crises — "No backup caregiver identified" or "Medical authority not documented"'),

-- pillar_plan_b3
('en','landing','pillar_plan_b3','Caregiver sustainability is part of the plan — stress levels, backup cover, and respite are tracked alongside the care recipient''s needs'),
('es','landing','pillar_plan_b3','La sostenibilidad del cuidador es parte del plan: niveles de estrés, cobertura de respaldo y respiro se rastrean junto con las necesidades de la persona cuidada'),
('it','landing','pillar_plan_b3','La sostenibilità del caregiver fa parte del piano: livelli di stress, copertura di riserva e sollievo sono monitorati insieme alle esigenze della persona assistita'),
('fr','landing','pillar_plan_b3','La durabilité de l''aidant fait partie du plan — les niveaux de stress, la couverture de secours et le répit sont suivis parallèlement aux besoins de la personne aidée'),
('de','landing','pillar_plan_b3','Die Nachhaltigkeit der Pflegeperson ist Teil des Plans — Stressniveaus, Vertretungsabdeckung und Auszeiten werden zusammen mit den Bedürfnissen der gepflegten Person verfolgt'),
('sv','landing','pillar_plan_b3','Vårdarens hållbarhet är en del av planen — stressnivåer, reservtäckning och avlastning spåras parallellt med den omvårdades behov'),
('fi','landing','pillar_plan_b3','Hoitajan kestävyys on osa suunnitelmaa — stressitasot, varakattavuus ja lepo seurataan hoidettavan tarpeiden rinnalla'),
('ja','landing','pillar_plan_b3','Caregiver sustainability is part of the plan — stress levels, backup cover, and respite are tracked alongside the care recipient''s needs'),

-- pillar_coord_subtitle
('en','landing','pillar_coord_subtitle','Bring the whole team onto the same page'),
('es','landing','pillar_coord_subtitle','Une a todo el equipo en la misma página'),
('it','landing','pillar_coord_subtitle','Porta tutto il team sulla stessa pagina'),
('fr','landing','pillar_coord_subtitle','Mettez toute l''équipe sur la même longueur d''onde'),
('de','landing','pillar_coord_subtitle','Bringen Sie das gesamte Team auf den gleichen Stand'),
('sv','landing','pillar_coord_subtitle','Samla hela teamet på samma sida'),
('fi','landing','pillar_coord_subtitle','Tuo koko tiimi samalle sivulle'),
('ja','landing','pillar_coord_subtitle','Bring the whole team onto the same page'),

-- pillar_coord_b1
('en','landing','pillar_coord_b1','Memory Book gives every team member instant context — who the person is, who to call, what to watch for, and what brings them comfort'),
('es','landing','pillar_coord_b1','El Libro de Memoria da a cada miembro del equipo contexto inmediato: quién es la persona, a quién llamar, qué observar y qué les trae comodidad'),
('it','landing','pillar_coord_b1','Il Memory Book dà a ogni membro del team il contesto immediato — chi è la persona, chi chiamare, cosa osservare e cosa porta loro conforto'),
('fr','landing','pillar_coord_b1','Le Memory Book donne à chaque membre de l''équipe le contexte immédiat — qui est la personne, qui appeler, quoi surveiller et ce qui lui apporte du réconfort'),
('de','landing','pillar_coord_b1','Das Memory Book gibt jedem Teammitglied sofortigen Kontext — wer die Person ist, wen man anrufen soll, worauf man achten muss und was ihr Trost bringt'),
('sv','landing','pillar_coord_b1','Memory Book ger varje teammedlem omedelbart sammanhang — vem personen är, vem man ska ringa, vad man ska hålla utkik efter och vad som ger dem tröst'),
('fi','landing','pillar_coord_b1','Muistokirja antaa jokaiselle tiimin jäsenelle välittömän kontekstin — kuka henkilö on, kenelle soittaa, mitä tarkkailla ja mikä tuo heille lohtua'),
('ja','landing','pillar_coord_b1','Memory Book gives every team member instant context — who the person is, who to call, what to watch for, and what brings them comfort'),

-- pillar_coord_b2
('en','landing','pillar_coord_b2','Responsibilities are assigned — every team member knows exactly what they own, reducing overlap and gaps in care'),
('es','landing','pillar_coord_b2','Las responsabilidades están asignadas: cada miembro del equipo sabe exactamente qué le corresponde, reduciendo superposiciones y vacíos en el cuidado'),
('it','landing','pillar_coord_b2','Le responsabilità sono assegnate — ogni membro del team sa esattamente cosa gli compete, riducendo sovrapposizioni e lacune nell''assistenza'),
('fr','landing','pillar_coord_b2','Les responsabilités sont assignées — chaque membre de l''équipe sait exactement ce qui lui incombe, réduisant les chevauchements et les lacunes dans les soins'),
('de','landing','pillar_coord_b2','Verantwortlichkeiten sind zugewiesen — jedes Teammitglied weiß genau, wofür es zuständig ist, und reduziert Überschneidungen und Lücken in der Pflege'),
('sv','landing','pillar_coord_b2','Ansvar är tilldelat — varje teammedlem vet exakt vad de äger, vilket minskar överlapp och luckor i vården'),
('fi','landing','pillar_coord_b2','Vastuut on jaettu — jokainen tiimin jäsen tietää tarkalleen mitä heille kuuluu, vähentäen päällekkäisyyksiä ja puutteita hoidossa'),
('ja','landing','pillar_coord_b2','Responsibilities are assigned — every team member knows exactly what they own, reducing overlap and gaps in care'),

-- pillar_coord_b3
('en','landing','pillar_coord_b3','Family Circle connects up to three caregivers with shared observations, a weekly digest, and role-based access'),
('es','landing','pillar_coord_b3','Family Circle conecta hasta tres cuidadores con observaciones compartidas, un resumen semanal y acceso basado en roles'),
('it','landing','pillar_coord_b3','Family Circle connette fino a tre caregiver con osservazioni condivise, un riepilogo settimanale e accesso basato sui ruoli'),
('fr','landing','pillar_coord_b3','Family Circle connecte jusqu''à trois aidants avec des observations partagées, un résumé hebdomadaire et un accès basé sur les rôles'),
('de','landing','pillar_coord_b3','Family Circle verbindet bis zu drei Pflegepersonen mit gemeinsamen Beobachtungen, einem wöchentlichen Digest und rollenbasiertem Zugriff'),
('sv','landing','pillar_coord_b3','Family Circle kopplar samman upp till tre vårdare med delade observationer, en veckosammanfattning och rollbaserad åtkomst'),
('fi','landing','pillar_coord_b3','Perhepiiri yhdistää jopa kolme hoitajaa jaetuilla havainnoilla, viikoittaisella yhteenvedolla ja rooliperusteisella käytöllä'),
('ja','landing','pillar_coord_b3','Family Circle connects up to three caregivers with shared observations, a weekly digest, and role-based access'),

-- pillar_obs_subtitle
('en','landing','pillar_obs_subtitle','Track what is changing — keep your plan accurate'),
('es','landing','pillar_obs_subtitle','Rastrea lo que está cambiando — mantén tu plan preciso'),
('it','landing','pillar_obs_subtitle','Tieni traccia di ciò che sta cambiando — mantieni il tuo piano accurato'),
('fr','landing','pillar_obs_subtitle','Suivez ce qui change — gardez votre plan précis'),
('de','landing','pillar_obs_subtitle','Verfolgen Sie, was sich ändert — halten Sie Ihren Plan aktuell'),
('sv','landing','pillar_obs_subtitle','Spåra vad som förändras — håll din plan korrekt'),
('fi','landing','pillar_obs_subtitle','Seuraa mitä muuttuu — pidä suunnitelmasi tarkkana'),
('ja','landing','pillar_obs_subtitle','Track what is changing — keep your plan accurate'),

-- pillar_obs_b1
('en','landing','pillar_obs_b1','Simple 1–5 ADL scale grounded in occupational therapy — no jargon, just clear shared language for the whole team'),
('es','landing','pillar_obs_b1','Escala ADL simple del 1 al 5 basada en terapia ocupacional: sin jerga, solo un lenguaje compartido claro para todo el equipo'),
('it','landing','pillar_obs_b1','Semplice scala ADL da 1 a 5 basata sulla terapia occupazionale — nessun gergo, solo un linguaggio condiviso chiaro per tutto il team'),
('fr','landing','pillar_obs_b1','Échelle ADL simple de 1 à 5 fondée sur l''ergothérapie — pas de jargon, juste un langage partagé clair pour toute l''équipe'),
('de','landing','pillar_obs_b1','Einfache 1-5 ADL-Skala basierend auf Ergotherapie — kein Fachjargon, nur eine klare gemeinsame Sprache für das gesamte Team'),
('sv','landing','pillar_obs_b1','Enkel 1–5 ADL-skala grundad i arbetsterapi — inget fackspråk, bara ett tydligt gemensamt språk för hela teamet'),
('fi','landing','pillar_obs_b1','Yksinkertainen 1–5 ADL-asteikko perustuu toimintaterapiaan — ei jargonia, vain selkeä yhteinen kieli koko tiimille'),
('ja','landing','pillar_obs_b1','Simple 1–5 ADL scale grounded in occupational therapy — no jargon, just clear shared language for the whole team'),

-- pillar_obs_b2
('en','landing','pillar_obs_b2','Trends over days, weeks, and months — patterns reveal when to adjust routines, medications, or care arrangements'),
('es','landing','pillar_obs_b2','Tendencias a lo largo de días, semanas y meses: los patrones revelan cuándo ajustar rutinas, medicamentos o arreglos de cuidado'),
('it','landing','pillar_obs_b2','Tendenze nel corso di giorni, settimane e mesi — i pattern rivelano quando aggiustare routine, farmaci o accordi di cura'),
('fr','landing','pillar_obs_b2','Tendances sur des jours, des semaines et des mois — les schémas révèlent quand ajuster les routines, les médicaments ou les arrangements de soins'),
('de','landing','pillar_obs_b2','Trends über Tage, Wochen und Monate — Muster zeigen, wann Routinen, Medikamente oder Pflegearrangements angepasst werden müssen'),
('sv','landing','pillar_obs_b2','Trender över dagar, veckor och månader — mönster avslöjar när rutiner, mediciner eller vårdarrangemang behöver justeras'),
('fi','landing','pillar_obs_b2','Trendit päivien, viikkojen ja kuukausien yli — mallit paljastavat milloin rutiineja, lääkitystä tai hoitojärjestelyjä on muutettava'),
('ja','landing','pillar_obs_b2','Trends over days, weeks, and months — patterns reveal when to adjust routines, medications, or care arrangements'),

-- pillar_obs_b3
('en','landing','pillar_obs_b3','Arrive at doctor appointments with specific observations — not fuzzy memories. Export to PDF or DOCX in one click'),
('es','landing','pillar_obs_b3','Llega a las citas médicas con observaciones específicas, no con recuerdos difusos. Exporta a PDF o DOCX en un clic'),
('it','landing','pillar_obs_b3','Arriva agli appuntamenti medici con osservazioni specifiche — non ricordi vaghi. Esporta in PDF o DOCX con un clic'),
('fr','landing','pillar_obs_b3','Arrivez aux rendez-vous médicaux avec des observations précises — pas des souvenirs flous. Exportez en PDF ou DOCX en un clic'),
('de','landing','pillar_obs_b3','Kommen Sie mit konkreten Beobachtungen zu Arztterminen — nicht mit unscharfen Erinnerungen. Mit einem Klick als PDF oder DOCX exportieren'),
('sv','landing','pillar_obs_b3','Kom till läkarbesök med specifika observationer — inte suddiga minnen. Exportera till PDF eller DOCX med ett klick'),
('fi','landing','pillar_obs_b3','Saavu lääkärivastaanotoille erityisillä havainnoilla — ei epäselvistä muistoista. Vie PDF- tai DOCX-muotoon yhdellä napsautuksella'),
('ja','landing','pillar_obs_b3','Arrive at doctor appointments with specific observations — not fuzzy memories. Export to PDF or DOCX in one click'),

-- pillar_review_subtitle
('en','landing','pillar_review_subtitle','A living plan that evolves with your family''s needs'),
('es','landing','pillar_review_subtitle','Un plan vivo que evoluciona con las necesidades de tu familia'),
('it','landing','pillar_review_subtitle','Un piano vivo che si evolve con le esigenze della tua famiglia'),
('fr','landing','pillar_review_subtitle','Un plan vivant qui évolue avec les besoins de votre famille'),
('de','landing','pillar_review_subtitle','Ein lebendiger Plan, der sich mit den Bedürfnissen Ihrer Familie entwickelt'),
('sv','landing','pillar_review_subtitle','En levande plan som utvecklas med din familjs behov'),
('fi','landing','pillar_review_subtitle','Elävä suunnitelma, joka kehittyy perheesi tarpeiden mukaan'),
('ja','landing','pillar_review_subtitle','A living plan that evolves with your family''s needs'),

-- pillar_review_b1
('en','landing','pillar_review_b1','Your plan is not a document — it''s a living system. CarerView tells you when observations signal it''s time to review'),
('es','landing','pillar_review_b1','Tu plan no es un documento, es un sistema vivo. CarerView te dice cuándo las observaciones señalan que es hora de revisar'),
('it','landing','pillar_review_b1','Il tuo piano non è un documento — è un sistema vivo. CarerView ti dice quando le osservazioni segnalano che è ora di rivedere'),
('fr','landing','pillar_review_b1','Votre plan n''est pas un document — c''est un système vivant. CarerView vous indique quand les observations signalent qu''il est temps de réviser'),
('de','landing','pillar_review_b1','Ihr Plan ist kein Dokument — er ist ein lebendes System. CarerView teilt Ihnen mit, wann Beobachtungen signalisieren, dass es Zeit für eine Überprüfung ist'),
('sv','landing','pillar_review_b1','Din plan är inte ett dokument — det är ett levande system. CarerView berättar när observationer signalerar att det är dags att granska'),
('fi','landing','pillar_review_b1','Suunnitelmasi ei ole asiakirja — se on elävä järjestelmä. CarerView kertoo sinulle milloin havainnot viittaavat siihen, että on aika arvioida'),
('ja','landing','pillar_review_b1','Your plan is not a document — it''s a living system. CarerView tells you when observations signal it''s time to review'),

-- pillar_review_b2
('en','landing','pillar_review_b2','Five review triggers: health change, new caregiver, living arrangement shift, caregiver stress threshold, or scheduled quarterly review'),
('es','landing','pillar_review_b2','Cinco desencadenantes de revisión: cambio de salud, nuevo cuidador, cambio de arreglo de vida, umbral de estrés del cuidador o revisión trimestral programada'),
('it','landing','pillar_review_b2','Cinque trigger di revisione: cambiamento di salute, nuovo caregiver, cambio di sistemazione abitativa, soglia di stress del caregiver o revisione trimestrale programmata'),
('fr','landing','pillar_review_b2','Cinq déclencheurs de révision : changement de santé, nouveau soignant, changement d''arrangement de vie, seuil de stress de l''aidant ou révision trimestrielle planifiée'),
('de','landing','pillar_review_b2','Fünf Überprüfungsauslöser: Gesundheitsveränderung, neuer Pflegender, Wechsel der Wohnsituation, Stressschwelle der Pflegeperson oder geplante vierteljährliche Überprüfung'),
('sv','landing','pillar_review_b2','Fem granskningsutlösare: hälsoförändring, ny vårdare, förändring av boendesituation, vårdarens stresströskel eller schemalagd kvartalsvis granskning'),
('fi','landing','pillar_review_b2','Viisi arvioinnin käynnistintä: terveysmuutos, uusi hoitaja, asumisjärjestelyn muutos, hoitajan stressikynnys tai suunniteltu neljännesvuosittainen arviointi'),
('ja','landing','pillar_review_b2','Five review triggers: health change, new caregiver, living arrangement shift, caregiver stress threshold, or scheduled quarterly review'),

-- pillar_review_b3
('en','landing','pillar_review_b3','New to caregiving? Our free 8-module guide covers everything from legal authority to sustainable planning'),
('es','landing','pillar_review_b3','¿Nuevo en el cuidado? Nuestra guía gratuita de 8 módulos cubre todo, desde la autoridad legal hasta la planificación sostenible'),
('it','landing','pillar_review_b3','Nuovo all''assistenza? La nostra guida gratuita in 8 moduli copre tutto, dall''autorità legale alla pianificazione sostenibile'),
('fr','landing','pillar_review_b3','Nouveau dans les soins ? Notre guide gratuit en 8 modules couvre tout, de l''autorité légale à la planification durable'),
('de','landing','pillar_review_b3','Neu in der Pflege? Unser kostenloser 8-Modul-Leitfaden deckt alles ab, von der rechtlichen Vollmacht bis zur nachhaltigen Planung'),
('sv','landing','pillar_review_b3','Ny inom vård? Vår kostnadsfria guide med 8 moduler täcker allt från rättslig behörighet till hållbar planering'),
('fi','landing','pillar_review_b3','Uusi hoitamisessa? Ilmainen 8-moduulin oppaamme kattaa kaiken juridisesta valtuutuksesta kestävään suunnitteluun'),
('ja','landing','pillar_review_b3','New to caregiving? Our free 8-module guide covers everything from legal authority to sustainable planning')

ON CONFLICT (locale, namespace, key) DO NOTHING;
