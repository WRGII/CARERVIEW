-- Phase 9.2b: Landing page testimonial2 and micro-scenarios
-- Source: legacy migration 20260424195529
-- Stored as namespace='common', dotted key (matching existing testimonial pattern)
-- Also adds missing DE/FR/IT rows for testimonial_loc (already EN/ES/FI/SV exist)
-- JA locale uses EN-fallback
-- ON CONFLICT DO NOTHING — idempotent

INSERT INTO public.ui_translations (locale, namespace, key, value) VALUES

-- ============================================================
-- SECOND TESTIMONIAL (completely absent from DB)
-- ============================================================

-- testimonial2_quote
('en','common','landing.testimonial2_quote','Mum was discharged from hospital on a Friday afternoon with a stack of instructions and nobody clear on who was doing what. CarerView helped us build a real plan that week — responsibilities assigned, authority sorted, and everyone finally on the same page.'),
('es','common','landing.testimonial2_quote','Mamá fue dada de alta del hospital un viernes por la tarde con un montón de instrucciones y nadie tenía claro quién hacía qué. CarerView nos ayudó a construir un plan real esa semana: responsabilidades asignadas, autoridad resuelta y todos finalmente en la misma página.'),
('it','common','landing.testimonial2_quote','La mamma è stata dimessa dall''ospedale un venerdì pomeriggio con un mucchio di istruzioni e nessuno era chiaro su chi stava facendo cosa. CarerView ci ha aiutato a costruire un piano reale quella settimana — responsabilità assegnate, autorità sistemata e tutti finalmente sulla stessa pagina.'),
('fr','common','landing.testimonial2_quote','Maman a été renvoyée de l''hôpital un vendredi après-midi avec une pile d''instructions et personne n''était clair sur qui faisait quoi. CarerView nous a aidés à construire un vrai plan cette semaine-là — responsabilités assignées, autorité clarifiée et tout le monde enfin sur la même longueur d''onde.'),
('de','common','landing.testimonial2_quote','Mama wurde an einem Freitagnachmittag mit einem Stapel Anweisungen aus dem Krankenhaus entlassen und niemand wusste, wer was tut. CarerView half uns, in dieser Woche einen echten Plan zu erstellen — Verantwortlichkeiten zugewiesen, Vollmacht geklärt und alle endlich auf dem gleichen Stand.'),
('sv','common','landing.testimonial2_quote','Mamma skrevs ut från sjukhuset en fredag eftermiddag med en hög instruktioner och ingen var klar på vem som gjorde vad. CarerView hjälpte oss att bygga en riktig plan den veckan — ansvar tilldelat, behörighet sorterad och alla äntligen på samma sida.'),
('fi','common','landing.testimonial2_quote','Äiti kotiutettiin sairaalasta perjantai-iltapäivänä ohjeiden kasa kädessä eikä kenellekään ollut selvää kuka tekee mitäkin. CarerView auttoi meitä rakentamaan todellisen suunnitelman sillä viikolla — vastuut jaettu, valtuutus selvitetty ja kaikki viimeinkin samalla sivulla.'),
('ja','common','landing.testimonial2_quote','Mum was discharged from hospital on a Friday afternoon with a stack of instructions and nobody clear on who was doing what. CarerView helped us build a real plan that week — responsibilities assigned, authority sorted, and everyone finally on the same page.'),

-- testimonial2_name
('en','common','landing.testimonial2_name','Sarah M.'),
('es','common','landing.testimonial2_name','Sarah M.'),
('it','common','landing.testimonial2_name','Sarah M.'),
('fr','common','landing.testimonial2_name','Sarah M.'),
('de','common','landing.testimonial2_name','Sarah M.'),
('sv','common','landing.testimonial2_name','Sarah M.'),
('fi','common','landing.testimonial2_name','Sarah M.'),
('ja','common','landing.testimonial2_name','Sarah M.'),

-- testimonial2_loc
('en','common','landing.testimonial2_loc','Manchester, UK'),
('es','common','landing.testimonial2_loc','Manchester, Reino Unido'),
('it','common','landing.testimonial2_loc','Manchester, Regno Unito'),
('fr','common','landing.testimonial2_loc','Manchester, Royaume-Uni'),
('de','common','landing.testimonial2_loc','Manchester, UK'),
('sv','common','landing.testimonial2_loc','Manchester, Storbritannien'),
('fi','common','landing.testimonial2_loc','Manchester, Iso-Britannia'),
('ja','common','landing.testimonial2_loc','Manchester, UK'),

