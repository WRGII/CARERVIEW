-- Phase 9.2a: Landing page careplan, sustainability, and newcarer content
-- Source: legacy migrations 20260424195322 and 20260424195529
-- Stored as namespace='landing', bare key (matching existing careplan_title/sustainability_title/newcarer_title)
-- JA locale uses EN-fallback (no native translations exist)
-- ON CONFLICT DO NOTHING — idempotent

INSERT INTO public.ui_translations (locale, namespace, key, value) VALUES

-- ============================================================
-- CAREPLAN SECTION (careplan_title already exists, skip it)
-- ============================================================

-- careplan_eyebrow
('en','landing','careplan_eyebrow','Care Plan'),
('es','landing','careplan_eyebrow','Plan de Cuidados'),
('it','landing','careplan_eyebrow','Piano di Cura'),
('fr','landing','careplan_eyebrow','Plan de soins'),
('de','landing','careplan_eyebrow','Pflegeplan'),
('sv','landing','careplan_eyebrow','Omvårdnadsplan'),
('fi','landing','careplan_eyebrow','Hoitosuunnitelma'),
('ja','landing','careplan_eyebrow','Care Plan'),

-- careplan_body
('en','landing','careplan_body','Most families tackle caregiving one crisis at a time. The CarerView Care Plan gives your team a structured framework — built once, updated as things change — so the critical questions are answered before they become urgent.'),
('es','landing','careplan_body','La mayoría de las familias abordan el cuidado una crisis a la vez. El Plan de Cuidados de CarerView da a tu equipo un marco estructurado — construido una vez, actualizado a medida que las cosas cambian — para que las preguntas críticas se respondan antes de que se vuelvan urgentes.'),
('it','landing','careplan_body','La maggior parte delle famiglie affronta l''assistenza una crisi alla volta. Il Piano di Cura di CarerView dà al tuo team un quadro strutturato — costruito una volta, aggiornato man mano che le cose cambiano — così le domande critiche vengono risposta prima che diventino urgenti.'),
('fr','landing','careplan_body','La plupart des familles affrontent les soins une crise à la fois. Le Plan de soins CarerView donne à votre équipe un cadre structuré — construit une fois, mis à jour au fil des changements — afin que les questions critiques soient résolues avant de devenir urgentes.'),
('de','landing','careplan_body','Die meisten Familien gehen die Pflege eine Krise nach der anderen an. Der CarerView Pflegeplan gibt Ihrem Team einen strukturierten Rahmen — einmal erstellt, bei Änderungen aktualisiert — damit kritische Fragen beantwortet werden, bevor sie dringend werden.'),
('sv','landing','careplan_body','De flesta familjer hanterar vård en kris i taget. CarerViews omvårdnadsplan ger ditt team ett strukturerat ramverk — byggt en gång, uppdaterat när saker förändras — så att kritiska frågor besvaras innan de blir brådskande.'),
('fi','landing','careplan_body','Useimmat perheet käsittelevät hoitamista yksi kriisi kerrallaan. CarerView-hoitosuunnitelma antaa tiimillesi jäsennellyn kehyksen — rakennettu kerran, päivitetty kun asiat muuttuvat — jotta kriittiset kysymykset vastataan ennen kuin niistä tulee kiireellisiä.'),
('ja','landing','careplan_body','Most families tackle caregiving one crisis at a time. The CarerView Care Plan gives your team a structured framework — built once, updated as things change — so the critical questions are answered before they become urgent.'),

-- careplan_s1_label
('en','landing','careplan_s1_label','Situation'),
('es','landing','careplan_s1_label','Situación'),
('it','landing','careplan_s1_label','Situazione'),
('fr','landing','careplan_s1_label','Situation'),
('de','landing','careplan_s1_label','Situation'),
('sv','landing','careplan_s1_label','Situation'),
('fi','landing','careplan_s1_label','Tilanne'),
('ja','landing','careplan_s1_label','Situation'),

-- careplan_s1_desc
('en','landing','careplan_s1_desc','What is the current state? What decisions need to be made now?'),
('es','landing','careplan_s1_desc','¿Cuál es el estado actual? ¿Qué decisiones hay que tomar ahora?'),
('it','landing','careplan_s1_desc','Qual è lo stato attuale? Quali decisioni devono essere prese ora?'),
('fr','landing','careplan_s1_desc','Quel est l''état actuel ? Quelles décisions doivent être prises maintenant ?'),
('de','landing','careplan_s1_desc','Was ist der aktuelle Stand? Welche Entscheidungen müssen jetzt getroffen werden?'),
('sv','landing','careplan_s1_desc','Vad är det nuvarande läget? Vilka beslut behöver fattas nu?'),
('fi','landing','careplan_s1_desc','Mikä on nykyinen tilanne? Mitä päätöksiä täytyy tehdä nyt?'),
('ja','landing','careplan_s1_desc','What is the current state? What decisions need to be made now?'),

-- careplan_s2_label
('en','landing','careplan_s2_label','Authority'),
('es','landing','careplan_s2_label','Autoridad'),
('it','landing','careplan_s2_label','Autorità'),
('fr','landing','careplan_s2_label','Autorité'),
('de','landing','careplan_s2_label','Vollmacht'),
('sv','landing','careplan_s2_label','Behörighet'),
('fi','landing','careplan_s2_label','Valtuutus'),
('ja','landing','careplan_s2_label','Authority'),

