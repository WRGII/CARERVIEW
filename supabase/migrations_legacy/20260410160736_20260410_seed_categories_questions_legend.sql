/*
  # Seed categories, questions, and legend tables

  ## Summary
  These three tables were never seeded in any applied migration. The original seed
  data was only in an archived pre-auth migration (_archive/foggy_bird.sql) that was
  never applied to the current database. As a result:
  - All users see "No score reference data available" on the dashboard
  - The observation form has no categories or questions to display
  - The ScoreLegendDisplay is blank

  ## Tables Affected

  ### legend (5 rows)
  - Scores 1–5 representing the reversed CarerView independence scale:
    1 = Fully Independent, 2 = Independent with Difficulty,
    3 = Independent with Support, 4 = Constant Shared Effort, 5 = Total Assistance
  - Includes translations JSONB for all supported locales

  ### categories (12 rows)
  - 6 ADL categories (sort_order 1–6)
  - 6 IADL categories (sort_order 7–12)
  - Includes translations JSONB for supported locales

  ### questions (36 rows)
  - 3 questions per category × 12 categories = 36 questions
  - Each question targets a specific observable behaviour in that category

  ## Security
  - No RLS changes; existing policies on all three tables remain in effect.

  ## Important Notes
  1. All inserts use conditional logic (IF NOT EXISTS) — safe to re-run
  2. The legend scores use the REVERSED scale: 1 = most independent, 5 = most dependent
  3. categories uses ON CONFLICT (name) DO UPDATE (name has a UNIQUE constraint)
*/

-- ============================================================
-- LEGEND  (1=Fully Independent … 5=Total Assistance)
-- Each score is inserted only if no row with that score exists yet
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.legend WHERE score = 1) THEN
    INSERT INTO public.legend (score, description, translations) VALUES
      (1, 'Fully Independent',
       '{"es":"Completamente Independiente","sv":"Helt självständig","fi":"Täysin itsenäinen","de":"Vollständig Unabhängig","fr":"Totalement Indépendant","it":"Completamente Indipendente"}');
  ELSE
    UPDATE public.legend SET description = 'Fully Independent',
      translations = '{"es":"Completamente Independiente","sv":"Helt självständig","fi":"Täysin itsenäinen","de":"Vollständig Unabhängig","fr":"Totalement Indépendant","it":"Completamente Indipendente"}'
    WHERE score = 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.legend WHERE score = 2) THEN
    INSERT INTO public.legend (score, description, translations) VALUES
      (2, 'Independent with Difficulty',
       '{"es":"Independiente con Dificultad","sv":"Självständig med svårighet","fi":"Itsenäinen vaikeuksin","de":"Unabhängig mit Schwierigkeiten","fr":"Indépendant avec Difficultés","it":"Indipendente con Difficoltà"}');
  ELSE
    UPDATE public.legend SET description = 'Independent with Difficulty',
      translations = '{"es":"Independiente con Dificultad","sv":"Självständig med svårighet","fi":"Itsenäinen vaikeuksin","de":"Unabhängig mit Schwierigkeiten","fr":"Indépendant avec Difficultés","it":"Indipendente con Difficoltà"}'
    WHERE score = 2;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.legend WHERE score = 3) THEN
    INSERT INTO public.legend (score, description, translations) VALUES
      (3, 'Independent with Support',
       '{"es":"Independiente con Apoyo","sv":"Självständig med stöd","fi":"Itsenäinen tuella","de":"Unabhängig mit Unterstützung","fr":"Indépendant avec Soutien","it":"Indipendente con Supporto"}');
  ELSE
    UPDATE public.legend SET description = 'Independent with Support',
      translations = '{"es":"Independiente con Apoyo","sv":"Självständig med stöd","fi":"Itsenäinen tuella","de":"Unabhängig mit Unterstützung","fr":"Indépendant avec Soutien","it":"Indipendente con Supporto"}'
    WHERE score = 3;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.legend WHERE score = 4) THEN
    INSERT INTO public.legend (score, description, translations) VALUES
      (4, 'Constant Shared Effort',
       '{"es":"Esfuerzo Compartido Constante","sv":"Konstant delad ansträngning","fi":"Jatkuva jaettu ponnistus","de":"Konstante gemeinsame Anstrengung","fr":"Effort Partagé Constant","it":"Sforzo Condiviso Costante"}');
  ELSE
    UPDATE public.legend SET description = 'Constant Shared Effort',
      translations = '{"es":"Esfuerzo Compartido Constante","sv":"Konstant delad ansträngning","fi":"Jatkuva jaettu ponnistus","de":"Konstante gemeinsame Anstrengung","fr":"Effort Partagé Constant","it":"Sforzo Condiviso Costante"}'
    WHERE score = 4;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.legend WHERE score = 5) THEN
    INSERT INTO public.legend (score, description, translations) VALUES
      (5, 'Total Assistance',
       '{"es":"Asistencia Total","sv":"Total assistans","fi":"Täysi apu","de":"Vollständige Unterstützung","fr":"Assistance Totale","it":"Assistenza Totale"}');
  ELSE
    UPDATE public.legend SET description = 'Total Assistance',
      translations = '{"es":"Asistencia Total","sv":"Total assistans","fi":"Täysi apu","de":"Vollständige Unterstützung","fr":"Assistance Totale","it":"Assistenza Totale"}'
    WHERE score = 5;
  END IF;