-- testimonial_loc missing locales (IT/FR/DE absent; EN/ES/FI/SV already seeded)
('it','common','landing.testimonial_loc','Denver, Colorado'),
('fr','common','landing.testimonial_loc','Denver, Colorado'),
('de','common','landing.testimonial_loc','Denver, Colorado'),

-- ============================================================
-- MICRO-SCENARIOS SECTION (completely absent from DB)
-- ============================================================

-- scenarios_eyebrow
('en','common','landing.scenarios_eyebrow','How families use CarerView'),
('es','common','landing.scenarios_eyebrow','Cómo las familias usan CarerView'),
('it','common','landing.scenarios_eyebrow','Come le famiglie usano CarerView'),
('fr','common','landing.scenarios_eyebrow','Comment les familles utilisent CarerView'),
('de','common','landing.scenarios_eyebrow','Wie Familien CarerView nutzen'),
('sv','common','landing.scenarios_eyebrow','Hur familjer använder CarerView'),
('fi','common','landing.scenarios_eyebrow','Kuinka perheet käyttävät CarerView''ta'),
('ja','common','landing.scenarios_eyebrow','How families use CarerView'),

-- scenarios_title
('en','common','landing.scenarios_title','Real situations. Real coordination.'),
('es','common','landing.scenarios_title','Situaciones reales. Coordinación real.'),
('it','common','landing.scenarios_title','Situazioni reali. Coordinamento reale.'),
('fr','common','landing.scenarios_title','Situations réelles. Coordination réelle.'),
('de','common','landing.scenarios_title','Reale Situationen. Echte Koordination.'),
('sv','common','landing.scenarios_title','Verkliga situationer. Verklig koordination.'),
('fi','common','landing.scenarios_title','Todelliset tilanteet. Todellinen koordinointi.'),
('ja','common','landing.scenarios_title','Real situations. Real coordination.'),

-- scenario1_title
('en','common','landing.scenario1_title','Long-distance family coordination'),
('es','common','landing.scenario1_title','Coordinación familiar a larga distancia'),
('it','common','landing.scenario1_title','Coordinamento familiare a distanza'),
('fr','common','landing.scenario1_title','Coordination familiale à distance'),
('de','common','landing.scenario1_title','Koordination über weite Entfernungen'),
('sv','common','landing.scenario1_title','Långdistanskoordination i familjen'),
('fi','common','landing.scenario1_title','Perhekoordination pitkän matkan päähän'),
('ja','common','landing.scenario1_title','Long-distance family coordination'),

-- scenario1_body
('en','common','landing.scenario1_body','Three siblings in three cities, one parent needing daily care. CarerView gives everyone access to the same observations, the same plan, and the same Memory Book — so no one is working from a different version of events. The distant sibling checks in before calling, not after.'),
('es','common','landing.scenario1_body','Tres hermanos en tres ciudades, un padre que necesita cuidado diario. CarerView da a todos acceso a las mismas observaciones, el mismo plan y el mismo Memory Book, para que nadie trabaje con una versión diferente de los hechos. El hermano distante revisa antes de llamar, no después.'),
('it','common','landing.scenario1_body','Tre fratelli in tre città, un genitore che ha bisogno di cure quotidiane. CarerView dà a tutti accesso alle stesse osservazioni, allo stesso piano e allo stesso Memory Book — così nessuno lavora da una versione diversa degli eventi. Il fratello lontano controlla prima di chiamare, non dopo.'),
('fr','common','landing.scenario1_body','Trois frères et sœurs dans trois villes, un parent ayant besoin de soins quotidiens. CarerView donne à chacun accès aux mêmes observations, au même plan et au même Memory Book — afin que personne ne travaille à partir d''une version différente des événements. Le frère ou la sœur distant vérifie avant d''appeler, pas après.'),
('de','common','landing.scenario1_body','Drei Geschwister in drei Städten, ein Elternteil mit täglichem Pflegebedarf. CarerView gibt allen Zugriff auf dieselben Beobachtungen, denselben Plan und dasselbe Memory Book — sodass niemand mit einer anderen Version der Ereignisse arbeitet. Das entfernte Geschwister checkt vor dem Anruf, nicht danach.'),
('sv','common','landing.scenario1_body','Tre syskon i tre städer, en förälder som behöver daglig vård. CarerView ger alla tillgång till samma observationer, samma plan och samma Memory Book — så att ingen arbetar utifrån en annan version av händelserna. Det avlägsna syskonet checkar in innan de ringer, inte efter.'),
('fi','common','landing.scenario1_body','Kolme sisarusta kolmessa kaupungissa, yksi vanhempi joka tarvitsee päivittäistä hoitoa. CarerView antaa kaikille pääsyn samoihin havaintoihin, samaan suunnitelmaan ja samaan muistokirjaan — jotta kukaan ei työskentelisi eri versiosta tapahtumista. Kaukainen sisarus tarkistaa ennen soittamista, ei jälkeen.'),
('ja','common','landing.scenario1_body','Three siblings in three cities, one parent needing daily care. CarerView gives everyone access to the same observations, the same plan, and the same Memory Book — so no one is working from a different version of events. The distant sibling checks in before calling, not after.'),