-- careplan_s2_desc
('en','landing','careplan_s2_desc','Who can make medical decisions? Who controls finances? Are legal documents in place?'),
('es','landing','careplan_s2_desc','¿Quién puede tomar decisiones médicas? ¿Quién controla las finanzas? ¿Están los documentos legales en su lugar?'),
('it','landing','careplan_s2_desc','Chi può prendere decisioni mediche? Chi controlla le finanze? I documenti legali sono in ordine?'),
('fr','landing','careplan_s2_desc','Qui peut prendre des décisions médicales ? Qui contrôle les finances ? Les documents juridiques sont-ils en place ?'),
('de','landing','careplan_s2_desc','Wer kann medizinische Entscheidungen treffen? Wer kontrolliert die Finanzen? Sind rechtliche Dokumente vorhanden?'),
('sv','landing','careplan_s2_desc','Vem kan fatta medicinska beslut? Vem kontrollerar ekonomin? Finns juridiska dokument på plats?'),
('fi','landing','careplan_s2_desc','Kuka voi tehdä lääketieteellisiä päätöksiä? Kuka hallitsee taloutta? Ovatko oikeudelliset asiakirjat paikallaan?'),
('ja','landing','careplan_s2_desc','Who can make medical decisions? Who controls finances? Are legal documents in place?'),

-- careplan_s3_label
('en','landing','careplan_s3_label','Responsibilities'),
('es','landing','careplan_s3_label','Responsabilidades'),
('it','landing','careplan_s3_label','Responsabilità'),
('fr','landing','careplan_s3_label','Responsabilités'),
('de','landing','careplan_s3_label','Verantwortlichkeiten'),
('sv','landing','careplan_s3_label','Ansvar'),
('fi','landing','careplan_s3_label','Vastuut'),
('ja','landing','careplan_s3_label','Responsibilities'),

-- careplan_s3_desc
('en','landing','careplan_s3_desc','Who owns personal care, health coordination, finances, emotional support, and respite? No owner means no accountability.'),
('es','landing','careplan_s3_desc','¿Quién se encarga del cuidado personal, coordinación de salud, finanzas, apoyo emocional y descanso? Sin propietario significa sin responsabilidad.'),
('it','landing','careplan_s3_desc','Chi si occupa della cura personale, coordinamento sanitario, finanze, supporto emotivo e sollievo? Nessun responsabile significa nessuna responsabilità.'),
('fr','landing','careplan_s3_desc','Qui s''occupe des soins personnels, de la coordination de la santé, des finances, du soutien émotionnel et du répit ? Pas de responsable signifie pas de responsabilité.'),
('de','landing','careplan_s3_desc','Wer ist für persönliche Pflege, Gesundheitskoordination, Finanzen, emotionale Unterstützung und Auszeiten zuständig? Kein Zuständiger bedeutet keine Verantwortung.'),
('sv','landing','careplan_s3_desc','Vem äger personlig omsorg, hälsokoordination, ekonomi, emotionellt stöd och avlastning? Ingen ägare betyder inget ansvar.'),
('fi','landing','careplan_s3_desc','Kuka omistaa henkilökohtaisen hoidon, terveyden koordinoinnin, talouden, emotionaalisen tuen ja lepon? Ei omistajaa tarkoittaa ei vastuuta.'),
('ja','landing','careplan_s3_desc','Who owns personal care, health coordination, finances, emotional support, and respite? No owner means no accountability.'),

-- careplan_s4_label
('en','landing','careplan_s4_label','Living Arrangement'),
('es','landing','careplan_s4_label','Arreglo de Vida'),
('it','landing','careplan_s4_label','Sistemazione Abitativa'),
('fr','landing','careplan_s4_label','Arrangement de Vie'),
('de','landing','careplan_s4_label','Wohnarrangement'),
('sv','landing','careplan_s4_label','Boendesituation'),
('fi','landing','careplan_s4_label','Asumisjärjestely'),
('ja','landing','careplan_s4_label','Living Arrangement'),

-- careplan_s4_desc
('en','landing','careplan_s4_desc','Is the current living situation safe and sustainable? What needs to change as needs evolve?'),
('es','landing','careplan_s4_desc','¿Es la situación de vida actual segura y sostenible? ¿Qué necesita cambiar a medida que las necesidades evolucionan?'),
('it','landing','careplan_s4_desc','La situazione abitativa attuale è sicura e sostenibile? Cosa deve cambiare man mano che le esigenze evolvono?'),
('fr','landing','careplan_s4_desc','La situation de vie actuelle est-elle sûre et durable ? Qu''est-ce qui doit changer à mesure que les besoins évoluent ?'),
('de','landing','careplan_s4_desc','Ist die aktuelle Wohnsituation sicher und nachhaltig? Was muss sich ändern, wenn die Bedürfnisse sich weiterentwickeln?'),
('sv','landing','careplan_s4_desc','Är den nuvarande boendesituationen säker och hållbar? Vad behöver förändras när behoven utvecklas?'),
('fi','landing','careplan_s4_desc','Onko nykyinen asumisjärjestely turvallinen ja kestävä? Mitä täytyy muuttua tarpeiden kehittyessä?'),
('ja','landing','careplan_s4_desc','Is the current living situation safe and sustainable? What needs to change as needs evolve?'),

