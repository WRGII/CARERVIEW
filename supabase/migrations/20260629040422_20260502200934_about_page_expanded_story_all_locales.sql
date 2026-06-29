/*
  # About Page — Propagate Expanded Story to All Locales

  Propagates all new and updated About page keys to the 6 non-English locales
  (es, it, fr, de, sv, fi). English text is used as a temporary fallback for
  new keys; existing locale translations for revised keys are updated to reflect
  the expanded three-feature story.

  ## Affected keys (all locales)
  - about.page_title, about.body_p1–p4, about.cta_button, about.cta_body (updates)
  - about.origin_heading, about.features_heading (new)
  - about.feature1_title/body, about.feature2_title/body, about.feature3_title/body (new)
*/

-- ─── SPANISH ──────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (key, locale, value) VALUES
  ('about.page_title',       'es', 'Acerca de CarerView'),
  ('about.body_p1',          'es', 'Cuidar a alguien que amas nunca es sencillo, especialmente cuando sus capacidades y necesidades cambian de formas difíciles de predecir. Nuestra familia vivió esto de primera mano durante siete años de desafíos relacionados con la demencia de nuestra madre. Cada día traía algo diferente. Lo que aprendimos fue que una sola observación nunca contaba la historia completa. La verdadera comprensión solo llegó al ver los patrones a lo largo del tiempo y al asegurarnos de que todos los involucrados en su cuidado trabajaran con la misma imagen.'),
  ('about.body_p2',          'es', 'Después de su fallecimiento, nos preguntamos qué habría facilitado ese camino, no solo para nosotros, sino para cada familia que recorre el mismo sendero. La respuesta siempre era la misma: claridad. Claridad sobre quién es realmente la persona. Claridad sobre qué cambia día a día. Y un punto de partida claro para las familias que de repente se encuentran responsables del cuidado de alguien sin ningún mapa. Esa reflexión se convirtió en la base de CarerView.'),
  ('about.body_p3',          'es', 'Juntas, estas tres herramientas abordan el estrés, la confusión y la pérdida de continuidad que agotan a los cuidadores familiares con el tiempo. Cuando un equipo de cuidado comparte el mismo punto de partida, el mismo registro de la persona y la misma imagen continua de cómo evolucionan las cosas, pueden brindar mejor atención, comunicarse con menos fricciones y llegar a las citas médicas con algo más útil que solo la memoria.'),
  ('about.body_p4',          'es', 'Nuestro objetivo es aliviar el estrés, el aislamiento y la sensación de agobio que tan a menudo acompañan al cuidado. Creemos que cuando los cuidadores tienen claridad, la persona a su cargo recibe una atención mejor, más consistente y más compasiva, y las familias pueden enfocarse más en lo que más importa: el tiempo juntos.'),
  ('about.cta_button',       'es', 'Comenzar'),
  ('about.cta_body',         'es', 'Únete a las familias que usan CarerView para navegar el cuidado con más claridad, más confianza y menos aislamiento. Comienza tu recorrido de Nuevo Cuidador, crea un Libro de Memorias y empieza a registrar observaciones, todo en un solo lugar.'),
  ('about.origin_heading',   'es', 'Cómo nació CarerView'),
  ('about.features_heading', 'es', 'Tres herramientas. Una imagen clara.'),
  ('about.feature1_title',   'es', 'Inicio para Nuevos Cuidadores'),
  ('about.feature1_body',    'es', 'Cuando te conviertes en cuidador familiar por primera vez, no hay un manual. La guía de CarerView para nuevos cuidadores te orienta sobre las decisiones clave, los contactos, los documentos y los arreglos de cuidado que necesitas tener en orden, para que nada importante se pierda en esas primeras semanas tan abrumadoras.'),
  ('about.feature2_title',   'es', 'Libro de Memorias'),
  ('about.feature2_body',    'es', 'Un registro vivo de la persona bajo cuidado: su identidad, historia de vida, preferencias diarias, antecedentes médicos y las rutinas que le importan. Cada familiar y cuidador profesional parte del mismo entendimiento de quién es esta persona, no solo de lo que dice su diagnóstico.'),
  ('about.feature3_title',   'es', 'Observaciones'),
  ('about.feature3_body',    'es', 'Registros estructurados diarios o semanales usando las mismas escalas AVD e AIVD que utilizan los profesionales de salud. Con el tiempo, las entradas individuales forman un registro de tendencias significativo que puedes compartir con un médico o equipo de cuidado para mostrar qué está cambiando realmente y cuándo comenzó.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ─── ITALIAN ──────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (key, locale, value) VALUES
  ('about.page_title',       'it', 'Chi siamo — CarerView'),
  ('about.body_p1',          'it', 'Prendersi cura di una persona cara non è mai semplice, soprattutto quando le sue capacità e i suoi bisogni cambiano in modi difficili da prevedere. La nostra famiglia ha vissuto tutto questo in prima persona durante sette anni di sfide legate alla demenza di nostra madre. Ogni giorno portava qualcosa di diverso. Ciò che abbiamo imparato è che una singola osservazione non raccontava mai la storia completa. La vera comprensione è arrivata solo vedendo i modelli nel tempo e assicurandoci che tutti coloro coinvolti nella sua cura lavorassero con la stessa visione.'),
  ('about.body_p2',          'it', 'Dopo la sua scomparsa, ci siamo chiesti cosa avrebbe reso quel percorso più facile, non solo per noi, ma per ogni famiglia che affronta lo stesso cammino. La risposta tornava sempre alla stessa cosa: chiarezza. Chiarezza su chi è davvero la persona. Chiarezza su cosa cambia giorno per giorno. E un punto di partenza chiaro per le famiglie che si trovano improvvisamente responsabili della cura di qualcuno senza una mappa. Quella riflessione è diventata il fondamento di CarerView.'),
  ('about.body_p3',          'it', 'Insieme, questi tre strumenti affrontano lo stress, la confusione e la perdita di continuità che logorano i caregiver familiari nel tempo. Quando un team di cura condivide lo stesso punto di partenza, lo stesso registro della persona e la stessa immagine continua di come le cose stanno cambiando, possono fornire cure migliori, comunicare con meno attrito e arrivare agli appuntamenti medici con qualcosa di più utile del solo ricordo.'),
  ('about.body_p4',          'it', 'Il nostro obiettivo è alleviare lo stress, l''isolamento e il senso di sopraffazione che così spesso accompagna la cura. Crediamo che quando i caregiver hanno chiarezza, la persona assistita riceva cure migliori, più coerenti e più compassionevoli, e le famiglie possano concentrarsi di più su ciò che conta davvero: il tempo insieme.'),
  ('about.cta_button',       'it', 'Inizia ora'),
  ('about.cta_body',         'it', 'Unisciti alle famiglie che usano CarerView per affrontare l''assistenza con più chiarezza, più fiducia e meno isolamento. Inizia il percorso per Nuovo Caregiver, costruisci un Libro dei Ricordi e inizia a registrare osservazioni, tutto in un unico posto.'),
  ('about.origin_heading',   'it', 'Come è nato CarerView'),
  ('about.features_heading', 'it', 'Tre strumenti. Un quadro chiaro.'),
  ('about.feature1_title',   'it', 'Guida per Nuovi Caregiver'),
  ('about.feature1_body',    'it', 'Quando diventi caregiver familiare per la prima volta, non esiste un manuale. La guida CarerView per nuovi caregiver ti accompagna attraverso le decisioni chiave, i contatti, i documenti e le disposizioni di cura da mettere in atto, così nulla di importante sfugge in quelle travolgenti prime settimane.'),
  ('about.feature2_title',   'it', 'Libro dei Ricordi'),
  ('about.feature2_body',    'it', 'Un registro vivo della persona assistita: identità, storia di vita, preferenze quotidiane, background medico e le routine che contano per lei. Ogni familiare e caregiver professionista parte dalla stessa comprensione di chi è questa persona, non solo di cosa dice la diagnosi.'),
  ('about.feature3_title',   'it', 'Osservazioni'),
  ('about.feature3_body',    'it', 'Check-in strutturati giornalieri o settimanali usando le stesse scale ADL e IADL utilizzate dai professionisti sanitari. Nel tempo, le singole voci formano un registro di tendenze significativo che puoi condividere con un medico o un team di cura per mostrare cosa sta davvero cambiando e quando è iniziato.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ─── FRENCH ───────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (key, locale, value) VALUES
  ('about.page_title',       'fr', 'À propos de CarerView'),
  ('about.body_p1',          'fr', 'Prendre soin d''un être cher n''est jamais simple, surtout lorsque ses capacités et ses besoins évoluent de façon imprévisible. Notre famille l''a vécu de près pendant sept ans de défis liés à la démence de notre mère. Chaque jour apportait quelque chose de différent. Ce que nous avons appris, c''est qu''une seule observation ne raconte jamais toute l''histoire. La vraie compréhension est venue en observant les tendances dans le temps et en veillant à ce que tous ceux impliqués dans ses soins travaillent à partir de la même image.'),
  ('about.body_p2',          'fr', 'Après sa disparition, nous nous sommes posé une question difficile : qu''est-ce qui aurait rendu ce parcours plus facile, non seulement pour nous, mais pour chaque famille qui emprunte le même chemin ? La réponse revenait toujours à la même chose : la clarté. Clarté sur qui est vraiment la personne. Clarté sur ce qui change jour après jour. Et un point de départ clair pour les familles qui se retrouvent soudainement responsables des soins de quelqu''un sans aucune carte. Cette réflexion est devenue le fondement de CarerView.'),
  ('about.body_p3',          'fr', 'Ensemble, ces trois outils répondent au stress, à la confusion et à la perte de continuité qui épuisent les aidants familiaux au fil du temps. Lorsqu''une équipe de soins partage le même point de départ, le même dossier de la personne et la même image continue de l''évolution des choses, elle peut prodiguer de meilleurs soins, communiquer avec moins de friction et arriver aux rendez-vous médicaux avec quelque chose de plus utile que la seule mémoire.'),
  ('about.body_p4',          'fr', 'Notre objectif est d''alléger le stress, l''isolement et le sentiment d''accablement qui accompagnent si souvent l''aidance. Nous croyons que lorsque les aidants ont de la clarté, la personne à leur charge reçoit de meilleurs soins, plus cohérents et plus compatissants, et les familles peuvent se concentrer davantage sur ce qui compte le plus : le temps ensemble.'),
  ('about.cta_button',       'fr', 'Commencer'),
  ('about.cta_body',         'fr', 'Rejoignez les familles qui utilisent CarerView pour naviguer dans l''aidance avec plus de clarté, de confiance et moins d''isolement. Démarrez votre parcours Nouveau Proche aidant, créez un Livre de Mémoire et commencez à enregistrer des observations, le tout en un seul endroit.'),
  ('about.origin_heading',   'fr', 'Les origines de CarerView'),
  ('about.features_heading', 'fr', 'Trois outils. Une image claire.'),
  ('about.feature1_title',   'fr', 'Démarrage pour nouveaux aidants'),
  ('about.feature1_body',    'fr', 'Lorsque vous devenez aidant familial pour la première fois, il n''existe pas de manuel. Le guide CarerView pour nouveaux aidants vous accompagne dans les décisions clés, les contacts, les documents et les arrangements de soins à mettre en place, afin que rien d''important ne passe entre les mailles du filet pendant ces premières semaines si difficiles.'),
  ('about.feature2_title',   'fr', 'Livre de Mémoire'),
  ('about.feature2_body',    'fr', 'Un dossier vivant de la personne aidée : son identité, son histoire de vie, ses préférences quotidiennes, ses antécédents médicaux et les routines qui comptent pour elle. Chaque membre de la famille et chaque aidant professionnel part de la même compréhension de qui est cette personne, pas seulement de ce que dit son diagnostic.'),
  ('about.feature3_title',   'fr', 'Observations'),
  ('about.feature3_body',    'fr', 'Des bilans structurés quotidiens ou hebdomadaires utilisant les mêmes échelles AVQ et AIVQ utilisées par les professionnels de santé. Avec le temps, les entrées individuelles forment un registre de tendances significatif que vous pouvez partager avec un médecin ou une équipe soignante pour montrer ce qui change réellement et quand cela a commencé.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ─── GERMAN ───────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (key, locale, value) VALUES
  ('about.page_title',       'de', 'Über CarerView'),
  ('about.body_p1',          'de', 'Für einen geliebten Menschen zu sorgen ist nie einfach – besonders wenn sich seine Fähigkeiten und Bedürfnisse auf schwer vorhersehbare Weise verändern. Unsere Familie hat dies aus erster Hand erlebt: sieben Jahre lang haben wir unsere Mutter durch demenzbezogene Herausforderungen begleitet. Jeder Tag brachte etwas Neues. Was wir gelernt haben: Eine einzelne Beobachtung erzählt nie die ganze Geschichte. Echtes Verstehen entstand erst durch das Erkennen von Mustern über die Zeit – und dadurch, dass alle Beteiligten das gleiche Bild vor Augen hatten.'),
  ('about.body_p2',          'de', 'Nach ihrem Tod stellten wir uns eine schwierige Frage: Was hätte diesen Weg leichter machen können – nicht nur für uns, sondern für jede Familie, die denselben Weg geht? Die Antwort kam immer wieder auf dasselbe hinaus: Klarheit. Klarheit darüber, wer die Person wirklich ist. Klarheit darüber, was sich von Tag zu Tag verändert. Und ein klarer Ausgangspunkt für Familien, die plötzlich für die Pflege eines anderen verantwortlich sind, ohne eine Landkarte zu haben. Diese Überlegung wurde zum Fundament von CarerView.'),
  ('about.body_p3',          'de', 'Gemeinsam adressieren diese drei Werkzeuge den Stress, die Verwirrung und den Verlust an Kontinuität, der pflegende Angehörige mit der Zeit zermürbt. Wenn ein Pflegeteam denselben Ausgangspunkt, dieselbe Aufzeichnung der Person und dasselbe laufende Bild davon teilt, wie sich die Dinge entwickeln, kann es bessere Pflege leisten, mit weniger Reibung kommunizieren und zu Arztterminen mit etwas Nützlicherem erscheinen als nur dem Gedächtnis.'),
  ('about.body_p4',          'de', 'Unser Ziel ist es, den Stress, die Isolation und die stille Überforderung zu lindern, die so häufig mit der Pflege einhergehen. Wir glauben, dass die Person im Mittelpunkt der Fürsorge bessere, beständigere und mitfühlendere Aufmerksamkeit erhält, wenn pflegende Angehörige Klarheit haben – und Familien sich mehr auf das Wesentliche konzentrieren können: die gemeinsame Zeit.'),
  ('about.cta_button',       'de', 'Jetzt starten'),
  ('about.cta_body',         'de', 'Schließe dich Familien an, die CarerView nutzen, um die Pflege mit mehr Klarheit, mehr Zuversicht und weniger Isolation zu meistern. Starte deine Reise als neue Pflegeperson, erstelle ein Erinnerungsbuch und beginne mit der Erfassung von Beobachtungen – alles an einem Ort.'),
  ('about.origin_heading',   'de', 'Wie CarerView entstanden ist'),
  ('about.features_heading', 'de', 'Drei Werkzeuge. Ein klares Bild.'),
  ('about.feature1_title',   'de', 'Start für neue Pflegepersonen'),
  ('about.feature1_body',    'de', 'Wenn man zum ersten Mal Pflegeperson in der Familie wird, gibt es kein Handbuch. Der CarerView-Leitfaden für neue Pflegepersonen führt dich durch die wichtigsten Entscheidungen, Kontakte, Dokumente und Pflegearrangements, die du treffen musst – damit in diesen überwältigenden ersten Wochen nichts Wichtiges verloren geht.'),
  ('about.feature2_title',   'de', 'Erinnerungsbuch'),
  ('about.feature2_body',    'de', 'Eine lebendige Aufzeichnung der gepflegten Person – ihre Identität, Lebensgeschichte, täglichen Vorlieben, medizinischen Hintergründe und die Routinen, die ihr wichtig sind. Jedes Familienmitglied und jede professionelle Pflegeperson startet mit demselben Verständnis davon, wer diese Person ist – nicht nur, was die Diagnose sagt.'),
  ('about.feature3_title',   'de', 'Beobachtungen'),
  ('about.feature3_body',    'de', 'Strukturierte tägliche oder wöchentliche Einträge mit denselben ADL- und IADL-Skalen, die von Gesundheitsfachkräften verwendet werden. Mit der Zeit formen einzelne Einträge einen aussagekräftigen Trendverlauf, den du mit einem Arzt oder Pflegeteam teilen kannst, um zu zeigen, was sich wirklich verändert und wann es begann.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ─── SWEDISH ──────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (key, locale, value) VALUES
  ('about.page_title',       'sv', 'Om CarerView'),
  ('about.body_p1',          'sv', 'Att vårda någon man älskar är aldrig enkelt – särskilt inte när deras förmågor och behov förändras på sätt som är svåra att förutse. Vår familj upplevde detta på nära håll under sju år av demensrelaterade utmaningar med vår mor. Varje dag förde med sig något nytt. Det vi lärde oss var att en enstaka observation aldrig berättade hela historien. Verklig förståelse kom bara genom att se mönster över tid – och genom att säkerställa att alla inblandade i hennes vård arbetade utifrån samma bild.'),
  ('about.body_p2',          'sv', 'Efter hennes bortgång ställde vi oss en svår fråga: vad skulle ha gjort den resan lättare – inte bara för oss, utan för varje familj som navigerar samma väg? Svaret var alltid detsamma: tydlighet. Tydlighet om vem personen verkligen är. Tydlighet om vad som förändras dag för dag. Och en tydlig startpunkt för familjer som plötsligt är ansvariga för någon annans vård utan någon karta att följa. Den reflektionen blev grunden för CarerView.'),
  ('about.body_p3',          'sv', 'Tillsammans tar dessa tre verktyg itu med den stress, förvirring och bristande kontinuitet som sliter ner familjevårdgivare med tiden. När ett vårdteam delar samma startpunkt, samma register över personen och samma löpande bild av hur saker förändras kan de ge bättre vård, kommunicera med mindre friktion och anlända till läkarbesök med något mer användbart än enbart minnet.'),
  ('about.body_p4',          'sv', 'Vårt mål är att lindra den stress, isolering och tysta överväldigning som så ofta följer med omsorgsgivande. Vi tror att när vårdgivare har tydlighet får den person som vårdas bättre, mer konsekvent och mer medkännande uppmärksamhet – och familjer kan fokusera mer på det som verkligen betyder mest: tid tillsammans.'),
  ('about.cta_button',       'sv', 'Kom igång'),
  ('about.cta_body',         'sv', 'Gå med i familjer som använder CarerView för att navigera omsorgen med mer tydlighet, mer självförtroende och mindre isolering. Starta din resa som ny omsorgsgivare, bygg en Minnesbok och börja registrera observationer – allt på ett ställe.'),
  ('about.origin_heading',   'sv', 'Hur CarerView kom till'),
  ('about.features_heading', 'sv', 'Tre verktyg. En tydlig bild.'),
  ('about.feature1_title',   'sv', 'Start för nya omsorgsgivare'),
  ('about.feature1_body',    'sv', 'När du för första gången blir familjevårdgivare finns det ingen handbok. CarerViews guide för nya omsorgsgivare leder dig genom de viktigaste besluten, kontakterna, dokumenten och vårdåtgärderna du behöver ha på plats – så att inget viktigt faller igenom sprickorna under de överväldigande första veckorna.'),
  ('about.feature2_title',   'sv', 'Minnesbok'),
  ('about.feature2_body',    'sv', 'Ett levande register över den person som vårdas – deras identitet, livshistoria, dagliga preferenser, medicinska bakgrund och de rutiner som är viktiga för dem. Varje familjemedlem och professionell vårdgivare utgår från samma förståelse av vem den här personen är, inte bara vad diagnosen säger.'),
  ('about.feature3_title',   'sv', 'Observationer'),
  ('about.feature3_body',    'sv', 'Strukturerade dagliga eller veckovisa registreringar med samma ADL- och IADL-skalor som används av vårdpersonal. Med tiden bildar enskilda poster ett meningsfullt trendregister som du kan dela med en läkare eller vårdteam för att visa vad som faktiskt förändras och när det började.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ─── FINNISH ──────────────────────────────────────────────────────────────────
INSERT INTO ui_translations (key, locale, value) VALUES
  ('about.page_title',       'fi', 'Tietoa CarerViewistä'),
  ('about.body_p1',          'fi', 'Rakkaan ihmisen hoitaminen ei ole koskaan yksinkertaista – varsinkaan silloin, kun hänen kykynsä ja tarpeensa muuttuvat ennakoimattomilla tavoilla. Perheemme koki tämän omakohtaisesti seitsemän vuoden ajan äitimme dementiaan liittyvien haasteiden myötä. Jokainen päivä toi jotain uutta. Opimme, että yksittäinen havainto ei koskaan kerro koko tarinaa. Todellinen ymmärrys syntyi vasta näkemällä kaavat ajan myötä – ja varmistamalla, että kaikki hänen hoitoonsa osallistuvat työskentelivät saman kuvan perusteella.'),
  ('about.body_p2',          'fi', 'Hänen poismenonsa jälkeen esitimme itsellemme vaikean kysymyksen: mikä olisi tehnyt tuon matkan helpommaksi – ei vain meille, vaan jokaiselle perheelle, joka kulkee samaa polkua? Vastaus palautui aina samaan asiaan: selkeyteen. Selkeyteen siitä, kuka henkilö todella on. Selkeyteen siitä, mitä muuttuu päivästä toiseen. Ja selkeään lähtökohtaan perheille, jotka yhtäkkiä ovat vastuussa jonkun toisen hoidosta ilman minkäänlaista karttaa. Tuo pohdinta muodosti CarerViewin perustan.'),
  ('about.body_p3',          'fi', 'Yhdessä nämä kolme työkalua vastaavat stressiin, sekaannukseen ja jatkuvuuden puutteeseen, jotka kuluttavat perhehoitajia ajan myötä. Kun hoitotiimi jakaa saman lähtökohdan, saman henkilörekisterin ja saman jatkuvan kuvan siitä, miten asiat muuttuvat, he voivat antaa parempaa hoitoa, kommunikoida vähemmällä kitkalla ja saapua lääkärikäynneille jotain hyödyllisempää kuin pelkän muistin kanssa.'),
  ('about.body_p4',          'fi', 'Tavoitteemme on lievittää stressiä, eristäytymistä ja hiljaista ylivoimaisuuden tunnetta, joka niin usein liittyy hoivaamiseen. Uskomme, että kun hoitajilla on selkeys, hoidettava henkilö saa parempaa, johdonmukaisempaa ja myötätuntoisempaa huomiota – ja perheet voivat keskittyä enemmän siihen, mikä on tärkeintä: yhteiseen aikaan.'),
  ('about.cta_button',       'fi', 'Aloita nyt'),
  ('about.cta_body',         'fi', 'Liity perheisiin, jotka käyttävät CarerViewiä hoivan navigoimiseen suuremmalla selkeydellä, enemmällä luottamuksella ja vähemmällä eristäytymisellä. Aloita Uuden Hoitajan matkasi, luo Muistokirja ja aloita havaintojen kirjaaminen – kaikki yhdessä paikassa.'),
  ('about.origin_heading',   'fi', 'Miten CarerView syntyi'),
  ('about.features_heading', 'fi', 'Kolme työkalua. Yksi selkeä kuva.'),
  ('about.feature1_title',   'fi', 'Aloitus uusille hoitajille'),
  ('about.feature1_body',    'fi', 'Kun ryhdyt perhehoitajaksi ensimmäistä kertaa, ei ole käsikirjaa. CarerViewin opas uusille hoitajille ohjaa sinut tärkeimpien päätösten, yhteystietojen, asiakirjojen ja hoitojärjestelyjen läpi, jotka sinun täytyy saada kuntoon – jotta mitään tärkeää ei jää huomaamatta niiden ylivoimaisten ensimmäisten viikkojen aikana.'),
  ('about.feature2_title',   'fi', 'Muistokirja'),
  ('about.feature2_body',    'fi', 'Elävä rekisteri hoidettavasta henkilöstä – hänen identiteettinsä, elämänhistoriansa, päivittäiset mieltymyksensä, lääketieteellinen taustansa ja hänelle tärkeät rutiinit. Jokainen perheenjäsen ja ammattimainen hoitaja lähtee samasta ymmärryksestä siitä, kuka tämä henkilö on – ei vain siitä, mitä diagnoosi sanoo.'),
  ('about.feature3_title',   'fi', 'Havainnot'),
  ('about.feature3_body',    'fi', 'Rakenteelliset päivittäiset tai viikoittaiset kirjaukset käyttäen samoja ADL- ja IADL-asteikkoja, joita terveydenhuollon ammattilaiset käyttävät. Ajan myötä yksittäiset merkinnät muodostavat merkityksellisen trendiseurannan, jonka voit jakaa lääkärin tai hoitotiimin kanssa osoittaaksesi, mitä todella muuttuu ja milloin se alkoi.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();