-- scenario2_title
('en','common','landing.scenario2_title','Hospital-to-home planning'),
('es','common','landing.scenario2_title','Planificación del hospital al hogar'),
('it','common','landing.scenario2_title','Pianificazione dall''ospedale a casa'),
('fr','common','landing.scenario2_title','Planification du retour à domicile'),
('de','common','landing.scenario2_title','Planung vom Krankenhaus nach Hause'),
('sv','common','landing.scenario2_title','Planering från sjukhus till hemmet'),
('fi','common','landing.scenario2_title','Suunnittelu sairaalasta kotiin'),
('ja','common','landing.scenario2_title','Hospital-to-home planning'),

-- scenario2_body
('en','common','landing.scenario2_body','Discharge instructions arrive at once — medications, follow-ups, restrictions, who to call if things change. CarerView turns that chaos into a structured plan: responsibilities assigned, observations started from day one, and early warning flags if something shifts. The first two weeks after discharge are the highest-risk period. CarerView brings structure to exactly that moment.'),
('es','common','landing.scenario2_body','Las instrucciones de alta llegan de golpe: medicamentos, seguimientos, restricciones, a quién llamar si las cosas cambian. CarerView convierte ese caos en un plan estructurado: responsabilidades asignadas, observaciones iniciadas desde el primer día y señales de alerta temprana si algo cambia. Las primeras dos semanas después del alta son el período de mayor riesgo. CarerView aporta estructura exactamente a ese momento.'),
('it','common','landing.scenario2_body','Le istruzioni di dimissione arrivano tutte in una volta: farmaci, follow-up, restrizioni, chi chiamare se le cose cambiano. CarerView trasforma quel caos in un piano strutturato: responsabilità assegnate, osservazioni avviate dal primo giorno e segnali di allerta precoce se qualcosa cambia. Le prime due settimane dopo la dimissione sono il periodo a più alto rischio. CarerView porta struttura esattamente in quel momento.'),
('fr','common','landing.scenario2_body','Les instructions de sortie arrivent toutes à la fois — médicaments, suivis, restrictions, qui appeler si les choses changent. CarerView transforme ce chaos en un plan structuré : responsabilités assignées, observations commencées dès le premier jour et signaux d''alerte précoce si quelque chose change. Les deux premières semaines après la sortie sont la période la plus risquée. CarerView apporte de la structure à exactement ce moment-là.'),
('de','common','landing.scenario2_body','Entlassungsanweisungen kommen auf einmal — Medikamente, Nachsorgetermine, Einschränkungen, wen man anrufen soll, wenn sich etwas ändert. CarerView verwandelt dieses Chaos in einen strukturierten Plan: Verantwortlichkeiten zugewiesen, Beobachtungen ab dem ersten Tag gestartet und Frühwarnzeichen, wenn sich etwas verändert. Die ersten zwei Wochen nach der Entlassung sind die risikoreichste Zeit. CarerView bringt Struktur genau in diesen Moment.'),
('sv','common','landing.scenario2_body','Utskrivningsinstruktioner anländer på en gång — mediciner, uppföljningar, begränsningar, vem man ska ringa om saker förändras. CarerView förvandlar det kaoset till en strukturerad plan: ansvar tilldelat, observationer startade från dag ett och tidiga varningssignaler om något förändras. De första två veckorna efter utskrivning är den högsta riskperioden. CarerView ger struktur till exakt det ögonblicket.'),
('fi','common','landing.scenario2_body','Kotiutusohjeet saapuvat kerralla — lääkkeet, seurantakäynnit, rajoitukset, kenelle soittaa jos asiat muuttuvat. CarerView muuttaa sen kaaoksen jäsennellyksi suunnitelmaksi: vastuut jaettu, havainnot aloitettu ensimmäisestä päivästä ja varhaisvaroitusmerkit jos jotain muuttuu. Ensimmäiset kaksi viikkoa kotiutumisen jälkeen ovat korkean riskin aikaa. CarerView tuo rakennetta juuri siihen hetkeen.'),
('ja','common','landing.scenario2_body','Discharge instructions arrive at once — medications, follow-ups, restrictions, who to call if things change. CarerView turns that chaos into a structured plan: responsibilities assigned, observations started from day one, and early warning flags if something shifts. The first two weeks after discharge are the highest-risk period. CarerView brings structure to exactly that moment.'),