-- careplan_s5_label
('en','landing','careplan_s5_label','Sustainability'),
('es','landing','careplan_s5_label','Sostenibilidad'),
('it','landing','careplan_s5_label','Sostenibilità'),
('fr','landing','careplan_s5_label','Durabilité'),
('de','landing','careplan_s5_label','Nachhaltigkeit'),
('sv','landing','careplan_s5_label','Hållbarhet'),
('fi','landing','careplan_s5_label','Kestävyys'),
('ja','landing','careplan_s5_label','Sustainability'),

-- careplan_s5_desc
('en','landing','careplan_s5_desc','Can the primary caregiver keep this up? Is there backup cover, respite time, and support for the person doing the caring?'),
('es','landing','careplan_s5_desc','¿Puede el cuidador principal mantener esto? ¿Hay cobertura de respaldo, tiempo de descanso y apoyo para la persona que cuida?'),
('it','landing','careplan_s5_desc','Il caregiver principale può mantenere questo ritmo? C''è copertura di riserva, tempo di sollievo e supporto per la persona che si prende cura?'),
('fr','landing','careplan_s5_desc','L''aidant principal peut-il maintenir cela ? Y a-t-il une couverture de secours, du temps de répit et un soutien pour la personne qui s''occupe des soins ?'),
('de','landing','careplan_s5_desc','Kann die Hauptpflegeperson das aufrechterhalten? Gibt es Vertretungsabdeckung, Auszeiten und Unterstützung für die pflegende Person?'),
('sv','landing','careplan_s5_desc','Kan den primära vårdaren hålla i detta? Finns det reservtäckning, avlastningstid och stöd för den som ger vård?'),
('fi','landing','careplan_s5_desc','Voiko ensisijainen hoitaja jatkaa tätä? Onko varakattavuutta, lepoaikaa ja tukea hoitavalle henkilölle?'),
('ja','landing','careplan_s5_desc','Can the primary caregiver keep this up? Is there backup cover, respite time, and support for the person doing the caring?'),

-- careplan_s6_label
('en','landing','careplan_s6_label','Review'),
('es','landing','careplan_s6_label','Revisión'),
('it','landing','careplan_s6_label','Revisione'),
('fr','landing','careplan_s6_label','Révision'),
('de','landing','careplan_s6_label','Überprüfung'),
('sv','landing','careplan_s6_label','Granskning'),
('fi','landing','careplan_s6_label','Arviointi'),
('ja','landing','careplan_s6_label','Review'),

-- careplan_s6_desc
('en','landing','careplan_s6_desc','When does the plan need revisiting? Who calls the review and how does the team stay aligned as needs change?'),
('es','landing','careplan_s6_desc','¿Cuándo necesita revisarse el plan? ¿Quién convoca la revisión y cómo mantiene el equipo la alineación a medida que cambian las necesidades?'),
('it','landing','careplan_s6_desc','Quando il piano ha bisogno di essere rivisto? Chi convoca la revisione e come rimane allineato il team man mano che le esigenze cambiano?'),
('fr','landing','careplan_s6_desc','Quand le plan doit-il être revu ? Qui convoque la révision et comment l''équipe reste-t-elle alignée à mesure que les besoins évoluent ?'),
('de','landing','careplan_s6_desc','Wann muss der Plan überarbeitet werden? Wer ruft die Überprüfung ein und wie bleibt das Team ausgerichtet, wenn sich die Bedürfnisse ändern?'),
('sv','landing','careplan_s6_desc','När behöver planen ses över? Vem kallar till granskningen och hur förblir teamet samordnat när behoven förändras?'),
('fi','landing','careplan_s6_desc','Milloin suunnitelmaa täytyy tarkistaa? Kuka kutsuu arvioinnin koolle ja miten tiimi pysyy yhdenmukaistettuna tarpeiden muuttuessa?'),
('ja','landing','careplan_s6_desc','When does the plan need revisiting? Who calls the review and how does the team stay aligned as needs change?'),

-- careplan_engine_title
('en','landing','careplan_engine_title','CarerView reads your plan and tells you what is missing'),
('es','landing','careplan_engine_title','CarerView lee tu plan y te dice qué falta'),
('it','landing','careplan_engine_title','CarerView legge il tuo piano e ti dice cosa manca'),
('fr','landing','careplan_engine_title','CarerView lit votre plan et vous dit ce qui manque'),
('de','landing','careplan_engine_title','CarerView liest Ihren Plan und teilt Ihnen mit, was fehlt'),
('sv','landing','careplan_engine_title','CarerView läser din plan och berättar vad som saknas'),
('fi','landing','careplan_engine_title','CarerView lukee suunnitelmasi ja kertoo sinulle mitä puuttuu'),
('ja','landing','careplan_engine_title','CarerView reads your plan and tells you what is missing'),