END $$;

-- ============================================================
-- CATEGORIES  (ADL 1–6, IADL 7–12)
-- categories.name has a UNIQUE constraint so ON CONFLICT is valid
-- ============================================================
INSERT INTO public.categories (id, name, type, sort_order, translations)
VALUES
  (gen_random_uuid(), 'Bathing & Personal Hygiene',  'ADL',  1, '{"es":"Baño e Higiene Personal","sv":"Personlig hygien","fi":"Peseytyminen ja hygienia","de":"Baden & persönliche Hygiene","fr":"Bain & Hygiène Personnelle","it":"Bagno & Igiene Personale"}'),
  (gen_random_uuid(), 'Dressing & Grooming',         'ADL',  2, '{"es":"Vestirse y Arreglarse","sv":"Påklädning","fi":"Pukeutuminen","de":"Anziehen & Pflege","fr":"Habillage & Soins","it":"Abbigliamento & Cura Personale"}'),
  (gen_random_uuid(), 'Eating & Drinking',           'ADL',  3, '{"es":"Comer y Beber","sv":"Äta och dricka","fi":"Syöminen ja juominen","de":"Essen & Trinken","fr":"Manger & Boire","it":"Mangiare & Bere"}'),
  (gen_random_uuid(), 'Toileting & Continence',      'ADL',  4, '{"es":"Uso del Baño y Continencia","sv":"Toalettbesök","fi":"WC-käynnit ja pidätyskyky","de":"Toilettennutzung","fr":"Toilette & Continence","it":"Servizi igienici & Continenza"}'),
  (gen_random_uuid(), 'Mobility & Transfers',        'ADL',  5, '{"es":"Movilidad y Traslados","sv":"Rörlighet och förflyttning","fi":"Liikkuminen ja siirtyminen","de":"Mobilität & Transfers","fr":"Mobilité & Transferts","it":"Mobilità & Trasferimenti"}'),
  (gen_random_uuid(), 'Safety Awareness',            'ADL',  6, '{"es":"Conciencia de Seguridad","sv":"Säkerhetsmedvetenhet","fi":"Turvallisuustietoisuus","de":"Sicherheitsbewusstsein","fr":"Conscience de la Sécurité","it":"Consapevolezza della Sicurezza"}'),
  (gen_random_uuid(), 'Medication Management',       'IADL', 7, '{"es":"Manejo de Medicamentos","sv":"Läkemedelshantering","fi":"Lääkehallinta","de":"Medikamentenmanagement","fr":"Gestion des Médicaments","it":"Gestione dei Farmaci"}'),
  (gen_random_uuid(), 'Meals & Groceries',           'IADL', 8, '{"es":"Comidas y Compras","sv":"Mat och inköp","fi":"Ruokailu ja ostokset","de":"Mahlzeiten & Lebensmitteleinkauf","fr":"Repas & Courses","it":"Pasti & Spesa"}'),
  (gen_random_uuid(), 'Housekeeping & Laundry',      'IADL', 9, '{"es":"Limpieza del Hogar y Lavandería","sv":"Städning och tvätt","fi":"Siivous ja pyykki","de":"Haushaltsführung & Wäsche","fr":"Ménage & Lessive","it":"Faccende Domestiche & Bucato"}'),
  (gen_random_uuid(), 'Finances & Paperwork',        'IADL', 10,'{"es":"Finanzas y Papeleo","sv":"Ekonomi och pappersarbete","fi":"Talous ja paperityöt","de":"Finanzen & Papierkram","fr":"Finances & Paperasse","it":"Finanze & Pratiche Burocratiche"}'),
  (gen_random_uuid(), 'Communication & Memory',      'IADL', 11,'{"es":"Comunicación y Memoria","sv":"Kommunikation och minne","fi":"Viestintä ja muisti","de":"Kommunikation & Gedächtnis","fr":"Communication & Mémoire","it":"Comunicazione & Memoria"}'),
  (gen_random_uuid(), 'Transportation & Errands',    'IADL', 12,'{"es":"Transporte y Diligencias","sv":"Transport och ärenden","fi":"Liikenne ja asiointi","de":"Transport & Besorgungen","fr":"Transport & Courses","it":"Trasporto & Commissioni"}')
