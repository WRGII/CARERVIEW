/*
  # Dementia Reference Scale — Seed Missing Translation Keys

  ## Summary
  The DementiaScalePage.tsx references 22 translation keys that were never seeded
  to the database or enFallback.ts, causing the page to render blank strings for
  every heading, body paragraph, stage note, and disclaimer.

  ## Keys Added (22 keys × 7 locales = 154 rows)
  - dementia.page_title          — Page heading
  - dementia.signs_symptoms      — Section label inside each stage card
  - dementia.expected_duration   — Section label inside each stage card
  - dementia.not_applicable      — Shown when stage has no duration (Stage 1)
  - dementia.note_4 through note_7 — Clinical notes for stages 4–7
  - dementia.about_title         — "About the GDS" panel heading
  - dementia.about_p1 / about_p2 — Explanatory paragraphs
  - dementia.stages_13 / stages_13_desc — Badge label + description
  - dementia.stage_4 / stage_4_desc
  - dementia.stages_56 / stages_56_desc
  - dementia.stage_7 / stage_7_desc
  - dementia.seven_stages        — Section heading
  - dementia.disclaimer_label    — "Disclaimer" bold prefix
  - dementia.disclaimer_body     — Full disclaimer text

  ## Locales
  en, es, fr, de, it, sv, fi

  ## Safety
  Uses INSERT ... ON CONFLICT DO NOTHING so re-running is safe.
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- ─────────────── ENGLISH ───────────────
('en', 'dementia.page_title',      'Dementia Reference Scale'),
('en', 'dementia.signs_symptoms',  'Signs & Symptoms'),
('en', 'dementia.expected_duration','Expected Duration'),
('en', 'dementia.not_applicable',  'Not applicable'),
('en', 'dementia.note_4',          'At this stage the person may be aware of their difficulties but tries to conceal or minimise them. A physician can detect problems through clinical interview.'),
('en', 'dementia.note_5',          'The person can no longer survive without some assistance. They retain knowledge of major personal facts (their name, their children''s names) but may have forgotten their address or phone number.'),
('en', 'dementia.note_6',          'The person is largely unaware of recent events and experiences. They require significant assistance with all activities of daily living and may require full-time supervision.'),
('en', 'dementia.note_7',          'All verbal abilities are lost over the course of this stage. Basic psychomotor skills are lost and the person is bedridden. Comfort-focused care is the priority.'),
('en', 'dementia.about_title',     'About the Global Deterioration Scale (GDS)'),
('en', 'dementia.about_p1',        'The Global Deterioration Scale (GDS), developed by Dr. Barry Reisberg, provides caregivers with an overview of the stages of cognitive function for those suffering from a primary degenerative dementia such as Alzheimer''s disease.'),
('en', 'dementia.about_p2',        'The scale defines 7 stages from no cognitive decline to very severe cognitive decline. The GDS is most relevant for individuals with Alzheimer''s disease and may not apply to other forms of dementia.'),
('en', 'dementia.stages_13',       'Stages 1–3'),
('en', 'dementia.stages_13_desc',  'No Dementia'),
('en', 'dementia.stage_4',         'Stage 4'),
('en', 'dementia.stage_4_desc',    'Early-Stage Dementia'),
('en', 'dementia.stages_56',       'Stages 5–6'),
('en', 'dementia.stages_56_desc',  'Mid-Stage Dementia'),
('en', 'dementia.stage_7',         'Stage 7'),
('en', 'dementia.stage_7_desc',    'Late-Stage Dementia'),
('en', 'dementia.seven_stages',    'The Seven Stages'),
('en', 'dementia.disclaimer_label','Disclaimer:'),
('en', 'dementia.disclaimer_body', 'This scale is a clinical reference tool intended for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Please consult a qualified healthcare provider for any medical concerns.'),

-- ─────────────── SPANISH ───────────────
('es', 'dementia.page_title',      'Escala de Referencia de Demencia'),
('es', 'dementia.signs_symptoms',  'Signos y Síntomas'),
('es', 'dementia.expected_duration','Duración Esperada'),
('es', 'dementia.not_applicable',  'No aplicable'),
('es', 'dementia.note_4',          'En esta etapa la persona puede ser consciente de sus dificultades pero intenta ocultarlas o minimizarlas. Un médico puede detectar problemas mediante una entrevista clínica.'),
('es', 'dementia.note_5',          'La persona ya no puede sobrevivir sin cierta asistencia. Conserva conocimientos de hechos personales importantes, pero puede haber olvidado su dirección o teléfono.'),
('es', 'dementia.note_6',          'La persona tiene poca conciencia de los eventos y experiencias recientes. Requiere asistencia significativa en todas las actividades de la vida diaria y puede necesitar supervisión continua.'),
('es', 'dementia.note_7',          'Todas las habilidades verbales se pierden durante esta etapa. Se pierden las habilidades psicomotoras básicas y la persona queda postrada en cama. La atención centrada en el confort es la prioridad.'),
('es', 'dementia.about_title',     'Acerca de la Escala de Deterioro Global (GDS)'),
('es', 'dementia.about_p1',        'La Escala de Deterioro Global (GDS), desarrollada por el Dr. Barry Reisberg, proporciona a los cuidadores una visión general de las etapas de la función cognitiva para quienes padecen demencia degenerativa primaria como el Alzheimer.'),
('es', 'dementia.about_p2',        'La escala define 7 etapas, desde ningún deterioro cognitivo hasta un deterioro cognitivo muy grave. La GDS es más relevante para personas con Alzheimer y puede no aplicarse a otras formas de demencia.'),
('es', 'dementia.stages_13',       'Etapas 1–3'),
('es', 'dementia.stages_13_desc',  'Sin Demencia'),
('es', 'dementia.stage_4',         'Etapa 4'),
('es', 'dementia.stage_4_desc',    'Demencia Temprana'),
('es', 'dementia.stages_56',       'Etapas 5–6'),
('es', 'dementia.stages_56_desc',  'Demencia en Etapa Media'),
('es', 'dementia.stage_7',         'Etapa 7'),
('es', 'dementia.stage_7_desc',    'Demencia en Etapa Tardía'),
('es', 'dementia.seven_stages',    'Las Siete Etapas'),
('es', 'dementia.disclaimer_label','Aviso:'),
('es', 'dementia.disclaimer_body', 'Esta escala es una herramienta de referencia clínica destinada únicamente a fines informativos. No sustituye el consejo, diagnóstico o tratamiento médico profesional. Consulte a un proveedor de salud calificado para cualquier preocupación médica.'),

-- ─────────────── FRENCH ───────────────
('fr', 'dementia.page_title',      'Échelle de Référence de la Démence'),
('fr', 'dementia.signs_symptoms',  'Signes et Symptômes'),
('fr', 'dementia.expected_duration','Durée Attendue'),
('fr', 'dementia.not_applicable',  'Non applicable'),
('fr', 'dementia.note_4',          'À ce stade, la personne peut être consciente de ses difficultés mais tente de les dissimuler ou de les minimiser. Un médecin peut détecter des problèmes lors d''un entretien clinique.'),
('fr', 'dementia.note_5',          'La personne ne peut plus survivre sans une certaine assistance. Elle conserve la connaissance de faits personnels importants, mais peut avoir oublié son adresse ou son numéro de téléphone.'),
('fr', 'dementia.note_6',          'La personne est largement inconsciente des événements et expériences récents. Elle nécessite une aide importante pour toutes les activités de la vie quotidienne et peut nécessiter une surveillance permanente.'),
('fr', 'dementia.note_7',          'Toutes les capacités verbales sont perdues au cours de ce stade. Les compétences psychomotrices de base disparaissent et la personne est alitée. Les soins axés sur le confort sont la priorité.'),
('fr', 'dementia.about_title',     'À propos de l''Échelle de Détérioration Globale (GDS)'),
('fr', 'dementia.about_p1',        'L''Échelle de Détérioration Globale (GDS), développée par le Dr Barry Reisberg, donne aux aidants un aperçu des stades de la fonction cognitive pour les personnes souffrant d''une démence dégénérative primaire telle que la maladie d''Alzheimer.'),
('fr', 'dementia.about_p2',        'L''échelle définit 7 stades, allant d''aucun déclin cognitif à un déclin cognitif très sévère. La GDS est la plus pertinente pour les personnes atteintes de la maladie d''Alzheimer et peut ne pas s''appliquer à d''autres formes de démence.'),
('fr', 'dementia.stages_13',       'Stades 1–3'),
('fr', 'dementia.stages_13_desc',  'Pas de Démence'),
('fr', 'dementia.stage_4',         'Stade 4'),
('fr', 'dementia.stage_4_desc',    'Démence au Stade Précoce'),
('fr', 'dementia.stages_56',       'Stades 5–6'),
('fr', 'dementia.stages_56_desc',  'Démence au Stade Intermédiaire'),
('fr', 'dementia.stage_7',         'Stade 7'),
('fr', 'dementia.stage_7_desc',    'Démence au Stade Avancé'),
('fr', 'dementia.seven_stages',    'Les Sept Stades'),
('fr', 'dementia.disclaimer_label','Avertissement :'),
('fr', 'dementia.disclaimer_body', 'Cette échelle est un outil de référence clinique destiné uniquement à des fins d''information. Elle ne remplace pas les conseils médicaux professionnels, le diagnostic ou le traitement. Veuillez consulter un professionnel de santé qualifié pour toute préoccupation médicale.'),

-- ─────────────── GERMAN ───────────────
('de', 'dementia.page_title',      'Demenz-Referenzskala'),
('de', 'dementia.signs_symptoms',  'Anzeichen und Symptome'),
('de', 'dementia.expected_duration','Erwartete Dauer'),
('de', 'dementia.not_applicable',  'Nicht zutreffend'),
('de', 'dementia.note_4',          'In diesem Stadium ist sich die Person ihrer Schwierigkeiten möglicherweise bewusst, versucht sie jedoch zu verbergen oder zu minimieren. Ein Arzt kann Probleme im klinischen Interview erkennen.'),
('de', 'dementia.note_5',          'Die Person kann nicht mehr ohne Unterstützung auskommen. Sie kennt noch wichtige persönliche Fakten, hat aber möglicherweise ihre Adresse oder Telefonnummer vergessen.'),
('de', 'dementia.note_6',          'Die Person ist sich jüngster Ereignisse und Erfahrungen weitgehend nicht bewusst. Sie benötigt erhebliche Unterstützung bei allen Aktivitäten des täglichen Lebens und möglicherweise Rund-um-die-Uhr-Betreuung.'),
('de', 'dementia.note_7',          'Im Verlauf dieses Stadiums gehen alle verbalen Fähigkeiten verloren. Grundlegende psychomotorische Fähigkeiten werden verloren und die Person ist bettlägerig. Komfortzentrierte Pflege hat Priorität.'),
('de', 'dementia.about_title',     'Über die Globale Verschlechterungsskala (GDS)'),
('de', 'dementia.about_p1',        'Die Globale Verschlechterungsskala (GDS), entwickelt von Dr. Barry Reisberg, bietet Pflegenden einen Überblick über die Stufen der kognitiven Funktion bei Personen mit einer primären degenerativen Demenz wie der Alzheimer-Krankheit.'),
('de', 'dementia.about_p2',        'Die Skala definiert 7 Stufen von keinem kognitiven Abbau bis hin zu sehr schwerem kognitiven Abbau. Die GDS ist am relevantesten für Personen mit Alzheimer und gilt möglicherweise nicht für andere Demenzformen.'),
('de', 'dementia.stages_13',       'Stufen 1–3'),
('de', 'dementia.stages_13_desc',  'Keine Demenz'),
('de', 'dementia.stage_4',         'Stufe 4'),
('de', 'dementia.stage_4_desc',    'Frühstadium der Demenz'),
('de', 'dementia.stages_56',       'Stufen 5–6'),
('de', 'dementia.stages_56_desc',  'Mittleres Demenzstadium'),
('de', 'dementia.stage_7',         'Stufe 7'),
('de', 'dementia.stage_7_desc',    'Spätstadium der Demenz'),
('de', 'dementia.seven_stages',    'Die Sieben Stufen'),
('de', 'dementia.disclaimer_label','Haftungsausschluss:'),
('de', 'dementia.disclaimer_body', 'Diese Skala ist ein klinisches Referenzwerkzeug, das nur zu Informationszwecken gedacht ist. Sie ersetzt nicht professionellen medizinischen Rat, Diagnose oder Behandlung. Bitte wenden Sie sich bei medizinischen Fragen an einen qualifizierten Gesundheitsdienstleister.'),

-- ─────────────── ITALIAN ───────────────
('it', 'dementia.page_title',      'Scala di Riferimento per la Demenza'),
('it', 'dementia.signs_symptoms',  'Segni e Sintomi'),
('it', 'dementia.expected_duration','Durata Prevista'),
('it', 'dementia.not_applicable',  'Non applicabile'),
('it', 'dementia.note_4',          'In questa fase la persona può essere consapevole delle proprie difficoltà ma cerca di nasconderle o minimizzarle. Un medico può rilevare problemi attraverso un colloquio clinico.'),
('it', 'dementia.note_5',          'La persona non può più sopravvivere senza un certo aiuto. Conserva la conoscenza di fatti personali importanti, ma può aver dimenticato il proprio indirizzo o numero di telefono.'),
('it', 'dementia.note_6',          'La persona è in gran parte inconsapevole degli eventi e delle esperienze recenti. Richiede un aiuto significativo in tutte le attività della vita quotidiana e può richiedere una supervisione a tempo pieno.'),
('it', 'dementia.note_7',          'Nel corso di questa fase tutte le capacità verbali vengono perse. Le abilità psicomotorie di base vengono meno e la persona è costretta a letto. L''assistenza focalizzata sul comfort è la priorità.'),
('it', 'dementia.about_title',     'Informazioni sulla Scala di Deterioramento Globale (GDS)'),
('it', 'dementia.about_p1',        'La Scala di Deterioramento Globale (GDS), sviluppata dal Dr. Barry Reisberg, fornisce ai caregiver una panoramica degli stadi della funzione cognitiva per coloro che soffrono di una demenza degenerativa primaria come la malattia di Alzheimer.'),
('it', 'dementia.about_p2',        'La scala definisce 7 stadi, dall''assenza di declino cognitivo al declino cognitivo molto grave. La GDS è più pertinente per le persone con Alzheimer e potrebbe non applicarsi ad altre forme di demenza.'),
('it', 'dementia.stages_13',       'Stadi 1–3'),
('it', 'dementia.stages_13_desc',  'Nessuna Demenza'),
('it', 'dementia.stage_4',         'Stadio 4'),
('it', 'dementia.stage_4_desc',    'Demenza in Fase Iniziale'),
('it', 'dementia.stages_56',       'Stadi 5–6'),
('it', 'dementia.stages_56_desc',  'Demenza in Fase Intermedia'),
('it', 'dementia.stage_7',         'Stadio 7'),
('it', 'dementia.stage_7_desc',    'Demenza in Fase Avanzata'),
('it', 'dementia.seven_stages',    'I Sette Stadi'),
('it', 'dementia.disclaimer_label','Avviso:'),
('it', 'dementia.disclaimer_body', 'Questa scala è uno strumento di riferimento clinico destinato esclusivamente a scopi informativi. Non sostituisce il consiglio medico professionale, la diagnosi o il trattamento. Si prega di consultare un operatore sanitario qualificato per qualsiasi preoccupazione medica.'),

-- ─────────────── SWEDISH ───────────────
('sv', 'dementia.page_title',      'Referensskala för Demens'),
('sv', 'dementia.signs_symptoms',  'Tecken och Symptom'),
('sv', 'dementia.expected_duration','Förväntad Varaktighet'),
('sv', 'dementia.not_applicable',  'Ej tillämpligt'),
('sv', 'dementia.note_4',          'I detta skede kan personen vara medveten om sina svårigheter men försöker dölja eller minimera dem. En läkare kan upptäcka problem vid en klinisk intervju.'),
('sv', 'dementia.note_5',          'Personen kan inte längre klara sig utan viss hjälp. De behåller kunskap om viktiga personliga fakta, men kan ha glömt sin adress eller sitt telefonnummer.'),
('sv', 'dementia.note_6',          'Personen är till stor del omedveten om nyliga händelser och upplevelser. De behöver betydande hjälp med alla vardagsaktiviteter och kan behöva tillsyn dygnet runt.'),
('sv', 'dementia.note_7',          'Alla verbala förmågor förloras under loppet av detta stadium. Grundläggande psykomotoriska färdigheter försvinner och personen är sängbunden. Komfortfokuserad vård är prioriteten.'),
('sv', 'dementia.about_title',     'Om den Globala Försämringsskalan (GDS)'),
('sv', 'dementia.about_p1',        'Den Globala Försämringsskalan (GDS), utvecklad av Dr. Barry Reisberg, ger vårdgivare en översikt över stadierna av kognitiv funktion för dem som lider av en primär degenerativ demens som Alzheimers sjukdom.'),
('sv', 'dementia.about_p2',        'Skalan definierar 7 stadier från ingen kognitiv försämring till mycket svår kognitiv försämring. GDS är mest relevant för personer med Alzheimers sjukdom och kanske inte gäller för andra former av demens.'),
('sv', 'dementia.stages_13',       'Stadier 1–3'),
('sv', 'dementia.stages_13_desc',  'Ingen Demens'),
('sv', 'dementia.stage_4',         'Stadium 4'),
('sv', 'dementia.stage_4_desc',    'Tidig Demens'),
('sv', 'dementia.stages_56',       'Stadier 5–6'),
('sv', 'dementia.stages_56_desc',  'Medelsvår Demens'),
('sv', 'dementia.stage_7',         'Stadium 7'),
('sv', 'dementia.stage_7_desc',    'Sen Demens'),
('sv', 'dementia.seven_stages',    'De Sju Stadierna'),
('sv', 'dementia.disclaimer_label','Ansvarsfriskrivning:'),
('sv', 'dementia.disclaimer_body', 'Denna skala är ett kliniskt referensverktyg avsett enbart för informationsändamål. Det ersätter inte professionell medicinsk rådgivning, diagnos eller behandling. Konsultera en kvalificerad vårdgivare för eventuella medicinska frågor.'),

-- ─────────────── FINNISH ───────────────
('fi', 'dementia.page_title',      'Dementian Viiteasteikko'),
('fi', 'dementia.signs_symptoms',  'Merkit ja Oireet'),
('fi', 'dementia.expected_duration','Odotettu Kesto'),
('fi', 'dementia.not_applicable',  'Ei sovellettavissa'),
('fi', 'dementia.note_4',          'Tässä vaiheessa henkilö saattaa olla tietoinen vaikeuksistaan, mutta yrittää peittää tai vähätellä niitä. Lääkäri voi havaita ongelmia kliinisessä haastattelussa.'),
('fi', 'dementia.note_5',          'Henkilö ei enää pysty selviytymään ilman tukea. Hän muistaa tärkeitä henkilökohtaisia tietoja, mutta saattaa olla unohtanut osoitteensa tai puhelinnumeronsa.'),
('fi', 'dementia.note_6',          'Henkilö on suurelta osin tietämätön viimeaikaisista tapahtumista ja kokemuksista. Hän tarvitsee merkittävää apua kaikissa päivittäisissä toiminnoissa ja saattaa tarvita ympärivuorokautista valvontaa.'),
('fi', 'dementia.note_7',          'Kaikki kielelliset kyvyt menetetään tämän vaiheen aikana. Peruspyrkomotoriset taidot häviävät ja henkilö on vuodepotilas. Mukavuuteen keskittyvä hoito on ensisijaista.'),
('fi', 'dementia.about_title',     'Tietoa Globaalista Heikentymisasteikosta (GDS)'),
('fi', 'dementia.about_p1',        'Globaali Heikentymisasteikko (GDS), jonka kehitti tri Barry Reisberg, antaa hoitajille yleiskatsauksen kognitiivisen toiminnan vaiheista henkilöillä, jotka kärsivät ensisijaisesta rappeutuvasta dementiasta, kuten Alzheimerin taudista.'),
('fi', 'dementia.about_p2',        'Asteikko määrittelee 7 vaihetta, jotka vaihtelevat ei kognitiivista heikkenemistä erittäin vakavaan kognitiiviseen heikkenemiseen. GDS on merkityksellisin Alzheimerin tautia sairastaville henkilöille, eikä se välttämättä koske muita dementian muotoja.'),
('fi', 'dementia.stages_13',       'Vaiheet 1–3'),
('fi', 'dementia.stages_13_desc',  'Ei Dementiaa'),
('fi', 'dementia.stage_4',         'Vaihe 4'),
('fi', 'dementia.stage_4_desc',    'Varhainen Dementia'),
('fi', 'dementia.stages_56',       'Vaiheet 5–6'),
('fi', 'dementia.stages_56_desc',  'Keskivaikea Dementia'),
('fi', 'dementia.stage_7',         'Vaihe 7'),
('fi', 'dementia.stage_7_desc',    'Myöhäinen Dementia'),
('fi', 'dementia.seven_stages',    'Seitsemän Vaihetta'),
('fi', 'dementia.disclaimer_label','Vastuuvapauslauseke:'),
('fi', 'dementia.disclaimer_body', 'Tämä asteikko on kliininen viitetyökalu, joka on tarkoitettu vain tiedotustarkoituksiin. Se ei korvaa ammattimaista lääketieteellistä neuvontaa, diagnoosia tai hoitoa. Ota yhteyttä pätevään terveydenhuollon tarjoajaan kaikissa lääketieteellisissä kysymyksissä.')

ON CONFLICT (locale, key) DO NOTHING;