-- careplan_engine_body
('en','landing','careplan_engine_body','Most care gaps are invisible until they cause a crisis. CarerView''s Decision Engine scans your plan and flags risks by severity — so your team acts before the emergency, not during it.'),
('es','landing','careplan_engine_body','La mayoría de los vacíos en el cuidado son invisibles hasta que causan una crisis. El motor de decisiones de CarerView escanea tu plan y señala los riesgos por gravedad, para que tu equipo actúe antes de la emergencia, no durante ella.'),
('it','landing','careplan_engine_body','La maggior parte delle lacune nell''assistenza è invisibile finché non causa una crisi. Il motore decisionale di CarerView scansiona il tuo piano e segnala i rischi per gravità, così il tuo team agisce prima dell''emergenza, non durante.'),
('fr','landing','careplan_engine_body','La plupart des lacunes dans les soins sont invisibles jusqu''à ce qu''elles causent une crise. Le moteur de décision de CarerView analyse votre plan et signale les risques par gravité — afin que votre équipe agisse avant l''urgence, pas pendant.'),
('de','landing','careplan_engine_body','Die meisten Pflegelücken sind unsichtbar, bis sie eine Krise verursachen. Die Entscheidungs-Engine von CarerView scannt Ihren Plan und kennzeichnet Risiken nach Schweregrad — damit Ihr Team vor dem Notfall handelt, nicht während.'),
('sv','landing','careplan_engine_body','De flesta vårdbristerna är osynliga tills de orsakar en kris. CarerViews beslutsmotorn skannar din plan och flaggar risker efter allvarlighetsgrad — så att ditt team agerar före nödläget, inte under.'),
('fi','landing','careplan_engine_body','Useimmat hoitoaukot ovat näkymättömiä kunnes ne aiheuttavat kriisin. CarerView''n päätösmoottori skannaa suunnitelmasi ja merkitsee riskit vakavuusasteen mukaan — jotta tiimisi toimii ennen hätätilannetta, ei sen aikana.'),
('ja','landing','careplan_engine_body','Most care gaps are invisible until they cause a crisis. CarerView''s Decision Engine scans your plan and flags risks by severity — so your team acts before the emergency, not during it.'),

-- careplan_gap1
('en','landing','careplan_gap1','No backup caregiver identified'),
('es','landing','careplan_gap1','Sin cuidador de respaldo identificado'),
('it','landing','careplan_gap1','Nessun caregiver di riserva identificato'),
('fr','landing','careplan_gap1','Aucun aidant de secours identifié'),
('de','landing','careplan_gap1','Keine Vertretungspflegeperson identifiziert'),
('sv','landing','careplan_gap1','Ingen reservvårdare identifierad'),
('fi','landing','careplan_gap1','Varahoitajaa ei tunnistettu'),
('ja','landing','careplan_gap1','No backup caregiver identified'),

-- careplan_gap2
('en','landing','careplan_gap2','Medical authority not documented'),
('es','landing','careplan_gap2','Autoridad médica no documentada'),
('it','landing','careplan_gap2','Autorità medica non documentata'),
('fr','landing','careplan_gap2','Autorité médicale non documentée'),
('de','landing','careplan_gap2','Medizinische Vollmacht nicht dokumentiert'),
('sv','landing','careplan_gap2','Medicinsk behörighet inte dokumenterad'),
('fi','landing','careplan_gap2','Lääketieteellistä valtuutusta ei dokumentoitu'),
('ja','landing','careplan_gap2','Medical authority not documented'),

-- careplan_gap3
('en','landing','careplan_gap3','Primary caregiver stress level: high'),
('es','landing','careplan_gap3','Nivel de estrés del cuidador principal: alto'),
('it','landing','careplan_gap3','Livello di stress del caregiver principale: alto'),
('fr','landing','careplan_gap3','Niveau de stress de l''aidant principal : élevé'),
('de','landing','careplan_gap3','Stressniveau der Hauptpflegeperson: hoch'),
('sv','landing','careplan_gap3','Primär vårdares stressnivå: hög'),
('fi','landing','careplan_gap3','Ensisijaisen hoitajan stressitaso: korkea'),
('ja','landing','careplan_gap3','Primary caregiver stress level: high'),

-- careplan_gap4
('en','landing','careplan_gap4','No owner assigned for health coordination'),
('es','landing','careplan_gap4','Sin responsable asignado para la coordinación de salud'),
('it','landing','careplan_gap4','Nessun responsabile assegnato per il coordinamento sanitario'),
('fr','landing','careplan_gap4','Aucun responsable assigné pour la coordination des soins de santé'),
('de','landing','careplan_gap4','Kein Verantwortlicher für die Gesundheitskoordination zugewiesen'),
('sv','landing','careplan_gap4','Ingen ägare tilldelad för hälsokoordination'),
('fi','landing','careplan_gap4','Ei omistajaa terveyden koordinoinnille'),
('ja','landing','careplan_gap4','No owner assigned for health coordination'),

-- careplan_gap_crit_label
('en','landing','careplan_gap_crit_label','Critical'),
('es','landing','careplan_gap_crit_label','Crítico'),
('it','landing','careplan_gap_crit_label','Critico'),
('fr','landing','careplan_gap_crit_label','Critique'),
('de','landing','careplan_gap_crit_label','Kritisch'),
('sv','landing','careplan_gap_crit_label','Kritisk'),
('fi','landing','careplan_gap_crit_label','Kriittinen'),
('ja','landing','careplan_gap_crit_label','Critical'),

-- careplan_gap_imp_label
('en','landing','careplan_gap_imp_label','Important'),
('es','landing','careplan_gap_imp_label','Importante'),
('it','landing','careplan_gap_imp_label','Importante'),
('fr','landing','careplan_gap_imp_label','Important'),
('de','landing','careplan_gap_imp_label','Wichtig'),
('sv','landing','careplan_gap_imp_label','Viktig'),
('fi','landing','careplan_gap_imp_label','Tärkeä'),
('ja','landing','careplan_gap_imp_label','Important'),