ON CONFLICT (name) DO UPDATE
  SET sort_order   = EXCLUDED.sort_order,
      type         = EXCLUDED.type,
      translations = EXCLUDED.translations;

-- ============================================================
-- QUESTIONS  (3 per category)
-- No unique constraint on questions so we use IF NOT EXISTS guards
-- ============================================================
DO $$
DECLARE
  v_cat uuid;
BEGIN

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Bathing & Personal Hygiene';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well can they wash their hands and face independently?', v_cat, 1,
       '{"es":"¿Qué tan bien pueden lavarse las manos y la cara de forma independiente?","sv":"Hur väl kan de tvätta händer och ansikte självständigt?","fi":"Kuinka hyvin he voivat pestä kätensä ja kasvonsa itsenäisesti?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they manage bathing or showering on their own?', v_cat, 2,
       '{"es":"¿Qué tan bien manejan el baño o la ducha por su cuenta?","sv":"Hur väl klarar de av att bada eller duscha på egen hand?","fi":"Kuinka hyvin he selviytyvät kylvystä tai suihkusta yksin?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they maintain oral hygiene (brushing teeth)?', v_cat, 3,
       '{"es":"¿Qué tan bien mantienen la higiene bucal (cepillado de dientes)?","sv":"Hur väl upprätthåller de munhygienen (tandborstning)?","fi":"Kuinka hyvin he ylläpitävät suuhygieniaa (hampaiden harjaus)?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Dressing & Grooming';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well can they choose and put on appropriate clothing?', v_cat, 1,
       '{"es":"¿Qué tan bien pueden elegir y ponerse ropa apropiada?","sv":"Hur väl kan de välja och ta på sig lämpliga kläder?","fi":"Kuinka hyvin he voivat valita ja pukea sopivat vaatteet?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they manage buttons, zippers, and fasteners?', v_cat, 2,
       '{"es":"¿Qué tan bien manejan botones, cremalleras y cierres?","sv":"Hur väl hanterar de knappar, dragkedjor och fästen?","fi":"Kuinka hyvin he hallitsevat napit, vetoketjut ja kiinnikkeet?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they manage hair care and personal grooming?', v_cat, 3,
       '{"es":"¿Qué tan bien manejan el cuidado del cabello y el arreglo personal?","sv":"Hur väl sköter de hårvård och personlig hygien?","fi":"Kuinka hyvin he hallitsevat hiustenhoitoa ja henkilökohtaista siisteydenhoitoa?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Eating & Drinking';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well can they feed themselves using utensils?', v_cat, 1,
       '{"es":"¿Qué tan bien pueden alimentarse usando utensilios?","sv":"Hur väl kan de äta själva med bestick?","fi":"Kuinka hyvin he voivat syödä itse ruokailuvälineitä käyttäen?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they manage drinking fluids without spilling?', v_cat, 2,
       '{"es":"¿Qué tan bien manejan el consumo de líquidos sin derramar?","sv":"Hur väl hanterar de att dricka utan att spilla?","fi":"Kuinka hyvin he selviytyvät nesteiden juomisesta ilman läikyttämistä?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How consistently do they eat adequate meals during the day?', v_cat, 3,
       '{"es":"¿Con qué frecuencia comen comidas adecuadas durante el día?","sv":"Hur konsekvent äter de tillräckliga måltider under dagen?","fi":"Kuinka johdonmukaisesti he syövät riittäviä aterioita päivän aikana?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Toileting & Continence';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they recognise and respond to the need to use the toilet?', v_cat, 1,
       '{"es":"¿Qué tan bien reconocen y responden a la necesidad de usar el baño?","sv":"Hur väl känner de igen och reagerar på behovet av att använda toaletten?","fi":"Kuinka hyvin he tunnistaa ja reagoi tarpeeseen käydä WC:ssä?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they manage clothing during toileting?', v_cat, 2,
       '{"es":"¿Qué tan bien manejan la ropa al ir al baño?","sv":"Hur väl hanterar de kläderna vid toalettbesök?","fi":"Kuinka hyvin he hallitsevat vaatteiden käsittelyn WC-käynneillä?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well is continence maintained during the day?', v_cat, 3,
       '{"es":"¿Qué tan bien se mantiene la continencia durante el día?","sv":"Hur väl upprätthålls kontinensen under dagen?","fi":"Kuinka hyvin pidätyskyky säilyy päivän aikana?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Mobility & Transfers';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they move around the home independently?', v_cat, 1,
       '{"es":"¿Qué tan bien se mueven por el hogar de forma independiente?","sv":"Hur väl rör de sig runt hemmet självständigt?","fi":"Kuinka hyvin he liikkuvat kotona itsenäisesti?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they transfer between sitting and standing positions?', v_cat, 2,
       '{"es":"¿Qué tan bien se transfieren entre posiciones sentado y de pie?","sv":"Hur väl förflyttar de sig mellan sittande och stående?","fi":"Kuinka hyvin he siirtyvät istumisesta seisomiseen?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How safely do they navigate stairs or uneven surfaces?', v_cat, 3,
       '{"es":"¿Con qué seguridad navegan escaleras o superficies irregulares?","sv":"Hur säkert navigerar de trappor eller ojämna ytor?","fi":"Kuinka turvallisesti he liikkuvat portaissa tai epätasaisilla pinnoilla?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Safety Awareness';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they recognise and avoid common household hazards?', v_cat, 1,
       '{"es":"¿Qué tan bien reconocen y evitan peligros comunes del hogar?","sv":"Hur väl känner de igen och undviker vanliga hushållsrisker?","fi":"Kuinka hyvin he tunnistaa ja välttää tavallisia kotitapaturmavaaroja?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How consistently do they follow routines that keep them safe?', v_cat, 2,
       '{"es":"¿Con qué frecuencia siguen rutinas que los mantienen seguros?","sv":"Hur konsekvent följer de rutiner som håller dem säkra?","fi":"Kuinka johdonmukaisesti he noudattavat turvallisuusrutiineja?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they respond appropriately in an emergency?', v_cat, 3,
       '{"es":"¿Qué tan bien responden apropiadamente en una emergencia?","sv":"Hur väl reagerar de på lämpligt sätt i en nödsituation?","fi":"Kuinka hyvin he reagoivat asianmukaisesti hätätilanteessa?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Medication Management';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How reliably do they take medications at the correct times?', v_cat, 1,
       '{"es":"¿Con qué fiabilidad toman los medicamentos a las horas correctas?","sv":"Hur tillförlitligt tar de mediciner vid rätt tidpunkter?","fi":"Kuinka luotettavasti he ottavat lääkkeet oikeaan aikaan?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How accurately do they manage correct dosages?', v_cat, 2,
       '{"es":"¿Con qué precisión manejan las dosis correctas?","sv":"Hur noggrant hanterar de korrekta doser?","fi":"Kuinka tarkasti he hallitsevat oikeat annokset?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they recognise and communicate medication side effects?', v_cat, 3,
       '{"es":"¿Qué tan bien reconocen y comunican los efectos secundarios de los medicamentos?","sv":"Hur väl känner de igen och kommunicerar biverkningar av mediciner?","fi":"Kuinka hyvin he tunnistaa ja viestii lääkkeiden sivuvaikutuksista?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Meals & Groceries';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well can they plan and prepare a simple meal independently?', v_cat, 1,
       '{"es":"¿Qué tan bien pueden planificar y preparar una comida sencilla?","sv":"Hur väl kan de planera och förbereda en enkel måltid självständigt?","fi":"Kuinka hyvin he voivat suunnitella ja valmistaa yksinkertaisen aterian itsenäisesti?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they manage grocery shopping for basic needs?', v_cat, 2,
       '{"es":"¿Qué tan bien manejan las compras de comestibles para necesidades básicas?","sv":"Hur väl hanterar de matinköp för grundläggande behov?","fi":"Kuinka hyvin he selviytyvät ruokaostoksista perustarpeiden osalta?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How consistently do they maintain a nutritious and balanced diet?', v_cat, 3,
       '{"es":"¿Con qué frecuencia mantienen una dieta nutritiva y equilibrada?","sv":"Hur konsekvent upprätthåller de en näringsrik och balanserad kost?","fi":"Kuinka johdonmukaisesti he ylläpitävät ravitsevaa ja tasapainoista ruokavaliota?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Housekeeping & Laundry';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they keep their living area tidy and clean?', v_cat, 1,
       '{"es":"¿Qué tan bien mantienen su área de vida limpia y ordenada?","sv":"Hur väl håller de sitt bostadsområde snyggt och rent?","fi":"Kuinka hyvin he pitävät asuintilansa siistinä ja puhtaana?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they manage washing, drying, and folding laundry?', v_cat, 2,
       '{"es":"¿Qué tan bien manejan el lavado, secado y doblado de ropa?","sv":"Hur väl hanterar de tvätt, torkning och vikning av kläder?","fi":"Kuinka hyvin he hallitsevat pyykin pesemistä, kuivausta ja taittamista?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How independently do they carry out light household chores?', v_cat, 3,
       '{"es":"¿Con qué independencia realizan tareas domésticas ligeras?","sv":"Hur självständigt utför de lätta hushållssysslor?","fi":"Kuinka itsenäisesti he suorittavat kevyitä kotitöitä?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Finances & Paperwork';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they manage day-to-day financial transactions (cash, cards)?', v_cat, 1,
       '{"es":"¿Qué tan bien manejan las transacciones financieras del día a día?","sv":"Hur väl hanterar de dagliga finansiella transaktioner?","fi":"Kuinka hyvin he hallitsevat päivittäisiä rahatransaktioita?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they keep track of bills and recurring payments?', v_cat, 2,
       '{"es":"¿Qué tan bien llevan el control de facturas y pagos recurrentes?","sv":"Hur väl håller de koll på räkningar och återkommande betalningar?","fi":"Kuinka hyvin he pitävät kirjaa laskuista ja toistuvista maksuista?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they manage important documents and correspondence?', v_cat, 3,
       '{"es":"¿Qué tan bien manejan documentos importantes y correspondencia?","sv":"Hur väl hanterar de viktiga dokument och korrespondens?","fi":"Kuinka hyvin he hallitsevat tärkeitä asiakirjoja ja kirjeenvaihtoa?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Communication & Memory';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they communicate needs and feelings to others?', v_cat, 1,
       '{"es":"¿Qué tan bien comunican necesidades y sentimientos a otros?","sv":"Hur väl kommunicerar de behov och känslor till andra?","fi":"Kuinka hyvin he viestivät tarpeistaan ja tunteistaan muille?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they remember recent events and appointments?', v_cat, 2,
       '{"es":"¿Qué tan bien recuerdan eventos recientes y citas?","sv":"Hur väl minns de senaste händelser och möten?","fi":"Kuinka hyvin he muistavat viimeaikaiset tapahtumat ja tapaamiset?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they use the phone or other communication devices?', v_cat, 3,
       '{"es":"¿Qué tan bien usan el teléfono u otros dispositivos de comunicación?","sv":"Hur väl använder de telefon eller andra kommunikationsenheter?","fi":"Kuinka hyvin he käyttävät puhelinta tai muita viestintälaitteita?"}');
  END IF;

  SELECT id INTO v_cat FROM public.categories WHERE name = 'Transportation & Errands';
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 1) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How independently do they travel to familiar local destinations?', v_cat, 1,
       '{"es":"¿Con qué independencia viajan a destinos locales conocidos?","sv":"Hur självständigt reser de till välbekanta lokala destinationer?","fi":"Kuinka itsenäisesti he matkustavat tuttuihin lähikohteisiin?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 2) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How well do they manage routine errands (pharmacy, post office)?', v_cat, 2,
       '{"es":"¿Qué tan bien manejan los recados rutinarios (farmacia, correos)?","sv":"Hur väl hanterar de rutinärenden (apotek, postkontor)?","fi":"Kuinka hyvin he selviytyvät rutiiniasioinnista (apteekki, posti)?"}');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE category_id = v_cat AND sort_order = 3) THEN
    INSERT INTO public.questions (question_text, category_id, sort_order, translations) VALUES
      ('How safely do they navigate public transport or arrange rides?', v_cat, 3,
       '{"es":"¿Con qué seguridad navegan el transporte público o organizan viajes?","sv":"Hur säkert navigerar de kollektivtrafik eller ordnar skjuts?","fi":"Kuinka turvallisesti he käyttävät julkista liikennettä tai järjestävät kyydin?"}');
  END IF;

END $$;

GRANT SELECT ON public.legend TO authenticated;
GRANT SELECT ON public.categories TO authenticated;
GRANT SELECT ON public.questions TO authenticated;