-- scenario3_title
('en','common','landing.scenario3_title','Rotating paid caregivers'),
('es','common','landing.scenario3_title','Cuidadores profesionales rotativos'),
('it','common','landing.scenario3_title','Caregiver professionali a rotazione'),
('fr','common','landing.scenario3_title','Soignants professionnels rotatifs'),
('de','common','landing.scenario3_title','Rotierende bezahlte Pflegepersonen'),
('sv','common','landing.scenario3_title','Roterande betalda vårdare'),
('fi','common','landing.scenario3_title','Vuorottelevat palkatut hoitajat'),
('ja','common','landing.scenario3_title','Rotating paid caregivers'),

-- scenario3_body
('en','common','landing.scenario3_body','When multiple paid caregivers share shifts, consistent handoffs are critical. The Memory Book means every caregiver — new or returning — walks in knowing the person, not the paperwork. Observations from each shift build a shared record. Nobody asks the same question twice.'),
('es','common','landing.scenario3_body','Cuando varios cuidadores profesionales comparten turnos, los traspasos consistentes son críticos. El Memory Book significa que cada cuidador, nuevo o que regresa, entra conociendo a la persona, no los trámites. Las observaciones de cada turno construyen un registro compartido. Nadie hace la misma pregunta dos veces.'),
('it','common','landing.scenario3_body','Quando più caregiver professionali condividono i turni, i passaggi di consegne coerenti sono fondamentali. Il Memory Book significa che ogni caregiver — nuovo o di ritorno — entra conoscendo la persona, non le pratiche burocratiche. Le osservazioni di ogni turno costruiscono un registro condiviso. Nessuno fa la stessa domanda due volte.'),
('fr','common','landing.scenario3_body','Lorsque plusieurs soignants professionnels partagent des quarts de travail, des passages de relais cohérents sont essentiels. Le Memory Book signifie que chaque soignant — nouveau ou de retour — entre en connaissant la personne, pas la paperasse. Les observations de chaque quart constituent un dossier partagé. Personne ne pose la même question deux fois.'),
('de','common','landing.scenario3_body','Wenn mehrere bezahlte Pflegepersonen Schichten teilen, sind konsistente Übergaben entscheidend. Das Memory Book bedeutet, dass jede Pflegeperson — neu oder zurückkehrend — hereinkommt und die Person kennt, nicht den Papierkram. Beobachtungen aus jeder Schicht erstellen ein gemeinsames Protokoll. Niemand stellt dieselbe Frage zweimal.'),
('sv','common','landing.scenario3_body','När flera betalda vårdare delar skift är konsekventa överlämningar avgörande. Memory Book innebär att varje vårdare — ny eller återvändande — kliver in och känner personen, inte pappersarbetet. Observationer från varje skift bygger ett gemensamt register. Ingen ställer samma fråga två gånger.'),
('fi','common','landing.scenario3_body','Kun useat palkatut hoitajat jakavat vuoroja, johdonmukaiset siirrot ovat kriittisiä. Muistokirja tarkoittaa, että jokainen hoitaja — uusi tai palaava — astuu sisään tuntemalla henkilön, ei paperityön. Havainnointi jokaisesta vuorosta rakentaa jaetun kirjanpidon. Kukaan ei kysy samaa kysymystä kahdesti.'),
('ja','common','landing.scenario3_body','When multiple paid caregivers share shifts, consistent handoffs are critical. The Memory Book means every caregiver — new or returning — walks in knowing the person, not the paperwork. Observations from each shift build a shared record. Nobody asks the same question twice.')

ON CONFLICT (locale, namespace, key) DO NOTHING;