-- careplan_gap_mon_label
('en','landing','careplan_gap_mon_label','Monitor'),
('es','landing','careplan_gap_mon_label','Monitorear'),
('it','landing','careplan_gap_mon_label','Monitorare'),
('fr','landing','careplan_gap_mon_label','Surveiller'),
('de','landing','careplan_gap_mon_label','Überwachen'),
('sv','landing','careplan_gap_mon_label','Övervaka'),
('fi','landing','careplan_gap_mon_label','Seuraa'),
('ja','landing','careplan_gap_mon_label','Monitor'),

-- careplan_before_label
('en','landing','careplan_before_label','Without a plan'),
('es','landing','careplan_before_label','Sin un plan'),
('it','landing','careplan_before_label','Senza un piano'),
('fr','landing','careplan_before_label','Sans plan'),
('de','landing','careplan_before_label','Ohne einen Plan'),
('sv','landing','careplan_before_label','Utan en plan'),
('fi','landing','careplan_before_label','Ilman suunnitelmaa'),
('ja','landing','careplan_before_label','Without a plan'),

-- careplan_before_b1
('en','landing','careplan_before_b1','Scrambling to find legal documents in a hospital waiting room'),
('es','landing','careplan_before_b1','Buscando documentos legales frenéticamente en una sala de espera del hospital'),
('it','landing','careplan_before_b1','Cercando documenti legali affannosamente in una sala d''attesa ospedaliera'),
('fr','landing','careplan_before_b1','Chercher frénétiquement des documents juridiques dans une salle d''attente d''hôpital'),
('de','landing','careplan_before_b1','Im Krankenhaus-Wartezimmer hektisch nach rechtlichen Dokumenten suchen'),
('sv','landing','careplan_before_b1','Leta febrilt efter juridiska dokument i ett sjukhus väntrum'),
('fi','landing','careplan_before_b1','Hakea kiireessä oikeudellisia asiakirjoja sairaalan odotushuoneesta'),
('ja','landing','careplan_before_b1','Scrambling to find legal documents in a hospital waiting room'),

-- careplan_before_b2
('en','landing','careplan_before_b2','Siblings arguing because no one agreed on who is responsible for what'),
('es','landing','careplan_before_b2','Hermanos discutiendo porque nadie acordó quién es responsable de qué'),
('it','landing','careplan_before_b2','Fratelli che litigano perché nessuno ha concordato chi è responsabile di cosa'),
('fr','landing','careplan_before_b2','Des frères et sœurs se disputant parce que personne n''a convenu qui est responsable de quoi'),
('de','landing','careplan_before_b2','Geschwister streiten, weil niemand vereinbart hat, wer wofür verantwortlich ist'),
('sv','landing','careplan_before_b2','Syskon som bråkar för att ingen kom överens om vem som ansvarar för vad'),
('fi','landing','careplan_before_b2','Sisarukset riitelevät koska kukaan ei sopinut kuka on vastuussa mistäkin'),
('ja','landing','careplan_before_b2','Siblings arguing because no one agreed on who is responsible for what'),

-- careplan_before_b3
('en','landing','careplan_before_b3','The primary caregiver burning out with no backup and no one noticing'),
('es','landing','careplan_before_b3','El cuidador principal agotándose sin respaldo y sin que nadie lo note'),
('it','landing','careplan_before_b3','Il caregiver principale che si esaurisce senza riserve e senza che nessuno se ne accorga'),
('fr','landing','careplan_before_b3','L''aidant principal s''épuisant sans soutien et sans que personne ne le remarque'),
('de','landing','careplan_before_b3','Die Hauptpflegeperson brennt aus, ohne Vertretung und ohne dass jemand es bemerkt'),
('sv','landing','careplan_before_b3','Den primära vårdaren bränner ut utan backup och utan att någon märker det'),
('fi','landing','careplan_before_b3','Ensisijainen hoitaja uupuu ilman varahoitajaa eikä kukaan huomaa'),
('ja','landing','careplan_before_b3','The primary caregiver burning out with no backup and no one noticing'),

-- careplan_after_label
('en','landing','careplan_after_label','With CarerView'),
('es','landing','careplan_after_label','Con CarerView'),
('it','landing','careplan_after_label','Con CarerView'),
('fr','landing','careplan_after_label','Avec CarerView'),
('de','landing','careplan_after_label','Mit CarerView'),
('sv','landing','careplan_after_label','Med CarerView'),
('fi','landing','careplan_after_label','CarerView''n kanssa'),
('ja','landing','careplan_after_label','With CarerView'),

-- careplan_after_b1
('en','landing','careplan_after_b1','Authority documents are logged, accessible, and reviewed before they are ever needed'),
('es','landing','careplan_after_b1','Los documentos de autoridad están registrados, accesibles y revisados antes de que sean necesarios'),
('it','landing','careplan_after_b1','I documenti di autorità sono registrati, accessibili e revisionati prima che siano mai necessari'),
('fr','landing','careplan_after_b1','Les documents d''autorité sont enregistrés, accessibles et examinés avant d''être jamais nécessaires'),
('de','landing','careplan_after_b1','Vollmachtsdokumente sind erfasst, zugänglich und überprüft, bevor sie je benötigt werden'),
('sv','landing','careplan_after_b1','Behörighetsdokument är loggade, tillgängliga och granskade innan de någonsin behövs'),
('fi','landing','careplan_after_b1','Valtuutusasiakirjat on kirjattu, käytettävissä ja tarkistettu ennen kuin niitä koskaan tarvitaan'),
('ja','landing','careplan_after_b1','Authority documents are logged, accessible, and reviewed before they are ever needed'),

