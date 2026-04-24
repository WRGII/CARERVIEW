/*
  # Landing Page — Sustainability Callout, New Carer Section, Second Testimonial, Micro-Scenarios

  Adds i18n keys for:
  - Sustainability/caregiver wellbeing callout (both landing and why pages)
  - New Carer guide callout section on landing page
  - Second testimonial (planning/coordination focused)
  - Three micro-scenario cards

  All 7 locales: en, es, it, fr, de, sv, fi
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES

-- Sustainability callout (landing)
('en', 'landing.sustainability_eyebrow', 'Caregiver Wellbeing'),
('es', 'landing.sustainability_eyebrow', 'Bienestar del Cuidador'),
('it', 'landing.sustainability_eybrow', 'Benessere del Caregiver'),
('fr', 'landing.sustainability_eyebrow', 'Bien-être de l''aidant'),
('de', 'landing.sustainability_eyebrow', 'Wohlbefinden der Pflegeperson'),
('sv', 'landing.sustainability_eyebrow', 'Vårdarens välmående'),
('fi', 'landing.sustainability_eyebrow', 'Hoitajan hyvinvointi'),

('en', 'landing.sustainability_title', 'A plan that doesn''t account for the carer''s limits is not a complete plan'),
('es', 'landing.sustainability_title', 'Un plan que no tiene en cuenta los límites del cuidador no es un plan completo'),
('it', 'landing.sustainability_title', 'Un piano che non tiene conto dei limiti del caregiver non è un piano completo'),
('fr', 'landing.sustainability_title', 'Un plan qui ne tient pas compte des limites de l''aidant n''est pas un plan complet'),
('de', 'landing.sustainability_title', 'Ein Plan, der die Grenzen der Pflegeperson nicht berücksichtigt, ist kein vollständiger Plan'),
('sv', 'landing.sustainability_title', 'En plan som inte tar hänsyn till vårdarens gränser är inte en komplett plan'),
('fi', 'landing.sustainability_title', 'Suunnitelma, joka ei ota huomioon hoitajan rajoja, ei ole täydellinen suunnitelma'),

('en', 'landing.sustainability_body', 'Most care tools focus entirely on the person being cared for. CarerView is different — it tracks the wellbeing of the person doing the caring too. Caregiver stress, backup coverage, and respite time are built into the plan, not left as afterthoughts.'),
('es', 'landing.sustainability_body', 'La mayoría de las herramientas de cuidado se centran completamente en la persona cuidada. CarerView es diferente: también rastrea el bienestar de la persona que cuida. El estrés del cuidador, la cobertura de respaldo y el tiempo de descanso están integrados en el plan, no dejados como pensamientos secundarios.'),
('it', 'landing.sustainability_body', 'La maggior parte degli strumenti di assistenza si concentra completamente sulla persona assistita. CarerView è diverso: traccia anche il benessere della persona che si prende cura. Lo stress del caregiver, la copertura di riserva e il tempo di sollievo sono integrati nel piano, non lasciati come un ripensamento.'),
('fr', 'landing.sustainability_body', 'La plupart des outils de soins se concentrent entièrement sur la personne aidée. CarerView est différent — il suit également le bien-être de la personne qui s''occupe des soins. Le stress de l''aidant, la couverture de secours et le temps de répit sont intégrés dans le plan, pas laissés comme des réflexions après coup.'),
('de', 'landing.sustainability_body', 'Die meisten Pflegetools konzentrieren sich ausschließlich auf die gepflegte Person. CarerView ist anders — es verfolgt auch das Wohlbefinden der pflegenden Person. Stress der Pflegeperson, Vertretungsabdeckung und Auszeiten sind in den Plan integriert, nicht als Nachgedanken belassen.'),
('sv', 'landing.sustainability_body', 'De flesta vårdverktyg fokuserar helt på den omvårdade personen. CarerView är annorlunda — det spårar också välmåendet hos den person som ger vård. Vårdarens stress, reservtäckning och avlastningstid är inbyggda i planen, inte lämnade som eftertankar.'),
('fi', 'landing.sustainability_body', 'Useimmat hoitotyökalut keskittyvät täysin hoidettavaan henkilöön. CarerView on erilainen — se seuraa myös hoitavan henkilön hyvinvointia. Hoitajan stressi, varakattavuus ja lepoaika on rakennettu suunnitelmaan, ei jätetty jälkiajatuksiksi.'),

('en', 'landing.sustainability_b1', 'Stress level tracking for the primary caregiver'),
('es', 'landing.sustainability_b1', 'Seguimiento del nivel de estrés del cuidador principal'),
('it', 'landing.sustainability_b1', 'Monitoraggio del livello di stress del caregiver principale'),
('fr', 'landing.sustainability_b1', 'Suivi du niveau de stress de l''aidant principal'),
('de', 'landing.sustainability_b1', 'Stressniveau-Verfolgung für die Hauptpflegeperson'),
('sv', 'landing.sustainability_b1', 'Stressnivåspårning för den primära vårdaren'),
('fi', 'landing.sustainability_b1', 'Stressitason seuranta ensisijaiselle hoitajalle'),

('en', 'landing.sustainability_b2', 'Backup caregiver identified and backup plan documented'),
('es', 'landing.sustainability_b2', 'Cuidador de respaldo identificado y plan de respaldo documentado'),
('it', 'landing.sustainability_b2', 'Caregiver di riserva identificato e piano di riserva documentato'),
('fr', 'landing.sustainability_b2', 'Aidant de secours identifié et plan de secours documenté'),
('de', 'landing.sustainability_b2', 'Vertretungspflegeperson identifiziert und Vertretungsplan dokumentiert'),
('sv', 'landing.sustainability_b2', 'Reservvårdare identifierad och reservplan dokumenterad'),
('fi', 'landing.sustainability_b2', 'Varahoitaja tunnistettu ja varautumissuunnitelma dokumentoitu'),

('en', 'landing.sustainability_b3', 'Respite time planned — so caregiving stays sustainable long-term'),
('es', 'landing.sustainability_b3', 'Tiempo de descanso planificado para que el cuidado sea sostenible a largo plazo'),
('it', 'landing.sustainability_b3', 'Tempo di sollievo pianificato — così l''assistenza rimane sostenibile a lungo termine'),
('fr', 'landing.sustainability_b3', 'Temps de répit planifié — afin que les soins restent durables à long terme'),
('de', 'landing.sustainability_b3', 'Auszeit geplant — damit die Pflege langfristig nachhaltig bleibt'),
('sv', 'landing.sustainability_b3', 'Avlastningstid planerad — så att vård förblir hållbar på lång sikt'),
('fi', 'landing.sustainability_b3', 'Lepoaika suunniteltu — jotta hoitaminen pysyy kestävänä pitkällä aikavälillä'),

-- New Carer callout section (landing)
('en', 'landing.newcarer_eyebrow', 'New to caregiving?'),
('es', 'landing.newcarer_eyebrow', '¿Nuevo en el cuidado?'),
('it', 'landing.newcarer_eyebrow', 'Nuovo all''assistenza?'),
('fr', 'landing.newcarer_eyebrow', 'Nouveau dans les soins ?'),
('de', 'landing.newcarer_eyebrow', 'Neu in der Pflege?'),
('sv', 'landing.newcarer_eyebrow', 'Ny inom vård?'),
('fi', 'landing.newcarer_eyebrow', 'Uusi hoitamisessa?'),

('en', 'landing.newcarer_title', 'Start with our free Caregiver Guide'),
('es', 'landing.newcarer_title', 'Comienza con nuestra guía gratuita para cuidadores'),
('it', 'landing.newcarer_title', 'Inizia con la nostra guida gratuita per caregiver'),
('fr', 'landing.newcarer_title', 'Commencez avec notre guide gratuit pour les aidants'),
('de', 'landing.newcarer_title', 'Beginnen Sie mit unserem kostenlosen Leitfaden für Pflegepersonen'),
('sv', 'landing.newcarer_title', 'Börja med vår kostnadsfria guide för vårdare'),
('fi', 'landing.newcarer_title', 'Aloita ilmaisella hoitajan oppaallamme'),

('en', 'landing.newcarer_body', 'Eight modules covering everything a new family caregiver needs to understand — from legal authority and team roles to health coordination and sustainable planning. No sign-up required.'),
('es', 'landing.newcarer_body', 'Ocho módulos que cubren todo lo que un nuevo cuidador familiar necesita entender: desde la autoridad legal y los roles del equipo hasta la coordinación de salud y la planificación sostenible. No se requiere registro.'),
('it', 'landing.newcarer_body', 'Otto moduli che coprono tutto ciò che un nuovo caregiver familiare deve capire — dall''autorità legale e i ruoli del team alla coordinazione sanitaria e alla pianificazione sostenibile. Nessuna registrazione richiesta.'),
('fr', 'landing.newcarer_body', 'Huit modules couvrant tout ce qu''un nouvel aidant familial doit comprendre — de l''autorité légale et des rôles de l''équipe à la coordination des soins de santé et à la planification durable. Aucune inscription requise.'),
('de', 'landing.newcarer_body', 'Acht Module, die alles abdecken, was eine neue familiäre Pflegeperson verstehen muss — von der rechtlichen Vollmacht und Teamrollen bis hin zur Gesundheitskoordination und nachhaltigen Planung. Keine Anmeldung erforderlich.'),
('sv', 'landing.newcarer_body', 'Åtta moduler som täcker allt en ny familjevårdare behöver förstå — från rättslig behörighet och teamroller till hälsokoordination och hållbar planering. Ingen registrering krävs.'),
('fi', 'landing.newcarer_body', 'Kahdeksan moduulia, jotka kattavat kaiken mitä uuden perhehoitajan täytyy ymmärtää — juridisesta valtuutuksesta ja tiimirooleista terveyden koordinointiin ja kestävään suunnitteluun. Ei rekisteröitymistä tarvita.'),

('en', 'landing.newcarer_cta', 'Explore the Caregiver Guide'),
('es', 'landing.newcarer_cta', 'Explorar la Guía del Cuidador'),
('it', 'landing.newcarer_cta', 'Esplora la Guida del Caregiver'),
('fr', 'landing.newcarer_cta', 'Explorer le Guide de l''Aidant'),
('de', 'landing.newcarer_cta', 'Den Leitfaden für Pflegepersonen erkunden'),
('sv', 'landing.newcarer_cta', 'Utforska Vårdarguiden'),
('fi', 'landing.newcarer_cta', 'Tutki Hoitajan Opasta'),

('en', 'landing.newcarer_module1', 'Big Picture'),
('es', 'landing.newcarer_module1', 'Visión General'),
('it', 'landing.newcarer_module1', 'Quadro Generale'),
('fr', 'landing.newcarer_module1', 'Vue d''ensemble'),
('de', 'landing.newcarer_module1', 'Das große Bild'),
('sv', 'landing.newcarer_module1', 'Helhetsbild'),
('fi', 'landing.newcarer_module1', 'Kokonaiskuva'),

('en', 'landing.newcarer_module2', 'Care Plan'),
('es', 'landing.newcarer_module2', 'Plan de Cuidados'),
('it', 'landing.newcarer_module2', 'Piano di Cura'),
('fr', 'landing.newcarer_module2', 'Plan de soins'),
('de', 'landing.newcarer_module2', 'Pflegeplan'),
('sv', 'landing.newcarer_module2', 'Omvårdnadsplan'),
('fi', 'landing.newcarer_module2', 'Hoitosuunnitelma'),

('en', 'landing.newcarer_module3', 'Team Roles'),
('es', 'landing.newcarer_module3', 'Roles del Equipo'),
('it', 'landing.newcarer_module3', 'Ruoli del Team'),
('fr', 'landing.newcarer_module3', 'Rôles de l''équipe'),
('de', 'landing.newcarer_module3', 'Teamrollen'),
('sv', 'landing.newcarer_module3', 'Teamroller'),
('fi', 'landing.newcarer_module3', 'Tiimin roolit'),

('en', 'landing.newcarer_module4', 'Living Arrangements'),
('es', 'landing.newcarer_module4', 'Arreglos de Vida'),
('it', 'landing.newcarer_module4', 'Sistemazioni Abitative'),
('fr', 'landing.newcarer_module4', 'Arrangements de Vie'),
('de', 'landing.newcarer_module4', 'Wohnarrangements'),
('sv', 'landing.newcarer_module4', 'Boendesituationer'),
('fi', 'landing.newcarer_module4', 'Asumisjärjestelyt'),

('en', 'landing.newcarer_module5', 'Legal Authority'),
('es', 'landing.newcarer_module5', 'Autoridad Legal'),
('it', 'landing.newcarer_module5', 'Autorità Legale'),
('fr', 'landing.newcarer_module5', 'Autorité Légale'),
('de', 'landing.newcarer_module5', 'Rechtliche Vollmacht'),
('sv', 'landing.newcarer_module5', 'Rättslig Behörighet'),
('fi', 'landing.newcarer_module5', 'Oikeudellinen Valtuutus'),

('en', 'landing.newcarer_module6', 'Health Coordination'),
('es', 'landing.newcarer_module6', 'Coordinación de Salud'),
('it', 'landing.newcarer_module6', 'Coordinamento Sanitario'),
('fr', 'landing.newcarer_module6', 'Coordination des soins de santé'),
('de', 'landing.newcarer_module6', 'Gesundheitskoordination'),
('sv', 'landing.newcarer_module6', 'Hälsokoordination'),
('fi', 'landing.newcarer_module6', 'Terveyden koordinointi'),

('en', 'landing.newcarer_module7', 'Sustainability'),
('es', 'landing.newcarer_module7', 'Sostenibilidad'),
('it', 'landing.newcarer_module7', 'Sostenibilità'),
('fr', 'landing.newcarer_module7', 'Durabilité'),
('de', 'landing.newcarer_module7', 'Nachhaltigkeit'),
('sv', 'landing.newcarer_module7', 'Hållbarhet'),
('fi', 'landing.newcarer_module7', 'Kestävyys'),

('en', 'landing.newcarer_module8', 'Review & Update'),
('es', 'landing.newcarer_module8', 'Revisar y Actualizar'),
('it', 'landing.newcarer_module8', 'Revisione e Aggiornamento'),
('fr', 'landing.newcarer_module8', 'Réviser et Mettre à jour'),
('de', 'landing.newcarer_module8', 'Überprüfen & Aktualisieren'),
('sv', 'landing.newcarer_module8', 'Granska och Uppdatera'),
('fi', 'landing.newcarer_module8', 'Arvioi ja Päivitä'),

-- Second testimonial (coordination/planning focused)
('en', 'landing.testimonial2_quote', 'Mum was discharged from hospital on a Friday afternoon with a stack of instructions and nobody clear on who was doing what. CarerView helped us build a real plan that week — responsibilities assigned, authority sorted, and everyone finally on the same page.'),
('es', 'landing.testimonial2_quote', 'Mamá fue dada de alta del hospital un viernes por la tarde con un montón de instrucciones y nadie tenía claro quién hacía qué. CarerView nos ayudó a construir un plan real esa semana: responsabilidades asignadas, autoridad resuelta y todos finalmente en la misma página.'),
('it', 'landing.testimonial2_quote', 'La mamma è stata dimessa dall''ospedale un venerdì pomeriggio con un mucchio di istruzioni e nessuno era chiaro su chi stava facendo cosa. CarerView ci ha aiutato a costruire un piano reale quella settimana — responsabilità assegnate, autorità sistemata e tutti finalmente sulla stessa pagina.'),
('fr', 'landing.testimonial2_quote', 'Maman a été renvoyée de l''hôpital un vendredi après-midi avec une pile d''instructions et personne n''était clair sur qui faisait quoi. CarerView nous a aidés à construire un vrai plan cette semaine-là — responsabilités assignées, autorité clarifiée et tout le monde enfin sur la même longueur d''onde.'),
('de', 'landing.testimonial2_quote', 'Mama wurde an einem Freitagnachmittag mit einem Stapel Anweisungen aus dem Krankenhaus entlassen und niemand wusste, wer was tut. CarerView half uns, in dieser Woche einen echten Plan zu erstellen — Verantwortlichkeiten zugewiesen, Vollmacht geklärt und alle endlich auf dem gleichen Stand.'),
('sv', 'landing.testimonial2_quote', 'Mamma skrevs ut från sjukhuset en fredag eftermiddag med en hög instruktioner och ingen var klar på vem som gjorde vad. CarerView hjälpte oss att bygga en riktig plan den veckan — ansvar tilldelat, behörighet sorterad och alla äntligen på samma sida.'),
('fi', 'landing.testimonial2_quote', 'Äiti kotiutettiin sairaalasta perjantai-iltapäivänä ohjeiden kasa kädessä eikä kenellekään ollut selvää kuka tekee mitäkin. CarerView auttoi meitä rakentamaan todellisen suunnitelman sillä viikolla — vastuut jaettu, valtuutus selvitetty ja kaikki viimeinkin samalla sivulla.'),

('en', 'landing.testimonial2_name', 'Sarah M.'),
('es', 'landing.testimonial2_name', 'Sarah M.'),
('it', 'landing.testimonial2_name', 'Sarah M.'),
('fr', 'landing.testimonial2_name', 'Sarah M.'),
('de', 'landing.testimonial2_name', 'Sarah M.'),
('sv', 'landing.testimonial2_name', 'Sarah M.'),
('fi', 'landing.testimonial2_name', 'Sarah M.'),

('en', 'landing.testimonial2_loc', 'Manchester, UK'),
('es', 'landing.testimonial2_loc', 'Manchester, Reino Unido'),
('it', 'landing.testimonial2_loc', 'Manchester, Regno Unito'),
('fr', 'landing.testimonial2_loc', 'Manchester, Royaume-Uni'),
('de', 'landing.testimonial2_loc', 'Manchester, UK'),
('sv', 'landing.testimonial2_loc', 'Manchester, Storbritannien'),
('fi', 'landing.testimonial2_loc', 'Manchester, Iso-Britannia'),

-- Update first testimonial location for currency consistency
('en', 'landing.testimonial_loc', 'Denver, Colorado'),
('es', 'landing.testimonial_loc', 'Denver, Colorado'),
('it', 'landing.testimonial_loc', 'Denver, Colorado'),
('fr', 'landing.testimonial_loc', 'Denver, Colorado'),
('de', 'landing.testimonial_loc', 'Denver, Colorado'),
('sv', 'landing.testimonial_loc', 'Denver, Colorado'),
('fi', 'landing.testimonial_loc', 'Denver, Colorado'),

-- Micro-scenarios section
('en', 'landing.scenarios_eyebrow', 'How families use CarerView'),
('es', 'landing.scenarios_eyebrow', 'Cómo las familias usan CarerView'),
('it', 'landing.scenarios_eyebrow', 'Come le famiglie usano CarerView'),
('fr', 'landing.scenarios_eyebrow', 'Comment les familles utilisent CarerView'),
('de', 'landing.scenarios_eyebrow', 'Wie Familien CarerView nutzen'),
('sv', 'landing.scenarios_eyebrow', 'Hur familjer använder CarerView'),
('fi', 'landing.scenarios_eyebrow', 'Kuinka perheet käyttävät CarerView''ta'),

('en', 'landing.scenarios_title', 'Real situations. Real coordination.'),
('es', 'landing.scenarios_title', 'Situaciones reales. Coordinación real.'),
('it', 'landing.scenarios_title', 'Situazioni reali. Coordinamento reale.'),
('fr', 'landing.scenarios_title', 'Situations réelles. Coordination réelle.'),
('de', 'landing.scenarios_title', 'Reale Situationen. Echte Koordination.'),
('sv', 'landing.scenarios_title', 'Verkliga situationer. Verklig koordination.'),
('fi', 'landing.scenarios_title', 'Todelliset tilanteet. Todellinen koordinointi.'),

-- Scenario 1: Long-distance coordination
('en', 'landing.scenario1_title', 'Long-distance family coordination'),
('es', 'landing.scenario1_title', 'Coordinación familiar a larga distancia'),
('it', 'landing.scenario1_title', 'Coordinamento familiare a distanza'),
('fr', 'landing.scenario1_title', 'Coordination familiale à distance'),
('de', 'landing.scenario1_title', 'Koordination über weite Entfernungen'),
('sv', 'landing.scenario1_title', 'Långdistanskoordination i familjen'),
('fi', 'landing.scenario1_title', 'Perhekoordination pitkän matkan päähän'),

('en', 'landing.scenario1_body', 'Three siblings in three cities, one parent needing daily care. CarerView gives everyone access to the same observations, the same plan, and the same Memory Book — so no one is working from a different version of events. The distant sibling checks in before calling, not after.'),
('es', 'landing.scenario1_body', 'Tres hermanos en tres ciudades, un padre que necesita cuidado diario. CarerView da a todos acceso a las mismas observaciones, el mismo plan y el mismo Memory Book, para que nadie trabaje con una versión diferente de los hechos. El hermano distante revisa antes de llamar, no después.'),
('it', 'landing.scenario1_body', 'Tre fratelli in tre città, un genitore che ha bisogno di cure quotidiane. CarerView dà a tutti accesso alle stesse osservazioni, allo stesso piano e allo stesso Memory Book — così nessuno lavora da una versione diversa degli eventi. Il fratello lontano controlla prima di chiamare, non dopo.'),
('fr', 'landing.scenario1_body', 'Trois frères et sœurs dans trois villes, un parent ayant besoin de soins quotidiens. CarerView donne à chacun accès aux mêmes observations, au même plan et au même Memory Book — afin que personne ne travaille à partir d''une version différente des événements. Le frère ou la sœur distant vérifie avant d''appeler, pas après.'),
('de', 'landing.scenario1_body', 'Drei Geschwister in drei Städten, ein Elternteil mit täglichem Pflegebedarf. CarerView gibt allen Zugriff auf dieselben Beobachtungen, denselben Plan und dasselbe Memory Book — sodass niemand mit einer anderen Version der Ereignisse arbeitet. Das entfernte Geschwister checkt vor dem Anruf, nicht danach.'),
('sv', 'landing.scenario1_body', 'Tre syskon i tre städer, en förälder som behöver daglig vård. CarerView ger alla tillgång till samma observationer, samma plan och samma Memory Book — så att ingen arbetar utifrån en annan version av händelserna. Det avlägsna syskonet checkar in innan de ringer, inte efter.'),
('fi', 'landing.scenario1_body', 'Kolme sisarusta kolmessa kaupungissa, yksi vanhempi joka tarvitsee päivittäistä hoitoa. CarerView antaa kaikille pääsyn samoihin havaintoihin, samaan suunnitelmaan ja samaan muistokirjaan — jotta kukaan ei työskentelisi eri versiosta tapahtumista. Kaukainen sisarus tarkistaa ennen soittamista, ei jälkeen.'),

-- Scenario 2: Hospital-to-home transition
('en', 'landing.scenario2_title', 'Hospital-to-home planning'),
('es', 'landing.scenario2_title', 'Planificación del hospital al hogar'),
('it', 'landing.scenario2_title', 'Pianificazione dall''ospedale a casa'),
('fr', 'landing.scenario2_title', 'Planification du retour à domicile'),
('de', 'landing.scenario2_title', 'Planung vom Krankenhaus nach Hause'),
('sv', 'landing.scenario2_title', 'Planering från sjukhus till hemmet'),
('fi', 'landing.scenario2_title', 'Suunnittelu sairaalasta kotiin'),

('en', 'landing.scenario2_body', 'Discharge instructions arrive at once — medications, follow-ups, restrictions, who to call if things change. CarerView turns that chaos into a structured plan: responsibilities assigned, observations started from day one, and early warning flags if something shifts. The first two weeks after discharge are the highest-risk period. CarerView brings structure to exactly that moment.'),
('es', 'landing.scenario2_body', 'Las instrucciones de alta llegan de golpe: medicamentos, seguimientos, restricciones, a quién llamar si las cosas cambian. CarerView convierte ese caos en un plan estructurado: responsabilidades asignadas, observaciones iniciadas desde el primer día y señales de alerta temprana si algo cambia. Las primeras dos semanas después del alta son el período de mayor riesgo. CarerView aporta estructura exactamente a ese momento.'),
('it', 'landing.scenario2_body', 'Le istruzioni di dimissione arrivano tutte in una volta: farmaci, follow-up, restrizioni, chi chiamare se le cose cambiano. CarerView trasforma quel caos in un piano strutturato: responsabilità assegnate, osservazioni avviate dal primo giorno e segnali di allerta precoce se qualcosa cambia. Le prime due settimane dopo la dimissione sono il periodo a più alto rischio. CarerView porta struttura esattamente in quel momento.'),
('fr', 'landing.scenario2_body', 'Les instructions de sortie arrivent toutes à la fois — médicaments, suivis, restrictions, qui appeler si les choses changent. CarerView transforme ce chaos en un plan structuré : responsabilités assignées, observations commencées dès le premier jour et signaux d''alerte précoce si quelque chose change. Les deux premières semaines après la sortie sont la période la plus risquée. CarerView apporte de la structure à exactement ce moment-là.'),
('de', 'landing.scenario2_body', 'Entlassungsanweisungen kommen auf einmal — Medikamente, Nachsorgetermine, Einschränkungen, wen man anrufen soll, wenn sich etwas ändert. CarerView verwandelt dieses Chaos in einen strukturierten Plan: Verantwortlichkeiten zugewiesen, Beobachtungen ab dem ersten Tag gestartet und Frühwarnzeichen, wenn sich etwas verändert. Die ersten zwei Wochen nach der Entlassung sind die risikoreichste Zeit. CarerView bringt Struktur genau in diesen Moment.'),
('sv', 'landing.scenario2_body', 'Utskrivningsinstruktioner anländer på en gång — mediciner, uppföljningar, begränsningar, vem man ska ringa om saker förändras. CarerView förvandlar det kaoset till en strukturerad plan: ansvar tilldelat, observationer startade från dag ett och tidiga varningssignaler om något förändras. De första två veckorna efter utskrivning är den högsta riskperioden. CarerView ger struktur till exakt det ögonblicket.'),
('fi', 'landing.scenario2_body', 'Kotiutusohjeet saapuvat kerralla — lääkkeet, seurantakäynnit, rajoitukset, kenelle soittaa jos asiat muuttuvat. CarerView muuttaa sen kaaoksen jäsennellyksi suunnitelmaksi: vastuut jaettu, havainnot aloitettu ensimmäisestä päivästä ja varhaisvaroitusmerkit jos jotain muuttuu. Ensimmäiset kaksi viikkoa kotiutumisen jälkeen ovat korkean riskin aikaa. CarerView tuo rakennetta juuri siihen hetkeen.'),

-- Scenario 3: Rotating caregivers
('en', 'landing.scenario3_title', 'Rotating paid caregivers'),
('es', 'landing.scenario3_title', 'Cuidadores profesionales rotativos'),
('it', 'landing.scenario3_title', 'Caregiver professionali a rotazione'),
('fr', 'landing.scenario3_title', 'Soignants professionnels rotatifs'),
('de', 'landing.scenario3_title', 'Rotierende bezahlte Pflegepersonen'),
('sv', 'landing.scenario3_title', 'Roterande betalda vårdare'),
('fi', 'landing.scenario3_title', 'Vuorottelevat palkatut hoitajat'),

('en', 'landing.scenario3_body', 'When multiple paid caregivers share shifts, consistent handoffs are critical. The Memory Book means every caregiver — new or returning — walks in knowing the person, not the paperwork. Observations from each shift build a shared record. Nobody asks the same question twice.'),
('es', 'landing.scenario3_body', 'Cuando varios cuidadores profesionales comparten turnos, los traspasos consistentes son críticos. El Memory Book significa que cada cuidador, nuevo o que regresa, entra conociendo a la persona, no los trámites. Las observaciones de cada turno construyen un registro compartido. Nadie hace la misma pregunta dos veces.'),
('it', 'landing.scenario3_body', 'Quando più caregiver professionali condividono i turni, i passaggi di consegne coerenti sono fondamentali. Il Memory Book significa che ogni caregiver — nuovo o di ritorno — entra conoscendo la persona, non le pratiche burocratiche. Le osservazioni di ogni turno costruiscono un registro condiviso. Nessuno fa la stessa domanda due volte.'),
('fr', 'landing.scenario3_body', 'Lorsque plusieurs soignants professionnels partagent des quarts de travail, des passages de relais cohérents sont essentiels. Le Memory Book signifie que chaque soignant — nouveau ou de retour — entre en connaissant la personne, pas la paperasse. Les observations de chaque quart constituent un dossier partagé. Personne ne pose la même question deux fois.'),
('de', 'landing.scenario3_body', 'Wenn mehrere bezahlte Pflegepersonen Schichten teilen, sind konsistente Übergaben entscheidend. Das Memory Book bedeutet, dass jede Pflegeperson — neu oder zurückkehrend — hereinkommt und die Person kennt, nicht den Papierkram. Beobachtungen aus jeder Schicht erstellen ein gemeinsames Protokoll. Niemand stellt dieselbe Frage zweimal.'),
('sv', 'landing.scenario3_body', 'När flera betalda vårdare delar skift är konsekventa överlämningar avgörande. Memory Book innebär att varje vårdare — ny eller återvändande — kliver in och känner personen, inte pappersarbetet. Observationer från varje skift bygger ett gemensamt register. Ingen ställer samma fråga två gånger.'),
('fi', 'landing.scenario3_body', 'Kun useat palkatut hoitajat jakavat vuoroja, johdonmukaiset siirrot ovat kriittisiä. Muistokirja tarkoittaa, että jokainen hoitaja — uusi tai palaava — astuu sisään tuntemalla henkilön, ei paperityön. Havainnointi jokaisesta vuorosta rakentaa jaetun kirjanpidon. Kukaan ei kysy samaa kysymystä kahdesti.')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
