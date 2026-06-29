/*
  # Memory Book Landing Page Translations

  ## Summary
  Adds marketing copy translation keys for the new Memory Book feature section
  on the landing page, seeded for all 7 supported locales:
  English (en), Spanish (es), Italian (it), French (fr), German (de),
  Swedish (sv), Finnish (fi).

  ## New Keys (12 keys × 7 locales = 84 rows)
  - landing.mb_eyebrow        — Section eyebrow label
  - landing.mb_title          — Main headline
  - landing.mb_body           — Intro paragraph
  - landing.mb_identity_title — Identity card title
  - landing.mb_identity_body  — Identity card description
  - landing.mb_contacts_title — Contacts card title
  - landing.mb_contacts_body  — Contacts card description
  - landing.mb_medical_title  — Medical card title
  - landing.mb_medical_body   — Medical card description
  - landing.mb_prefs_title    — Preferences card title
  - landing.mb_prefs_body     — Preferences card description
  - landing.mb_access_note    — Owner/member access note
  - landing.mb_cta            — Call-to-action button label

  ## Notes
  - Uses ON CONFLICT DO UPDATE so this is safe to re-run
  - All values are human-translated approximations (not machine-translated)
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- ENGLISH
('en', 'landing.mb_eyebrow', 'Memory Book'),
('en', 'landing.mb_title', 'Everything a caregiver needs to know — in one place'),
('en', 'landing.mb_body', 'When a new caregiver steps in, the first few hours shouldn''t be spent asking questions. The Memory Book is a living care profile for your loved one — covering who they are, who to call, what to watch for, and what makes them feel at home.'),
('en', 'landing.mb_identity_title', 'Identity & Personal Profile'),
('en', 'landing.mb_identity_body', 'Capture preferred name, cultural background, languages spoken, and a personal summary so every caregiver understands who they''re caring for — not just a name on a chart.'),
('en', 'landing.mb_contacts_title', 'Care Network & Contacts'),
('en', 'landing.mb_contacts_body', 'Store family members, doctors, neighbours, and emergency contacts in one place, each with their role, phone, email, and any relevant notes. No more searching for numbers.'),
('en', 'landing.mb_medical_title', 'Medical Context'),
('en', 'landing.mb_medical_body', 'Document key conditions, allergies, hearing and vision notes, and current medications so caregivers can provide safe, informed care from day one.'),
('en', 'landing.mb_prefs_title', 'Likes, Dislikes & Comforts'),
('en', 'landing.mb_prefs_body', 'Record what brings joy, what to avoid, favourite foods, music, conversation topics, and what soothes them when upset. The details that make all the difference.'),
('en', 'landing.mb_access_note', 'Team owners build the Memory Book. All invited team members can view it instantly — no setup needed.'),
('en', 'landing.mb_cta', 'Build Your Loved One''s Memory Book'),

-- SPANISH
('es', 'landing.mb_eyebrow', 'Libro de Memoria'),
('es', 'landing.mb_title', 'Todo lo que un cuidador necesita saber — en un solo lugar'),
('es', 'landing.mb_body', 'Cuando un nuevo cuidador llega, las primeras horas no deberían perderse haciendo preguntas. El Libro de Memoria es un perfil de cuidado vivo para tu ser querido — abarca quiénes son, a quién llamar, qué vigilar y qué les hace sentir como en casa.'),
('es', 'landing.mb_identity_title', 'Identidad y Perfil Personal'),
('es', 'landing.mb_identity_body', 'Registra el nombre preferido, el trasfondo cultural, los idiomas que habla y un resumen personal para que cada cuidador entienda a quién cuida — no solo un nombre en una ficha.'),
('es', 'landing.mb_contacts_title', 'Red de Cuidado y Contactos'),
('es', 'landing.mb_contacts_body', 'Almacena familiares, médicos, vecinos y contactos de emergencia en un solo lugar, cada uno con su función, teléfono, correo electrónico y notas relevantes. Sin más búsqueda de números.'),
('es', 'landing.mb_medical_title', 'Contexto Médico'),
('es', 'landing.mb_medical_body', 'Documenta condiciones clave, alergias, notas sobre audición y visión, y medicamentos actuales para que los cuidadores puedan brindar una atención segura e informada desde el primer día.'),
('es', 'landing.mb_prefs_title', 'Gustos, Disgustos y Consuelos'),
('es', 'landing.mb_prefs_body', 'Registra qué trae alegría, qué evitar, comidas favoritas, música, temas de conversación y qué les calma cuando están alterados. Los detalles que marcan la diferencia.'),
('es', 'landing.mb_access_note', 'Los propietarios del equipo crean el Libro de Memoria. Todos los miembros invitados pueden verlo al instante — sin configuración adicional.'),
('es', 'landing.mb_cta', 'Crea el Libro de Memoria de tu Ser Querido'),

-- ITALIAN
('it', 'landing.mb_eyebrow', 'Libro dei Ricordi'),
('it', 'landing.mb_title', 'Tutto ciò che un caregiver deve sapere — in un unico posto'),
('it', 'landing.mb_body', 'Quando arriva un nuovo caregiver, le prime ore non dovrebbero essere spese a fare domande. Il Libro dei Ricordi è un profilo di cura attivo per il tuo caro — copre chi è, chi chiamare, cosa monitorare e cosa lo fa sentire a casa.'),
('it', 'landing.mb_identity_title', 'Identità e Profilo Personale'),
('it', 'landing.mb_identity_body', 'Registra il nome preferito, il background culturale, le lingue parlate e un riassunto personale affinché ogni caregiver capisca chi sta curando — non solo un nome su una scheda.'),
('it', 'landing.mb_contacts_title', 'Rete di Cura e Contatti'),
('it', 'landing.mb_contacts_body', 'Archivia familiari, medici, vicini e contatti di emergenza in un unico posto, ognuno con il proprio ruolo, telefono, email e note pertinenti. Nessuna ricerca di numeri.'),
('it', 'landing.mb_medical_title', 'Contesto Medico'),
('it', 'landing.mb_medical_body', 'Documenta le condizioni principali, le allergie, le note su udito e vista e i farmaci attuali affinché i caregiver possano fornire cure sicure e consapevoli fin dal primo giorno.'),
('it', 'landing.mb_prefs_title', 'Piaceri, Dispiaceri e Conforto'),
('it', 'landing.mb_prefs_body', 'Registra cosa porta gioia, cosa evitare, cibi preferiti, musica, argomenti di conversazione e cosa li calma quando sono agitati. I dettagli che fanno la differenza.'),
('it', 'landing.mb_access_note', 'I proprietari del team creano il Libro dei Ricordi. Tutti i membri del team invitati possono visualizzarlo immediatamente — senza configurazione.'),
('it', 'landing.mb_cta', 'Crea il Libro dei Ricordi del tuo Caro'),

-- FRENCH
('fr', 'landing.mb_eyebrow', 'Livre de Mémoire'),
('fr', 'landing.mb_title', 'Tout ce qu''un aidant doit savoir — au même endroit'),
('fr', 'landing.mb_body', 'Lorsqu''un nouvel aidant arrive, les premières heures ne devraient pas être consacrées à poser des questions. Le Livre de Mémoire est un profil de soins vivant pour votre proche — il couvre qui il est, qui appeler, quoi surveiller et ce qui le met à l''aise.'),
('fr', 'landing.mb_identity_title', 'Identité et Profil Personnel'),
('fr', 'landing.mb_identity_body', 'Notez le prénom préféré, l''arrière-plan culturel, les langues parlées et un résumé personnel afin que chaque aidant comprenne qui il prend en charge — pas seulement un nom sur une fiche.'),
('fr', 'landing.mb_contacts_title', 'Réseau de Soins et Contacts'),
('fr', 'landing.mb_contacts_body', 'Stockez les membres de la famille, les médecins, les voisins et les contacts d''urgence en un seul endroit, chacun avec son rôle, son téléphone, son email et toute note pertinente. Fini de chercher des numéros.'),
('fr', 'landing.mb_medical_title', 'Contexte Médical'),
('fr', 'landing.mb_medical_body', 'Documentez les principales conditions, les allergies, les notes sur l''ouïe et la vue, et les médicaments actuels pour que les aidants puissent prodiguer des soins sûrs et éclairés dès le premier jour.'),
('fr', 'landing.mb_prefs_title', 'Goûts, Dégoûts et Réconforts'),
('fr', 'landing.mb_prefs_body', 'Notez ce qui apporte de la joie, ce qu''il faut éviter, les aliments préférés, la musique, les sujets de conversation et ce qui les apaise quand ils sont contrariés. Les détails qui font toute la différence.'),
('fr', 'landing.mb_access_note', 'Les propriétaires de l''équipe créent le Livre de Mémoire. Tous les membres invités peuvent le consulter instantanément — sans configuration nécessaire.'),
('fr', 'landing.mb_cta', 'Créez le Livre de Mémoire de votre Proche'),

-- GERMAN
('de', 'landing.mb_eyebrow', 'Erinnerungsbuch'),
('de', 'landing.mb_title', 'Alles, was eine Pflegeperson wissen muss — an einem Ort'),
('de', 'landing.mb_body', 'Wenn eine neue Pflegeperson beginnt, sollten die ersten Stunden nicht damit verbracht werden, Fragen zu stellen. Das Erinnerungsbuch ist ein lebendiges Pflegeprofil für Ihren Angehörigen — es umfasst, wer sie sind, wen man anrufen soll, worauf man achten muss und was ihnen ein Heimgefühl gibt.'),
('de', 'landing.mb_identity_title', 'Identität & Persönliches Profil'),
('de', 'landing.mb_identity_body', 'Erfassen Sie den bevorzugten Namen, kulturellen Hintergrund, gesprochene Sprachen und eine persönliche Zusammenfassung, damit jede Pflegeperson versteht, wen sie betreut — nicht nur ein Name auf einem Blatt.'),
('de', 'landing.mb_contacts_title', 'Pflegenetzwerk & Kontakte'),
('de', 'landing.mb_contacts_body', 'Speichern Sie Familienmitglieder, Ärzte, Nachbarn und Notfallkontakte an einem Ort, jeweils mit ihrer Rolle, Telefon, E-Mail und relevanten Notizen. Kein Suchen nach Nummern mehr.'),
('de', 'landing.mb_medical_title', 'Medizinischer Kontext'),
('de', 'landing.mb_medical_body', 'Dokumentieren Sie wichtige Erkrankungen, Allergien, Hör- und Sehhinweise sowie aktuelle Medikamente, damit Pflegepersonen vom ersten Tag an sichere und fundierte Pflege leisten können.'),
('de', 'landing.mb_prefs_title', 'Vorlieben, Abneigungen & Trost'),
('de', 'landing.mb_prefs_body', 'Halten Sie fest, was Freude bereitet, was zu vermeiden ist, Lieblingsessen, Musik, Gesprächsthemen und was sie beruhigt, wenn sie aufgewühlt sind. Die Details, die den Unterschied machen.'),
('de', 'landing.mb_access_note', 'Teambesitzer erstellen das Erinnerungsbuch. Alle eingeladenen Teammitglieder können es sofort einsehen — ohne Einrichtung erforderlich.'),
('de', 'landing.mb_cta', 'Erstellen Sie das Erinnerungsbuch Ihres Angehörigen'),

-- SWEDISH
('sv', 'landing.mb_eyebrow', 'Minnesbok'),
('sv', 'landing.mb_title', 'Allt en vårdgivare behöver veta — på ett ställe'),
('sv', 'landing.mb_body', 'När en ny vårdgivare börjar bör de första timmarna inte gå åt till att ställa frågor. Minnesboken är en levande omsorgsprofil för din närstående — den täcker vem de är, vem man ska ringa, vad man ska bevaka och vad som får dem att känna sig hemma.'),
('sv', 'landing.mb_identity_title', 'Identitet & Personlig Profil'),
('sv', 'landing.mb_identity_body', 'Registrera önskat namn, kulturell bakgrund, talade språk och en personlig sammanfattning så att varje vårdgivare förstår vem de tar hand om — inte bara ett namn på ett papper.'),
('sv', 'landing.mb_contacts_title', 'Omsorgsnätverk & Kontakter'),
('sv', 'landing.mb_contacts_body', 'Lagra familjemedlemmar, läkare, grannar och nödkontakter på ett ställe, var och en med sin roll, telefon, e-post och relevanta anteckningar. Aldrig mer letande efter nummer.'),
('sv', 'landing.mb_medical_title', 'Medicinsk Kontext'),
('sv', 'landing.mb_medical_body', 'Dokumentera viktiga tillstånd, allergier, hörsel- och synanteckningar samt aktuella läkemedel så att vårdgivare kan ge säker och välgrundad vård från dag ett.'),
('sv', 'landing.mb_prefs_title', 'Gillar, Ogillar & Tröst'),
('sv', 'landing.mb_prefs_body', 'Notera vad som ger glädje, vad som ska undvikas, favoritmat, musik, samtalsämnen och vad som lugnar dem när de är upprörda. Detaljerna som gör hela skillnaden.'),
('sv', 'landing.mb_access_note', 'Teamägare skapar Minnesboken. Alla inbjudna teammedlemmar kan se den direkt — ingen inställning behövs.'),
('sv', 'landing.mb_cta', 'Skapa din Närståendes Minnesbok'),

-- FINNISH
('fi', 'landing.mb_eyebrow', 'Muistokirja'),
('fi', 'landing.mb_title', 'Kaikki mitä hoitaja tarvitsee tietää — yhdessä paikassa'),
('fi', 'landing.mb_body', 'Kun uusi hoitaja aloittaa, ensimmäisiä tunteja ei pitäisi kuluttaa kysymysten esittämiseen. Muistokirja on läheisesi elävä hoitoprofiili — se kattaa kuka hän on, ketä soittaa, mitä tarkkailla ja mikä saa heidät tuntemaan olonsa kotoisaksi.'),
('fi', 'landing.mb_identity_title', 'Henkilöllisyys ja Henkilökohtainen Profiili'),
('fi', 'landing.mb_identity_body', 'Kirjaa kutsumanimet, kulttuuritausta, puhutut kielet ja henkilökohtainen yhteenveto, jotta jokainen hoitaja ymmärtää kenen hoidossa on — ei pelkästään nimi kortistossa.'),
('fi', 'landing.mb_contacts_title', 'Hoitoverkosto ja Yhteystiedot'),
('fi', 'landing.mb_contacts_body', 'Tallenna perheenjäsenet, lääkärit, naapurit ja hätäyhteystiedot yhteen paikkaan, kukin roolinsa, puhelinnumeronsa, sähköpostinsa ja oleellisten muistiinpanojen kera. Ei enää numeroiden etsintää.'),
('fi', 'landing.mb_medical_title', 'Lääketieteellinen Konteksti'),
('fi', 'landing.mb_medical_body', 'Dokumentoi keskeiset sairaudet, allergiat, kuulo- ja näköhuomiot sekä nykyiset lääkitykset, jotta hoitajat voivat tarjota turvallista ja tietoon perustuvaa hoitoa heti ensimmäisestä päivästä.'),
('fi', 'landing.mb_prefs_title', 'Mieltymykset, Epämiellymykset ja Lohdutus'),
('fi', 'landing.mb_prefs_body', 'Kirjaa mikä tuo iloa, mitä välttää, lempiruoat, musiikki, keskusteluaiheet ja mikä rauhoittaa heitä kun he ovat järkyttyneitä. Yksityiskohdat, jotka tekevät kaiken eron.'),
('fi', 'landing.mb_access_note', 'Tiimin omistajat rakentavat Muistokirjan. Kaikki kutsutut tiimin jäsenet voivat katsella sitä välittömästi — ei asetuksia tarvita.'),
('fi', 'landing.mb_cta', 'Luo läheisesi Muistokirja')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