-- careplan_after_b2
('en','landing','careplan_after_b2','Every team member knows their responsibilities — no overlap, no gaps, no argument'),
('es','landing','careplan_after_b2','Cada miembro del equipo conoce sus responsabilidades: sin superposiciones, sin vacíos, sin discusiones'),
('it','landing','careplan_after_b2','Ogni membro del team conosce le proprie responsabilità — nessuna sovrapposizione, nessuna lacuna, nessuna discussione'),
('fr','landing','careplan_after_b2','Chaque membre de l''équipe connaît ses responsabilités — pas de chevauchement, pas de lacunes, pas de disputes'),
('de','landing','careplan_after_b2','Jedes Teammitglied kennt seine Verantwortlichkeiten — keine Überschneidungen, keine Lücken, keine Auseinandersetzungen'),
('sv','landing','careplan_after_b2','Varje teammedlem känner sina ansvarsområden — inget överlapp, inga luckor, inga argument'),
('fi','landing','careplan_after_b2','Jokainen tiimin jäsen tietää vastuunsa — ei päällekkäisyyksiä, ei aukkoja, ei riitelyä'),
('ja','landing','careplan_after_b2','Every team member knows their responsibilities — no overlap, no gaps, no argument'),

-- careplan_after_b3
('en','landing','careplan_after_b3','Caregiver stress is monitored — the plan flags when the person doing the caring needs support too'),
('es','landing','careplan_after_b3','El estrés del cuidador se monitorea: el plan señala cuándo la persona que cuida también necesita apoyo'),
('it','landing','careplan_after_b3','Lo stress del caregiver viene monitorato — il piano segnala quando anche la persona che si prende cura ha bisogno di supporto'),
('fr','landing','careplan_after_b3','Le stress de l''aidant est surveillé — le plan signale quand la personne qui s''occupe des soins a aussi besoin de soutien'),
('de','landing','careplan_after_b3','Der Stress der Pflegeperson wird überwacht — der Plan zeigt an, wann die pflegende Person ebenfalls Unterstützung benötigt'),
('sv','landing','careplan_after_b3','Vårdarens stress övervakas — planen flaggar när personen som ger vård också behöver stöd'),
('fi','landing','careplan_after_b3','Hoitajan stressi on seurattu — suunnitelma merkitsee milloin hoitava henkilö tarvitsee myös tukea'),
('ja','landing','careplan_after_b3','Caregiver stress is monitored — the plan flags when the person doing the caring needs support too'),

-- ============================================================
-- SUSTAINABILITY SECTION (sustainability_title already exists, skip it)
-- Note: legacy file has a typo 'sustainability_eybrow' for IT — using correct spelling
-- ============================================================

-- sustainability_eyebrow
('en','landing','sustainability_eyebrow','Caregiver Wellbeing'),
('es','landing','sustainability_eyebrow','Bienestar del Cuidador'),
('it','landing','sustainability_eyebrow','Benessere del Caregiver'),
('fr','landing','sustainability_eyebrow','Bien-être de l''aidant'),
('de','landing','sustainability_eyebrow','Wohlbefinden der Pflegeperson'),
('sv','landing','sustainability_eyebrow','Vårdarens välmående'),
('fi','landing','sustainability_eyebrow','Hoitajan hyvinvointi'),
('ja','landing','sustainability_eyebrow','Caregiver Wellbeing'),

-- sustainability_body
('en','landing','sustainability_body','Most care tools focus entirely on the person being cared for. CarerView is different — it tracks the wellbeing of the person doing the caring too. Caregiver stress, backup coverage, and respite time are built into the plan, not left as afterthoughts.'),
('es','landing','sustainability_body','La mayoría de las herramientas de cuidado se centran completamente en la persona cuidada. CarerView es diferente: también rastrea el bienestar de la persona que cuida. El estrés del cuidador, la cobertura de respaldo y el tiempo de descanso están integrados en el plan, no dejados como pensamientos secundarios.'),
('it','landing','sustainability_body','La maggior parte degli strumenti di assistenza si concentra completamente sulla persona assistita. CarerView è diverso: traccia anche il benessere della persona che si prende cura. Lo stress del caregiver, la copertura di riserva e il tempo di sollievo sono integrati nel piano, non lasciati come un ripensamento.'),
('fr','landing','sustainability_body','La plupart des outils de soins se concentrent entièrement sur la personne aidée. CarerView est différent — il suit également le bien-être de la personne qui s''occupe des soins. Le stress de l''aidant, la couverture de secours et le temps de répit sont intégrés dans le plan, pas laissés comme des réflexions après coup.'),
('de','landing','sustainability_body','Die meisten Pflegetools konzentrieren sich ausschließlich auf die gepflegte Person. CarerView ist anders — es verfolgt auch das Wohlbefinden der pflegenden Person. Stress der Pflegeperson, Vertretungsabdeckung und Auszeiten sind in den Plan integriert, nicht als Nachgedanken belassen.'),
('sv','landing','sustainability_body','De flesta vårdverktyg fokuserar helt på den omvårdade personen. CarerView är annorlunda — det spårar också välmåendet hos den person som ger vård. Vårdarens stress, reservtäckning och avlastningstid är inbyggda i planen, inte lämnade som eftertankar.'),
('fi','landing','sustainability_body','Useimmat hoitotyökalut keskittyvät täysin hoidettavaan henkilöön. CarerView on erilainen — se seuraa myös hoitavan henkilön hyvinvointia. Hoitajan stressi, varakattavuus ja lepoaika on rakennettu suunnitelmaan, ei jätetty jälkiajatuksiksi.'),
('ja','landing','sustainability_body','Most care tools focus entirely on the person being cared for. CarerView is different — it tracks the wellbeing of the person doing the caring too. Caregiver stress, backup coverage, and respite time are built into the plan, not left as afterthoughts.'),

