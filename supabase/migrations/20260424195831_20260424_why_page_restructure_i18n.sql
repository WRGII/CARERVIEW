/*
  # Why CarerView Page — Full Restructure i18n Keys

  New hero (planning/coordination focused), Care Plan section, updated personas
  (2 refreshed to planning/coordination scenarios), Sustainability callout,
  New Carer section, expanded FAQ (2 new entries), and updated section titles.

  All 7 locales: en, es, it, fr, de, sv, fi
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES

-- Hero rewrite
('en', 'why.hero_title', 'Coordinated caregiving doesn''t happen by accident'),
('es', 'why.hero_title', 'El cuidado coordinado no ocurre por casualidad'),
('it', 'why.hero_title', 'L''assistenza coordinata non avviene per caso'),
('fr', 'why.hero_title', 'Les soins coordonnés ne se produisent pas par hasard'),
('de', 'why.hero_title', 'Koordinierte Pflege geschieht nicht zufällig'),
('sv', 'why.hero_title', 'Koordinerad vård händer inte av en slump'),
('fi', 'why.hero_title', 'Koordinoitu hoitaminen ei tapahdu sattumalta'),

('en', 'why.hero_body', 'Every family caregiver eventually faces the same gaps: no one knows who holds medical authority, responsibilities overlap or fall through, the primary caregiver is running on empty with no backup, and the plan exists only in someone''s head. CarerView gives your team a structured framework to close those gaps — and ongoing observations to keep the plan accurate as needs evolve.'),
('es', 'why.hero_body', 'Todo cuidador familiar eventualmente enfrenta las mismas brechas: nadie sabe quién tiene autoridad médica, las responsabilidades se superponen o se pierden, el cuidador principal está agotado sin respaldo y el plan solo existe en la cabeza de alguien. CarerView da a tu equipo un marco estructurado para cerrar esas brechas, y observaciones continuas para mantener el plan preciso a medida que las necesidades evolucionan.'),
('it', 'why.hero_body', 'Ogni caregiver familiare alla fine affronta le stesse lacune: nessuno sa chi ha l''autorità medica, le responsabilità si sovrappongono o cadono nel vuoto, il caregiver principale è a corto di energie senza riserve e il piano esiste solo nella testa di qualcuno. CarerView dà al tuo team un quadro strutturato per colmare quelle lacune, e osservazioni continue per mantenere il piano accurato man mano che le esigenze evolvono.'),
('fr', 'why.hero_body', 'Chaque aidant familial finit par faire face aux mêmes lacunes : personne ne sait qui détient l''autorité médicale, les responsabilités se chevauchent ou passent à travers les mailles, l''aidant principal tourne à vide sans soutien, et le plan n''existe que dans la tête de quelqu''un. CarerView donne à votre équipe un cadre structuré pour combler ces lacunes, et des observations continues pour maintenir le plan précis à mesure que les besoins évoluent.'),
('de', 'why.hero_body', 'Jede Familienpflegeperson stößt irgendwann auf dieselben Lücken: Niemand weiß, wer die medizinische Vollmacht hat, Verantwortlichkeiten überschneiden sich oder fallen durch, die Hauptpflegeperson läuft auf Reserve ohne Backup, und der Plan existiert nur in jemandes Kopf. CarerView gibt Ihrem Team einen strukturierten Rahmen, um diese Lücken zu schließen — und laufende Beobachtungen, um den Plan aktuell zu halten.'),
('sv', 'why.hero_body', 'Varje familjevårdare möter så småningom samma luckor: ingen vet vem som har medicinsk behörighet, ansvar överlappar eller faller igenom, den primära vårdaren kör på tomgång utan backup, och planen finns bara i någons huvud. CarerView ger ditt team ett strukturerat ramverk för att stänga de luckorna — och löpande observationer för att hålla planen korrekt när behoven utvecklas.'),
('fi', 'why.hero_body', 'Jokainen perhehoitaja kohtaa lopulta samat aukot: kukaan ei tiedä kuka pitää lääketieteellistä valtuutusta, vastuut päällekkäistyvät tai putoavat halkeamiin, ensisijainen hoitaja toimii varauksilla ilman varahoitajaa ja suunnitelma on olemassa vain jonkun päässä. CarerView antaa tiimillesi jäsennellyn kehyksen noiden aukkojen sulkemiseen — ja jatkuvat havainnot suunnitelman pitämiseksi tarkkana tarpeiden kehittyessä.'),

-- Care Plan section on Why page
('en', 'why.careplan_eyebrow', 'The Care Plan'),
('es', 'why.careplan_eyebrow', 'El Plan de Cuidados'),
('it', 'why.careplan_eyebrow', 'Il Piano di Cura'),
('fr', 'why.careplan_eyebrow', 'Le Plan de soins'),
('de', 'why.careplan_eyebrow', 'Der Pflegeplan'),
('sv', 'why.careplan_eyebrow', 'Omvårdnadsplanen'),
('fi', 'why.careplan_eyebrow', 'Hoitosuunnitelma'),

('en', 'why.careplan_title', 'A professional-grade framework built for families'),
('es', 'why.careplan_title', 'Un marco de nivel profesional construido para familias'),
('it', 'why.careplan_title', 'Un quadro di livello professionale costruito per le famiglie'),
('fr', 'why.careplan_title', 'Un cadre de niveau professionnel conçu pour les familles'),
('de', 'why.careplan_title', 'Ein professionelles Framework für Familien entwickelt'),
('sv', 'why.careplan_title', 'Ett professionellt ramverk byggt för familjer'),
('fi', 'why.careplan_title', 'Ammattitason kehys rakennettu perheille'),

('en', 'why.careplan_body', 'The CarerView Care Plan covers every dimension that matters — not just the care recipient''s needs, but the team''s capacity, the legal authority structure, and a mechanism for keeping the plan current. Each section asks the questions families discover they needed answers to months earlier.'),
('es', 'why.careplan_body', 'El Plan de Cuidados de CarerView cubre cada dimensión importante: no solo las necesidades de la persona cuidada, sino también la capacidad del equipo, la estructura de autoridad legal y un mecanismo para mantener el plan actualizado. Cada sección hace las preguntas que las familias descubren que necesitaban responder meses antes.'),
('it', 'why.careplan_body', 'Il Piano di Cura di CarerView copre ogni dimensione che conta — non solo le esigenze della persona assistita, ma anche la capacità del team, la struttura dell''autorità legale e un meccanismo per mantenere il piano aggiornato. Ogni sezione pone le domande che le famiglie scoprono di aver avuto bisogno di risposta mesi prima.'),
('fr', 'why.careplan_body', 'Le Plan de soins CarerView couvre chaque dimension qui compte — pas seulement les besoins de la personne aidée, mais aussi la capacité de l''équipe, la structure d''autorité légale et un mécanisme pour maintenir le plan à jour. Chaque section pose les questions auxquelles les familles découvrent qu''elles avaient besoin de réponses des mois plus tôt.'),
('de', 'why.careplan_body', 'Der CarerView Pflegeplan deckt jede wichtige Dimension ab — nicht nur die Bedürfnisse der gepflegten Person, sondern auch die Kapazität des Teams, die rechtliche Vollmachtsstruktur und einen Mechanismus zur Aktualisierung des Plans. Jeder Abschnitt stellt die Fragen, auf die Familien feststellen, dass sie Monate früher Antworten benötigt hätten.'),
('sv', 'why.careplan_body', 'CarerViews omvårdnadsplan täcker varje dimension som spelar roll — inte bara den omvårdades behov, utan också teamets kapacitet, den rättsliga behörighetsstrukturen och en mekanism för att hålla planen aktuell. Varje avsnitt ställer frågorna som familjer upptäcker att de behövde svar på månader tidigare.'),
('fi', 'why.careplan_body', 'CarerView-hoitosuunnitelma kattaa jokaisen tärkeän ulottuvuuden — ei vain hoidettavan tarpeet, vaan myös tiimin kapasiteetin, oikeudellisen valtuutusrakenteen ja mekanismin suunnitelman pitämiseksi ajan tasalla. Jokainen osio esittää kysymykset, joihin perheet huomaavat tarvitseensa vastauksia kuukausia aiemmin.'),

-- Decision Engine on Why page
('en', 'why.engine_title', 'The Decision Engine: gaps surfaced before they become crises'),
('es', 'why.engine_title', 'El Motor de Decisiones: vacíos detectados antes de convertirse en crisis'),
('it', 'why.engine_title', 'Il Motore Decisionale: lacune emerse prima che diventino crisi'),
('fr', 'why.engine_title', 'Le Moteur de Décision : lacunes détectées avant qu''elles ne deviennent des crises'),
('de', 'why.engine_title', 'Die Entscheidungs-Engine: Lücken aufgedeckt, bevor sie zu Krisen werden'),
('sv', 'why.engine_title', 'Beslutsmotorn: luckor identifierade innan de blir kriser'),
('fi', 'why.engine_title', 'Päätösmoottori: aukot havaittu ennen kuin niistä tulee kriisejä'),

('en', 'why.engine_body', 'As you build your Care Plan, CarerView''s Decision Engine reads what is missing and flags it by severity. Critical gaps — like missing medical authority or no backup caregiver — appear at the top. Important gaps — like unassigned responsibilities — follow. The plan tells you what to act on first, not what to worry about later.'),
('es', 'why.engine_body', 'A medida que construyes tu Plan de Cuidados, el Motor de Decisiones de CarerView lee lo que falta y lo señala por gravedad. Las brechas críticas, como la falta de autoridad médica o la ausencia de un cuidador de respaldo, aparecen en la cima. Las brechas importantes, como las responsabilidades sin asignar, les siguen. El plan te dice en qué actuar primero, no de qué preocuparte después.'),
('it', 'why.engine_body', 'Man mano che costruisci il tuo Piano di Cura, il Motore Decisionale di CarerView legge ciò che manca e lo segnala per gravità. Le lacune critiche — come la mancanza di autorità medica o nessun caregiver di riserva — appaiono in cima. Le lacune importanti — come le responsabilità non assegnate — seguono. Il piano ti dice su cosa agire prima, non di cosa preoccuparti dopo.'),
('fr', 'why.engine_body', 'Au fur et à mesure que vous construisez votre Plan de soins, le Moteur de Décision de CarerView lit ce qui manque et le signale par gravité. Les lacunes critiques — comme l''absence d''autorité médicale ou aucun aidant de secours — apparaissent en haut. Les lacunes importantes — comme les responsabilités non assignées — suivent. Le plan vous indique sur quoi agir en premier, pas ce dont vous inquiéter plus tard.'),
('de', 'why.engine_body', 'Während Sie Ihren Pflegeplan erstellen, liest die Entscheidungs-Engine von CarerView, was fehlt, und kennzeichnet es nach Schweregrad. Kritische Lücken — wie fehlende medizinische Vollmacht oder keine Vertretungspflegeperson — erscheinen oben. Wichtige Lücken — wie nicht zugewiesene Verantwortlichkeiten — folgen. Der Plan sagt Ihnen, worauf Sie zuerst handeln sollen, nicht worüber Sie sich später sorgen sollen.'),
('sv', 'why.engine_body', 'När du bygger din omvårdnadsplan läser CarerViews beslutsmotorn vad som saknas och flaggar det efter allvarlighetsgrad. Kritiska luckor — som saknad medicinsk behörighet eller ingen reservvårdare — visas överst. Viktiga luckor — som otilldelade ansvarsområden — följer. Planen berättar vad du ska agera på först, inte vad du ska oroa dig för senare.'),
('fi', 'why.engine_body', 'Rakentaessasi hoitosuunnitelmaasi CarerView''n päätösmoottori lukee mitä puuttuu ja merkitsee sen vakavuusasteen mukaan. Kriittiset aukot — kuten puuttuva lääketieteellinen valtuutus tai ei varahoitajaa — näkyvät ylhäällä. Tärkeät aukot — kuten jakamattomia vastuita — seuraavat. Suunnitelma kertoo sinulle mihin toimia ensin, ei mistä huolestua myöhemmin.'),

-- Sustainability callout (why page)
('en', 'why.sustainability_eyebrow', 'Caregiver Wellbeing'),
('es', 'why.sustainability_eyebrow', 'Bienestar del Cuidador'),
('it', 'why.sustainability_eyebrow', 'Benessere del Caregiver'),
('fr', 'why.sustainability_eyebrow', 'Bien-être de l''aidant'),
('de', 'why.sustainability_eyebrow', 'Wohlbefinden der Pflegeperson'),
('sv', 'why.sustainability_eyebrow', 'Vårdarens välmående'),
('fi', 'why.sustainability_eyebrow', 'Hoitajan hyvinvointi'),

('en', 'why.sustainability_title', 'CarerView tracks the carer, not just the care recipient'),
('es', 'why.sustainability_title', 'CarerView rastrea al cuidador, no solo a la persona cuidada'),
('it', 'why.sustainability_title', 'CarerView monitora il caregiver, non solo la persona assistita'),
('fr', 'why.sustainability_title', 'CarerView suit l''aidant, pas seulement la personne aidée'),
('de', 'why.sustainability_title', 'CarerView verfolgt die Pflegeperson, nicht nur die gepflegte Person'),
('sv', 'why.sustainability_title', 'CarerView spårar vårdaren, inte bara den omvårdade'),
('fi', 'why.sustainability_title', 'CarerView seuraa hoitajaa, ei vain hoidettavaa'),

('en', 'why.sustainability_body', 'Caregiver burnout is one of the biggest risks in family care — and it''s usually invisible until it''s too late. CarerView''s Sustainability section tracks stress levels, backup cover, and respite planning for the primary caregiver. When the plan flags a risk, the team knows before a crisis forces the conversation.'),
('es', 'why.sustainability_body', 'El agotamiento del cuidador es uno de los mayores riesgos en el cuidado familiar, y generalmente es invisible hasta que es demasiado tarde. La sección de Sostenibilidad de CarerView rastrea los niveles de estrés, la cobertura de respaldo y la planificación del descanso para el cuidador principal. Cuando el plan señala un riesgo, el equipo lo sabe antes de que una crisis fuerce la conversación.'),
('it', 'why.sustainability_body', 'Il burnout del caregiver è uno dei maggiori rischi nell''assistenza familiare — e di solito è invisibile finché non è troppo tardi. La sezione Sostenibilità di CarerView traccia i livelli di stress, la copertura di riserva e la pianificazione del sollievo per il caregiver principale. Quando il piano segnala un rischio, il team lo sa prima che una crisi forzi la conversazione.'),
('fr', 'why.sustainability_body', 'L''épuisement de l''aidant est l''un des plus grands risques dans les soins familiaux — et il est généralement invisible jusqu''à ce qu''il soit trop tard. La section Durabilité de CarerView suit les niveaux de stress, la couverture de secours et la planification du répit pour l''aidant principal. Lorsque le plan signale un risque, l''équipe le sait avant qu''une crise ne force la conversation.'),
('de', 'why.sustainability_body', 'Burnout der Pflegeperson ist eines der größten Risiken in der Familienpflege — und ist normalerweise unsichtbar, bis es zu spät ist. Der Nachhaltigkeitsbereich von CarerView verfolgt Stressniveaus, Vertretungsabdeckung und Auszeit-Planung für die Hauptpflegeperson. Wenn der Plan ein Risiko markiert, weiß das Team es, bevor eine Krise das Gespräch erzwingt.'),
('sv', 'why.sustainability_body', 'Vårdarutbrändhet är en av de största riskerna inom familjeomsorg — och är vanligtvis osynlig tills det är för sent. CarerViews hållbarhetsavsnitt spårar stressnivåer, reservtäckning och avlastningsplanering för den primära vårdaren. När planen flaggar en risk vet teamet det innan en kris tvingar fram samtalet.'),
('fi', 'why.sustainability_body', 'Hoitajan uupumus on yksi suurimmista riskeistä perheenhoidossa — ja se on yleensä näkymätöntä kunnes on liian myöhäistä. CarerView''n kestävyysosio seuraa stressitasoja, varakattavuutta ja leposuunnittelua ensisijaiselle hoitajalle. Kun suunnitelma merkitsee riskin, tiimi tietää sen ennen kuin kriisi pakottaa keskustelun.'),

-- Refreshed personas (2 new: hospital discharge + sustainability)
('en', 'why.persona3_title', 'Managing a hospital discharge'),
('es', 'why.persona3_title', 'Gestionando un alta hospitalaria'),
('it', 'why.persona3_title', 'Gestire una dimissione ospedaliera'),
('fr', 'why.persona3_title', 'Gérer une sortie d''hôpital'),
('de', 'why.persona3_title', 'Krankenhausentlassung organisieren'),
('sv', 'why.persona3_title', 'Hantera en sjukhusutskrivning'),
('fi', 'why.persona3_title', 'Sairaalakotiutuksen hallinta'),

('en', 'why.persona3_quote', 'Discharge day was overwhelming. CarerView helped us turn a pile of instructions into a real plan — everyone knew their role within 48 hours.'),
('es', 'why.persona3_quote', 'El día del alta fue abrumador. CarerView nos ayudó a convertir un montón de instrucciones en un plan real: todos conocían su rol en 48 horas.'),
('it', 'why.persona3_quote', 'Il giorno della dimissione era travolgente. CarerView ci ha aiutato a trasformare un mucchio di istruzioni in un piano reale: tutti conoscevano il loro ruolo entro 48 ore.'),
('fr', 'why.persona3_quote', 'Le jour de la sortie était accablant. CarerView nous a aidés à transformer une pile d''instructions en un vrai plan — tout le monde connaissait son rôle en 48 heures.'),
('de', 'why.persona3_quote', 'Der Entlassungstag war überwältigend. CarerView half uns, einen Stapel Anweisungen in einen echten Plan umzuwandeln — jeder kannte seine Rolle innerhalb von 48 Stunden.'),
('sv', 'why.persona3_quote', 'Utskrivningsdagen var överväldigande. CarerView hjälpte oss att förvandla en hög instruktioner till en riktig plan — alla kände sin roll inom 48 timmar.'),
('fi', 'why.persona3_quote', 'Kotiutumispäivä oli ylivoimainen. CarerView auttoi meitä muuttamaan ohjeiden kasan todelliseksi suunnitelmaksi — kaikki tiesivät roolinsa 48 tunnin kuluessa.'),

('en', 'why.persona3_b1', 'Responsibilities assigned from day one — no one falls through the gaps'),
('es', 'why.persona3_b1', 'Responsabilidades asignadas desde el primer día: nadie cae por las grietas'),
('it', 'why.persona3_b1', 'Responsabilità assegnate fin dal primo giorno — nessuno cade nelle lacune'),
('fr', 'why.persona3_b1', 'Responsabilités assignées dès le premier jour — personne ne passe à travers les mailles'),
('de', 'why.persona3_b1', 'Verantwortlichkeiten ab dem ersten Tag zugewiesen — niemand fällt durch die Ritzen'),
('sv', 'why.persona3_b1', 'Ansvar tilldelat från dag ett — ingen faller igenom sprickorna'),
('fi', 'why.persona3_b1', 'Vastuut jaettu ensimmäisestä päivästä — kukaan ei putoa halkeamiin'),

('en', 'why.persona3_b2', 'Observations started immediately — early warning if something shifts'),
('es', 'why.persona3_b2', 'Observaciones iniciadas de inmediato: alerta temprana si algo cambia'),
('it', 'why.persona3_b2', 'Osservazioni avviate immediatamente — allarme precoce se qualcosa cambia'),
('fr', 'why.persona3_b2', 'Observations commencées immédiatement — alerte précoce si quelque chose change'),
('de', 'why.persona3_b2', 'Beobachtungen sofort gestartet — Frühwarnung, wenn sich etwas verändert'),
('sv', 'why.persona3_b2', 'Observationer startade omedelbart — tidig varning om något förändras'),
('fi', 'why.persona3_b2', 'Havainnot aloitettu välittömästi — varhainen varoitus jos jotain muuttuu'),

('en', 'why.persona3_b3', 'Clinician-ready summaries to share at follow-up appointments'),
('es', 'why.persona3_b3', 'Resúmenes listos para el médico para compartir en citas de seguimiento'),
('it', 'why.persona3_b3', 'Riepiloghi pronti per il medico da condividere agli appuntamenti di follow-up'),
('fr', 'why.persona3_b3', 'Résumés prêts pour les cliniciens à partager lors des rendez-vous de suivi'),
('de', 'why.persona3_b3', 'Kliniker-fertige Zusammenfassungen für Nachsorgetermine'),
('sv', 'why.persona3_b3', 'Klinikerfärdiga sammanfattningar att dela vid uppföljningsbesök'),
('fi', 'why.persona3_b3', 'Klinikkoille valmiit yhteenvedot seurantakäynneille jaettavaksi'),

('en', 'why.persona4_title', 'Primary caregiver near burnout'),
('es', 'why.persona4_title', 'Cuidador principal al borde del agotamiento'),
('it', 'why.persona4_title', 'Caregiver principale vicino al burnout'),
('fr', 'why.persona4_title', 'Aidant principal proche de l''épuisement'),
('de', 'why.persona4_title', 'Hauptpflegeperson kurz vor dem Burnout'),
('sv', 'why.persona4_title', 'Primär vårdare nära utbrändhet'),
('fi', 'why.persona4_title', 'Ensisijainen hoitaja lähellä uupumusta'),

('en', 'why.persona4_quote', 'I was doing everything alone and nobody could see it. CarerView made my situation visible to the rest of the family — and that''s when things finally started to change.'),
('es', 'why.persona4_quote', 'Lo estaba haciendo todo solo y nadie podía verlo. CarerView hizo mi situación visible para el resto de la familia, y fue entonces cuando las cosas finalmente comenzaron a cambiar.'),
('it', 'why.persona4_quote', 'Stavo facendo tutto da solo e nessuno poteva vederlo. CarerView ha reso la mia situazione visibile al resto della famiglia — ed è allora che le cose hanno finalmente iniziato a cambiare.'),
('fr', 'why.persona4_quote', 'Je faisais tout seul et personne ne pouvait le voir. CarerView a rendu ma situation visible au reste de la famille — et c''est là que les choses ont finalement commencé à changer.'),
('de', 'why.persona4_quote', 'Ich machte alles alleine und niemand konnte es sehen. CarerView machte meine Situation für den Rest der Familie sichtbar — und dann begannen sich die Dinge endlich zu ändern.'),
('sv', 'why.persona4_quote', 'Jag gjorde allt ensam och ingen kunde se det. CarerView gjorde min situation synlig för resten av familjen — och det var då saker äntligen började förändras.'),
('fi', 'why.persona4_quote', 'Tein kaiken yksin eikä kukaan pystynyt näkemään sitä. CarerView teki tilanteeni näkyväksi muulle perheelle — ja silloin asiat viimeinkin alkoivat muuttua.'),

('en', 'why.persona4_b1', 'Stress level tracked and visible to the whole team — not just the caregiver'),
('es', 'why.persona4_b1', 'Nivel de estrés rastreado y visible para todo el equipo, no solo para el cuidador'),
('it', 'why.persona4_b1', 'Livello di stress tracciato e visibile a tutto il team — non solo al caregiver'),
('fr', 'why.persona4_b1', 'Niveau de stress suivi et visible pour toute l''équipe — pas seulement pour l''aidant'),
('de', 'why.persona4_b1', 'Stressniveau verfolgt und für das gesamte Team sichtbar — nicht nur für die Pflegeperson'),
('sv', 'why.persona4_b1', 'Stressnivå spårad och synlig för hela teamet — inte bara för vårdaren'),
('fi', 'why.persona4_b1', 'Stressitaso seurattu ja näkyvissä koko tiimille — ei vain hoitajalle'),

('en', 'why.persona4_b2', 'Backup caregiver identified and plan documented before the breaking point'),
('es', 'why.persona4_b2', 'Cuidador de respaldo identificado y plan documentado antes del punto de quiebre'),
('it', 'why.persona4_b2', 'Caregiver di riserva identificato e piano documentato prima del punto di rottura'),
('fr', 'why.persona4_b2', 'Aidant de secours identifié et plan documenté avant le point de rupture'),
('de', 'why.persona4_b2', 'Vertretungspflegeperson identifiziert und Plan dokumentiert, bevor der Breaking Point erreicht ist'),
('sv', 'why.persona4_b2', 'Reservvårdare identifierad och plan dokumenterad innan brytpunkten'),
('fi', 'why.persona4_b2', 'Varahoitaja tunnistettu ja suunnitelma dokumentoitu ennen murtumispistettä'),

('en', 'why.persona4_b3', 'Responsibilities redistributed fairly — based on facts, not arguments'),
('es', 'why.persona4_b3', 'Responsabilidades redistribuidas de manera justa, basadas en hechos, no en discusiones'),
('it', 'why.persona4_b3', 'Responsabilità ridistribuite equamente — basate sui fatti, non sulle discussioni'),
('fr', 'why.persona4_b3', 'Responsabilités redistribuées équitablement — sur la base de faits, pas d''arguments'),
('de', 'why.persona4_b3', 'Verantwortlichkeiten fair umverteilt — auf der Grundlage von Fakten, nicht Argumenten'),
('sv', 'why.persona4_b3', 'Ansvar omfördelat rättvist — baserat på fakta, inte argument'),
('fi', 'why.persona4_b3', 'Vastuut jaettu uudelleen oikeudenmukaisesti — faktoihin perustuen, ei argumenttien'),

-- New Carer section on Why page
('en', 'why.newcarer_title', 'New to caregiving? Start here.'),
('es', 'why.newcarer_title', '¿Nuevo en el cuidado? Empieza aquí.'),
('it', 'why.newcarer_title', 'Nuovo all''assistenza? Inizia qui.'),
('fr', 'why.newcarer_title', 'Nouveau dans les soins ? Commencez ici.'),
('de', 'why.newcarer_title', 'Neu in der Pflege? Fangen Sie hier an.'),
('sv', 'why.newcarer_title', 'Ny inom vård? Börja här.'),
('fi', 'why.newcarer_title', 'Uusi hoitamisessa? Aloita tästä.'),

('en', 'why.newcarer_body', 'Our free 8-module Caregiver Guide walks you through every dimension of family caregiving — from understanding what the role actually involves to building a sustainable long-term plan. Use it before you sign up, or alongside CarerView as you build your care system.'),
('es', 'why.newcarer_body', 'Nuestra guía gratuita de 8 módulos para cuidadores te guía por cada dimensión del cuidado familiar: desde entender lo que implica realmente el rol hasta construir un plan sostenible a largo plazo. Úsala antes de registrarte o junto con CarerView mientras construyes tu sistema de cuidado.'),
('it', 'why.newcarer_body', 'La nostra guida gratuita per caregiver in 8 moduli ti guida attraverso ogni dimensione dell''assistenza familiare — da capire cosa comporta davvero il ruolo alla costruzione di un piano sostenibile a lungo termine. Usala prima di iscriverti o insieme a CarerView mentre costruisci il tuo sistema di cura.'),
('fr', 'why.newcarer_body', 'Notre guide gratuit en 8 modules pour les aidants vous guide à travers chaque dimension des soins familiaux — de la compréhension de ce qu''implique réellement le rôle à la construction d''un plan durable à long terme. Utilisez-le avant de vous inscrire ou en parallèle avec CarerView pendant que vous construisez votre système de soins.'),
('de', 'why.newcarer_body', 'Unser kostenloser 8-Modul-Leitfaden für Pflegepersonen führt Sie durch jede Dimension der Familienpflege — vom Verständnis, was die Rolle wirklich beinhaltet, bis hin zur Erstellung eines nachhaltigen Langzeitplans. Verwenden Sie ihn vor der Anmeldung oder parallel zu CarerView, während Sie Ihr Pflegesystem aufbauen.'),
('sv', 'why.newcarer_body', 'Vår kostnadsfria guide för vårdare med 8 moduler leder dig genom varje dimension av familjeomsorg — från att förstå vad rollen faktiskt innebär till att bygga en hållbar långsiktig plan. Använd den innan du registrerar dig eller parallellt med CarerView när du bygger ditt vårdsystem.'),
('fi', 'why.newcarer_body', 'Ilmainen 8-moduulin hoitajan oppaamme opastaa sinut jokaisen perheenhoidon ulottuvuuden läpi — roolin todellisen sisällön ymmärtämisestä kestävän pitkän aikavälin suunnitelman rakentamiseen. Käytä sitä ennen rekisteröitymistä tai rinnakkain CarerView''n kanssa rakentaessasi hoitojärjestelmääsi.'),

('en', 'why.newcarer_cta', 'Explore the free Caregiver Guide'),
('es', 'why.newcarer_cta', 'Explorar la guía gratuita para cuidadores'),
('it', 'why.newcarer_cta', 'Esplora la guida gratuita per caregiver'),
('fr', 'why.newcarer_cta', 'Explorer le guide gratuit pour les aidants'),
('de', 'why.newcarer_cta', 'Den kostenlosen Leitfaden für Pflegepersonen erkunden'),
('sv', 'why.newcarer_cta', 'Utforska den kostnadsfria vårdarguiden'),
('fi', 'why.newcarer_cta', 'Tutki ilmaista hoitajan opasta'),

-- Updated section title (was "shared_lang_title")
('en', 'why.shared_lang_title', 'Four pillars. One coordinated care system.'),
('es', 'why.shared_lang_title', 'Cuatro pilares. Un sistema de cuidado coordinado.'),
('it', 'why.shared_lang_title', 'Quattro pilastri. Un sistema di cura coordinato.'),
('fr', 'why.shared_lang_title', 'Quatre piliers. Un système de soins coordonné.'),
('de', 'why.shared_lang_title', 'Vier Säulen. Ein koordiniertes Pflegesystem.'),
('sv', 'why.shared_lang_title', 'Fyra pelare. Ett koordinerat vårdsystem.'),
('fi', 'why.shared_lang_title', 'Neljä pilaria. Yksi koordinoitu hoitojärjestelmä.'),

-- Expanded FAQ (2 new entries for Decision Engine)
('en', 'why.faq6_q', 'What is CarerView''s Decision Engine?'),
('es', 'why.faq6_q', '¿Qué es el Motor de Decisiones de CarerView?'),
('it', 'why.faq6_q', 'Cos''è il Motore Decisionale di CarerView?'),
('fr', 'why.faq6_q', 'Qu''est-ce que le Moteur de Décision de CarerView ?'),
('de', 'why.faq6_q', 'Was ist die Entscheidungs-Engine von CarerView?'),
('sv', 'why.faq6_q', 'Vad är CarerViews Beslutsmotorn?'),
('fi', 'why.faq6_q', 'Mikä on CarerView''n päätösmoottori?'),

('en', 'why.faq6_a', 'The Decision Engine is a built-in analysis tool that scans your Care Plan as you build it and identifies missing or incomplete sections. It flags gaps by severity — critical (act now), important (act soon), or monitor (keep an eye on). It''s not a medical tool — it''s a coordination tool that helps your team focus on what matters most.'),
('es', 'why.faq6_a', 'El Motor de Decisiones es una herramienta de análisis incorporada que escanea tu Plan de Cuidados mientras lo construyes e identifica secciones faltantes o incompletas. Señala las brechas por gravedad: crítico (actúa ahora), importante (actúa pronto) o monitorear (mantén un ojo). No es una herramienta médica, es una herramienta de coordinación que ayuda a tu equipo a centrarse en lo más importante.'),
('it', 'why.faq6_a', 'Il Motore Decisionale è uno strumento di analisi integrato che scansiona il tuo Piano di Cura mentre lo costruisci e identifica sezioni mancanti o incomplete. Segnala le lacune per gravità — critico (agisci ora), importante (agisci presto), o monitora (tieni d''occhio). Non è uno strumento medico — è uno strumento di coordinamento che aiuta il tuo team a concentrarsi su ciò che conta di più.'),
('fr', 'why.faq6_a', 'Le Moteur de Décision est un outil d''analyse intégré qui analyse votre Plan de soins au fur et à mesure que vous le construisez et identifie les sections manquantes ou incomplètes. Il signale les lacunes par gravité — critique (agir maintenant), important (agir bientôt) ou surveiller (garder un œil). Ce n''est pas un outil médical — c''est un outil de coordination qui aide votre équipe à se concentrer sur ce qui compte le plus.'),
('de', 'why.faq6_a', 'Die Entscheidungs-Engine ist ein integriertes Analysetool, das Ihren Pflegeplan während der Erstellung scannt und fehlende oder unvollständige Abschnitte identifiziert. Es kennzeichnet Lücken nach Schweregrad — kritisch (jetzt handeln), wichtig (bald handeln) oder beobachten (im Auge behalten). Es ist kein medizinisches Tool — es ist ein Koordinationswerkzeug, das Ihrem Team hilft, sich auf das Wichtigste zu konzentrieren.'),
('sv', 'why.faq6_a', 'Beslutsmotorn är ett inbyggt analysverktyg som skannar din omvårdnadsplan medan du bygger den och identifierar saknade eller ofullständiga avsnitt. Det flaggar luckor efter allvarlighetsgrad — kritisk (agera nu), viktig (agera snart) eller övervaka (håll ett öga). Det är inte ett medicinskt verktyg — det är ett koordinationsverktyg som hjälper ditt team att fokusera på vad som är viktigast.'),
('fi', 'why.faq6_a', 'Päätösmoottori on sisäänrakennettu analyysityökalu, joka skannaa hoitosuunnitelmasi rakentaessasi sitä ja tunnistaa puuttuvat tai epätäydelliset osiot. Se merkitsee aukot vakavuusasteen mukaan — kriittinen (toimi nyt), tärkeä (toimi pian) tai seuraa (pidä silmällä). Se ei ole lääketieteellinen työkalu — se on koordinointityökalu, joka auttaa tiimiäsi keskittymään siihen mikä eniten merkitsee.'),

('en', 'why.faq7_q', 'How does CarerView tell me my plan has gaps?'),
('es', 'why.faq7_q', '¿Cómo me dice CarerView que mi plan tiene brechas?'),
('it', 'why.faq7_q', 'Come mi dice CarerView che il mio piano ha delle lacune?'),
('fr', 'why.faq7_q', 'Comment CarerView me dit-il que mon plan a des lacunes ?'),
('de', 'why.faq7_q', 'Wie teilt mir CarerView mit, dass mein Plan Lücken hat?'),
('sv', 'why.faq7_q', 'Hur berättar CarerView för mig att min plan har luckor?'),
('fi', 'why.faq7_q', 'Miten CarerView kertoo minulle että suunnitelmassani on aukkoja?'),

('en', 'why.faq7_a', 'Your Care Plan dashboard shows a summary of detected gaps grouped by section and severity. Each gap includes a short description of the risk and a suggested action step. The most urgent gap is highlighted at the top. You can work through gaps in any order — the plan updates in real time as you address them.'),
('es', 'why.faq7_a', 'Tu panel del Plan de Cuidados muestra un resumen de las brechas detectadas agrupadas por sección y gravedad. Cada brecha incluye una breve descripción del riesgo y un paso de acción sugerido. La brecha más urgente está resaltada en la parte superior. Puedes trabajar en las brechas en cualquier orden: el plan se actualiza en tiempo real a medida que las abordas.'),
('it', 'why.faq7_a', 'Il pannello del Piano di Cura mostra un riepilogo delle lacune rilevate raggruppate per sezione e gravità. Ogni lacuna include una breve descrizione del rischio e un passo d''azione suggerito. La lacuna più urgente è evidenziata in cima. Puoi lavorare sulle lacune in qualsiasi ordine — il piano si aggiorna in tempo reale man mano che le affronti.'),
('fr', 'why.faq7_a', 'Votre tableau de bord du Plan de soins affiche un résumé des lacunes détectées regroupées par section et gravité. Chaque lacune comprend une brève description du risque et une étape d''action suggérée. La lacune la plus urgente est mise en évidence en haut. Vous pouvez travailler sur les lacunes dans n''importe quel ordre — le plan se met à jour en temps réel au fur et à mesure que vous les traitez.'),
('de', 'why.faq7_a', 'Ihr Pflegeplan-Dashboard zeigt eine Zusammenfassung der erkannten Lücken, gruppiert nach Abschnitt und Schweregrad. Jede Lücke enthält eine kurze Beschreibung des Risikos und einen vorgeschlagenen Aktionsschritt. Die dringendste Lücke wird oben hervorgehoben. Sie können Lücken in beliebiger Reihenfolge bearbeiten — der Plan wird in Echtzeit aktualisiert, während Sie sie angehen.'),
('sv', 'why.faq7_a', 'Din omvårdnadsplan-instrumentpanel visar en sammanfattning av detekterade luckor grupperade efter avsnitt och allvarlighetsgrad. Varje lucka inkluderar en kort beskrivning av risken och ett föreslaget handlingssteg. Den mest brådskande luckan är markerad överst. Du kan arbeta igenom luckor i vilken ordning som helst — planen uppdateras i realtid när du åtgärdar dem.'),
('fi', 'why.faq7_a', 'Hoitosuunnitelman kojelautasi näyttää yhteenvedon havaituista aukoista ryhmiteltynä osion ja vakavuuden mukaan. Jokainen aukko sisältää lyhyen kuvauksen riskistä ja ehdotetun toimenpiteen. Kiireellisin aukko on korostettu ylhäällä. Voit käydä aukot läpi missä tahansa järjestyksessä — suunnitelma päivittyy reaaliaikaisesti kun käsittelet niitä.'),

-- Update CTA section
('en', 'why.cta_trend_title', 'Build your plan. Coordinate your team. Track what matters.'),
('es', 'why.cta_trend_title', 'Construye tu plan. Coordina tu equipo. Rastrea lo que importa.'),
('it', 'why.cta_trend_title', 'Costruisci il tuo piano. Coordina il tuo team. Tieni traccia di ciò che conta.'),
('fr', 'why.cta_trend_title', 'Construisez votre plan. Coordonnez votre équipe. Suivez ce qui compte.'),
('de', 'why.cta_trend_title', 'Erstellen Sie Ihren Plan. Koordinieren Sie Ihr Team. Verfolgen Sie, was wichtig ist.'),
('sv', 'why.cta_trend_title', 'Bygg din plan. Koordinera ditt team. Spåra det som är viktigt.'),
('fi', 'why.cta_trend_title', 'Rakenna suunnitelmasi. Koordinoi tiimisi. Seuraa mitä merkitsee.'),

('en', 'why.cta_trend_body', 'CarerView gives every family caregiver a structured framework, a coordination hub, and the observations that keep it all current. Start free — no credit card required.'),
('es', 'why.cta_trend_body', 'CarerView da a cada cuidador familiar un marco estructurado, un centro de coordinación y las observaciones que mantienen todo actualizado. Comienza gratis, sin tarjeta de crédito requerida.'),
('it', 'why.cta_trend_body', 'CarerView dà a ogni caregiver familiare un quadro strutturato, un hub di coordinamento e le osservazioni che mantengono tutto aggiornato. Inizia gratuitamente — nessuna carta di credito richiesta.'),
('fr', 'why.cta_trend_body', 'CarerView donne à chaque aidant familial un cadre structuré, un hub de coordination et les observations qui maintiennent tout à jour. Commencez gratuitement — aucune carte de crédit requise.'),
('de', 'why.cta_trend_body', 'CarerView gibt jeder Familienpflegeperson einen strukturierten Rahmen, einen Koordinations-Hub und die Beobachtungen, die alles aktuell halten. Starten Sie kostenlos — keine Kreditkarte erforderlich.'),
('sv', 'why.cta_trend_body', 'CarerView ger varje familjevårdare ett strukturerat ramverk, ett koordinationsnav och observationerna som håller allt aktuellt. Börja gratis — inget kreditkort krävs.'),
('fi', 'why.cta_trend_body', 'CarerView antaa jokaiselle perhehoitajalle jäsennellyn kehyksen, koordinointikeskuksen ja havainnot jotka pitävät kaiken ajan tasalla. Aloita ilmaiseksi — ei luottokorttia tarvita.')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