-- sustainability_b1
('en','landing','sustainability_b1','Stress level tracking for the primary caregiver'),
('es','landing','sustainability_b1','Seguimiento del nivel de estrés del cuidador principal'),
('it','landing','sustainability_b1','Monitoraggio del livello di stress del caregiver principale'),
('fr','landing','sustainability_b1','Suivi du niveau de stress de l''aidant principal'),
('de','landing','sustainability_b1','Stressniveau-Verfolgung für die Hauptpflegeperson'),
('sv','landing','sustainability_b1','Stressnivåspårning för den primära vårdaren'),
('fi','landing','sustainability_b1','Stressitason seuranta ensisijaiselle hoitajalle'),
('ja','landing','sustainability_b1','Stress level tracking for the primary caregiver'),

-- sustainability_b2
('en','landing','sustainability_b2','Backup caregiver identified and backup plan documented'),
('es','landing','sustainability_b2','Cuidador de respaldo identificado y plan de respaldo documentado'),
('it','landing','sustainability_b2','Caregiver di riserva identificato e piano di riserva documentato'),
('fr','landing','sustainability_b2','Aidant de secours identifié et plan de secours documenté'),
('de','landing','sustainability_b2','Vertretungspflegeperson identifiziert und Vertretungsplan dokumentiert'),
('sv','landing','sustainability_b2','Reservvårdare identifierad och reservplan dokumenterad'),
('fi','landing','sustainability_b2','Varahoitaja tunnistettu ja varautumissuunnitelma dokumentoitu'),
('ja','landing','sustainability_b2','Backup caregiver identified and backup plan documented'),

-- sustainability_b3
('en','landing','sustainability_b3','Respite time planned — so caregiving stays sustainable long-term'),
('es','landing','sustainability_b3','Tiempo de descanso planificado para que el cuidado sea sostenible a largo plazo'),
('it','landing','sustainability_b3','Tempo di sollievo pianificato — così l''assistenza rimane sostenibile a lungo termine'),
('fr','landing','sustainability_b3','Temps de répit planifié — afin que les soins restent durables à long terme'),
('de','landing','sustainability_b3','Auszeit geplant — damit die Pflege langfristig nachhaltig bleibt'),
('sv','landing','sustainability_b3','Avlastningstid planerad — så att vård förblir hållbar på lång sikt'),
('fi','landing','sustainability_b3','Lepoaika suunniteltu — jotta hoitaminen pysyy kestävänä pitkällä aikavälillä'),
('ja','landing','sustainability_b3','Respite time planned — so caregiving stays sustainable long-term'),

-- ============================================================
-- NEW CARER SECTION (newcarer_title already exists, skip it)
-- ============================================================

-- newcarer_eyebrow
('en','landing','newcarer_eyebrow','New to caregiving?'),
('es','landing','newcarer_eyebrow','¿Nuevo en el cuidado?'),
('it','landing','newcarer_eyebrow','Nuovo all''assistenza?'),
('fr','landing','newcarer_eyebrow','Nouveau dans les soins ?'),
('de','landing','newcarer_eyebrow','Neu in der Pflege?'),
('sv','landing','newcarer_eyebrow','Ny inom vård?'),
('fi','landing','newcarer_eyebrow','Uusi hoitamisessa?'),
('ja','landing','newcarer_eyebrow','New to caregiving?'),

-- newcarer_body
('en','landing','newcarer_body','Eight modules covering everything a new family caregiver needs to understand — from legal authority and team roles to health coordination and sustainable planning. No sign-up required.'),
('es','landing','newcarer_body','Ocho módulos que cubren todo lo que un nuevo cuidador familiar necesita entender: desde la autoridad legal y los roles del equipo hasta la coordinación de salud y la planificación sostenible. No se requiere registro.'),
('it','landing','newcarer_body','Otto moduli che coprono tutto ciò che un nuovo caregiver familiare deve capire — dall''autorità legale e i ruoli del team alla coordinazione sanitaria e alla pianificazione sostenibile. Nessuna registrazione richiesta.'),
('fr','landing','newcarer_body','Huit modules couvrant tout ce qu''un nouvel aidant familial doit comprendre — de l''autorité légale et des rôles de l''équipe à la coordination des soins de santé et à la planification durable. Aucune inscription requise.'),
('de','landing','newcarer_body','Acht Module, die alles abdecken, was eine neue familiäre Pflegeperson verstehen muss — von der rechtlichen Vollmacht und Teamrollen bis hin zur Gesundheitskoordination und nachhaltigen Planung. Keine Anmeldung erforderlich.'),
('sv','landing','newcarer_body','Åtta moduler som täcker allt en ny familjevårdare behöver förstå — från rättslig behörighet och teamroller till hälsokoordination och hållbar planering. Ingen registrering krävs.'),
('fi','landing','newcarer_body','Kahdeksan moduulia, jotka kattavat kaiken mitä uuden perhehoitajan täytyy ymmärtää — juridisesta valtuutuksesta ja tiimirooleista terveyden koordinointiin ja kestävään suunnitteluun. Ei rekisteröitymistä tarvita.'),
('ja','landing','newcarer_body','Eight modules covering everything a new family caregiver needs to understand — from legal authority and team roles to health coordination and sustainable planning. No sign-up required.'),

-- newcarer_cta
('en','landing','newcarer_cta','Explore the Caregiver Guide'),
('es','landing','newcarer_cta','Explorar la Guía del Cuidador'),
('it','landing','newcarer_cta','Esplora la Guida del Caregiver'),
('fr','landing','newcarer_cta','Explorer le Guide de l''Aidant'),
('de','landing','newcarer_cta','Den Leitfaden für Pflegepersonen erkunden'),
('sv','landing','newcarer_cta','Utforska Vårdarguiden'),
('fi','landing','newcarer_cta','Tutki Hoitajan Opasta'),
('ja','landing','newcarer_cta','Explore the Caregiver Guide'),

-- newcarer_module1
('en','landing','newcarer_module1','Big Picture'),
('es','landing','newcarer_module1','Visión General'),
('it','landing','newcarer_module1','Quadro Generale'),
('fr','landing','newcarer_module1','Vue d''ensemble'),
('de','landing','newcarer_module1','Das große Bild'),
('sv','landing','newcarer_module1','Helhetsbild'),
('fi','landing','newcarer_module1','Kokonaiskuva'),
('ja','landing','newcarer_module1','Big Picture'),

-- newcarer_module2
('en','landing','newcarer_module2','Care Plan'),
('es','landing','newcarer_module2','Plan de Cuidados'),
('it','landing','newcarer_module2','Piano di Cura'),
('fr','landing','newcarer_module2','Plan de soins'),
('de','landing','newcarer_module2','Pflegeplan'),
('sv','landing','newcarer_module2','Omvårdnadsplan'),
('fi','landing','newcarer_module2','Hoitosuunnitelma'),
('ja','landing','newcarer_module2','Care Plan'),

-- newcarer_module3
('en','landing','newcarer_module3','Team Roles'),
('es','landing','newcarer_module3','Roles del Equipo'),
('it','landing','newcarer_module3','Ruoli del Team'),
('fr','landing','newcarer_module3','Rôles de l''équipe'),
('de','landing','newcarer_module3','Teamrollen'),
('sv','landing','newcarer_module3','Teamroller'),
('fi','landing','newcarer_module3','Tiimin roolit'),
('ja','landing','newcarer_module3','Team Roles'),

-- newcarer_module4
('en','landing','newcarer_module4','Living Arrangements'),
('es','landing','newcarer_module4','Arreglos de Vida'),
('it','landing','newcarer_module4','Sistemazioni Abitative'),
('fr','landing','newcarer_module4','Arrangements de Vie'),
('de','landing','newcarer_module4','Wohnarrangements'),
('sv','landing','newcarer_module4','Boendesituationer'),
('fi','landing','newcarer_module4','Asumisjärjestelyt'),
('ja','landing','newcarer_module4','Living Arrangements'),

-- newcarer_module5
('en','landing','newcarer_module5','Legal Authority'),
('es','landing','newcarer_module5','Autoridad Legal'),
('it','landing','newcarer_module5','Autorità Legale'),
('fr','landing','newcarer_module5','Autorité Légale'),
('de','landing','newcarer_module5','Rechtliche Vollmacht'),
('sv','landing','newcarer_module5','Rättslig Behörighet'),
('fi','landing','newcarer_module5','Oikeudellinen Valtuutus'),
('ja','landing','newcarer_module5','Legal Authority'),

-- newcarer_module6
('en','landing','newcarer_module6','Health Coordination'),
('es','landing','newcarer_module6','Coordinación de Salud'),
('it','landing','newcarer_module6','Coordinamento Sanitario'),
('fr','landing','newcarer_module6','Coordination des soins de santé'),
('de','landing','newcarer_module6','Gesundheitskoordination'),
('sv','landing','newcarer_module6','Hälsokoordination'),
('fi','landing','newcarer_module6','Terveyden koordinointi'),
('ja','landing','newcarer_module6','Health Coordination'),

-- newcarer_module7
('en','landing','newcarer_module7','Sustainability'),
('es','landing','newcarer_module7','Sostenibilidad'),
('it','landing','newcarer_module7','Sostenibilità'),
('fr','landing','newcarer_module7','Durabilité'),
('de','landing','newcarer_module7','Nachhaltigkeit'),
('sv','landing','newcarer_module7','Hållbarhet'),
('fi','landing','newcarer_module7','Kestävyys'),
('ja','landing','newcarer_module7','Sustainability'),

-- newcarer_module8
('en','landing','newcarer_module8','Review & Update'),
('es','landing','newcarer_module8','Revisar y Actualizar'),
('it','landing','newcarer_module8','Revisione e Aggiornamento'),
('fr','landing','newcarer_module8','Réviser et Mettre à jour'),
('de','landing','newcarer_module8','Überprüfen & Aktualisieren'),
('sv','landing','newcarer_module8','Granska och Uppdatera'),
('fi','landing','newcarer_module8','Arvioi ja Päivitä'),
('ja','landing','newcarer_module8','Review & Update')

ON CONFLICT (locale, namespace, key) DO NOTHING;
