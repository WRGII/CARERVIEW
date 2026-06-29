/*
  # Policy Pages: GDPR Content Translations — German, Swedish, Finnish

  Adds complete translated body text for both policy pages in de, sv, fi locales.
  Uses INSERT ... ON CONFLICT DO NOTHING for idempotency.
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- ============================================================
-- GERMAN (de)
-- ============================================================
  ('de', 'policy.priv_notice',
   'Diese Datenschutzrichtlinie erklärt, wie CarerView (betrieben von GrifDigi Ltd) Ihre personenbezogenen Daten bei der Nutzung unseres Dienstes erhebt, verwendet, speichert und schützt. Sie wird in Übereinstimmung mit der UK DSGVO und dem Data Protection Act 2018 herausgegeben. GrifDigi Ltd handelt als Verantwortlicher für die von Ihnen bereitgestellten personenbezogenen Daten. Bei Fragen wenden Sie sich bitte an CarerView@GrifDigi.com.'),

  ('de', 'policy.priv_s1_body',
   'Wir erheben die folgenden Kategorien personenbezogener Daten: (a) Kontodaten — Ihr Name, Ihre E-Mail-Adresse und Ihr Passwort bei der Registrierung; (b) Pflegebeobachtungsdaten — strukturierte Beobachtungen, Notizen, Bewertungen und Einschätzungen, die Sie über die von Ihnen betreute Person eingeben; (c) Team- und Profildaten — Informationen über Pflegepersonen und Pflegebedürftige, die Ihrem Konto zugeordnet sind; (d) Nutzungs- und technische Daten — IP-Adresse, Browsertyp, Gerätekennungen und Protokolldaten, die automatisch erhoben werden. Unsere Rechtsgrundlagen sind: Vertragserfüllung; berechtigte Interessen; und, wenn gesundheitsbezogene Daten eingegeben werden, Ihre ausdrückliche Einwilligung gemäß Artikel 9 UK DSGVO.'),

  ('de', 'policy.priv_s2_body',
   'Wir verwenden Ihre personenbezogenen Daten, um: (a) Ihr Konto zu erstellen und zu verwalten sowie Ihre Identität zu authentifizieren; (b) den CarerView-Dienst bereitzustellen; (c) Transaktionskommunikationen wie Kontobestätigungen, Passwort-Resets und Abonnementbenachrichtigungen zu versenden; (d) Zahlungen sicher über Stripe zu verarbeiten; (e) die Dienstleistungsperformance zu überwachen und zu verbessern; (f) unseren rechtlichen Verpflichtungen nachzukommen. Wir verwenden Ihre Daten nicht für automatisierte Entscheidungsfindung mit erheblichen rechtlichen Auswirkungen.'),

  ('de', 'policy.priv_s3_body',
   'Ihre Daten werden auf der Infrastruktur von Supabase, Inc. gespeichert, gehostet in Amazon Web Services (AWS)-Rechenzentren im Europäischen Wirtschaftsraum und im Vereinigten Königreich. Alle Daten werden während der Übertragung mit TLS 1.2 oder höher und im Ruhezustand mit AES-256 verschlüsselt. Bei einer Verletzung personenbezogener Daten, die wahrscheinlich ein Risiko für Ihre Rechte und Freiheiten darstellt, werden wir die zuständige Aufsichtsbehörde innerhalb von 72 Stunden benachrichtigen und Sie unverzüglich informieren, soweit gesetzlich vorgeschrieben.'),

  ('de', 'policy.priv_s4_body',
   'Gemäß UK DSGVO haben Sie folgende Rechte: (a) Auskunftsrecht; (b) Recht auf Berichtigung; (c) Recht auf Löschung; (d) Recht auf Einschränkung der Verarbeitung; (e) Recht auf Datenübertragbarkeit; (f) Widerspruchsrecht; (g) Rechte bezüglich automatisierter Entscheidungsfindung. Zur Ausübung dieser Rechte wenden Sie sich bitte an CarerView@GrifDigi.com. Sie haben außerdem das Recht, eine Beschwerde bei der zuständigen Datenschutzbehörde einzureichen.'),

  ('de', 'policy.priv_s5_title', 'Cookies'),

  ('de', 'policy.priv_s5_body',
   'CarerView verwendet keine Tracking-, Werbe- oder Analyse-Cookies. Wir setzen keine Drittanbieter-Cookies auf Ihrem Gerät. Unser Authentifizierungsdienst kann streng notwendige Sitzungs-Cookies ausschließlich zur Aufrechterhaltung Ihrer aktiven Sitzung setzen; diese werden beim Schließen des Browsers oder beim Abmelden gelöscht. Über Cookies werden keine personenbezogenen Daten an Dritte übertragen.'),

  ('de', 'policy.data_notice',
   'Diese Datenrichtlinie erklärt, wie CarerView die von Ihnen in die Anwendung eingegebenen Pflegedaten verarbeitet. Sie behalten jederzeit das Eigentum an diesen Daten. CarerView handelt als Auftragsverarbeiter in Ihrem Namen und wird Ihre Pflegedaten niemals für andere Zwecke als die Erbringung des abonnierten Dienstes verwenden. Diese Richtlinie sollte zusammen mit unserer Datenschutzrichtlinie gelesen werden.'),

  ('de', 'policy.data_s1_body',
   'Die Pflegedaten, die Sie in CarerView erstellen — einschließlich täglicher Beobachtungen, Aktivitätswertungen, Notizen und aller personenbezogenen oder medizinischen Informationen, die Sie über den Pflegebedürftigen erfassen — gehören Ihnen. Sie sind der Verantwortliche für diesen Inhalt; CarerView verarbeitet ihn ausschließlich auf Ihre Anweisung. Sofern Pflegedaten Gesundheit oder Behinderung betreffen, werden sie als besondere Kategorien personenbezogener Daten behandelt und durch zusätzliche technische Schutzmaßnahmen gesichert.'),

  ('de', 'policy.data_s2_body',
   'CarerView wird Ihre Pflegedaten niemals an Dritte verkaufen, vermieten oder lizenzieren. Wir geben Ihre Pflegedaten nur weiter: (a) an Unterauftragsverarbeiter, die für die Erbringung des Dienstes zwingend erforderlich sind, unter verbindlichen Datenverarbeitungsverträgen; (b) wenn Sie anderen Teammitgliedern ausdrücklich Zugang gewährt haben; oder (c) wenn wir gesetzlich dazu verpflichtet sind. Wir können vollständig anonymisierte, aggregierte statistische Daten ausschließlich zur internen Dienstverbesserung nutzen.'),

  ('de', 'policy.data_s3_body',
   'Ihre Pflegedaten werden für die Dauer Ihrer aktiven CarerView-Kontonutzung gespeichert. Bei Kontolöschung werden alle zugehörigen Pflegedaten innerhalb von 30 Tagen nach Kontoschließung dauerhaft gelöscht, sofern keine gesetzliche Aufbewahrungspflicht besteht. Sicherungskopien werden in einem rollierenden 30-Tage-Zyklus bereinigt.'),

  ('de', 'policy.data_s4_body',
   'Sie haben das Recht auf eine vollständige, portable Kopie aller in CarerView eingegebenen Pflegedaten. Sie können jederzeit über die Kontoeinstellungen einen vollständigen Export im DOCX-Format generieren und herunterladen. Es gibt keine Häufigkeitsbeschränkung und es fallen keine Gebühren an. Für Unterstützung wenden Sie sich an CarerView@GrifDigi.com.'),

  ('de', 'policy.data_s5_body',
   'CarerView ist ein Werkzeug zur Pflegebeobachtung und Dokumentation. Es ist kein zugelassenes Medizinprodukt, kein klinisches Entscheidungsunterstützungssystem und kein diagnostisches Instrument. Die in CarerView erfassten Informationen spiegeln Beobachtungen von Pflegepersonen wider und dürfen nicht als klinische Beurteilungen oder medizinische Diagnosen interpretiert werden. Nichts in CarerView stellt einen medizinischen Rat dar. Wenden Sie sich stets an einen qualifizierten Gesundheitsfachmann.'),

-- ============================================================
-- SWEDISH (sv)
-- ============================================================
  ('sv', 'policy.priv_notice',
   'Denna integritetspolicy förklarar hur CarerView (drivet av GrifDigi Ltd) samlar in, använder, lagrar och skyddar dina personuppgifter när du använder vår tjänst. Den utfärdas i enlighet med UK GDPR och Data Protection Act 2018. GrifDigi Ltd är personuppgiftsansvarig för de personuppgifter du lämnar till oss. Har du frågor om denna policy, kontakta oss på CarerView@GrifDigi.com.'),

  ('sv', 'policy.priv_s1_body',
   'Vi samlar in följande kategorier av personuppgifter: (a) Kontouppgifter — ditt namn, e-postadress och lösenord vid registrering; (b) Omsorgsdata — strukturerade observationer, anteckningar, poäng och bedömningar som du registrerar om den person du vårdar; (c) Team- och profildata — information om vårdgivare och vårdbehövande kopplade till ditt konto; (d) Användnings- och tekniska uppgifter — IP-adress, webbläsartyp, enhetsidentifierare och loggdata som samlas in automatiskt. Våra rättsliga grunder är: fullgörande av avtal; berättigade intressen; och, när hälsouppgifter registreras, ditt uttryckliga samtycke enligt Artikel 9 UK GDPR.'),

  ('sv', 'policy.priv_s2_body',
   'Vi använder dina personuppgifter för att: (a) skapa och hantera ditt konto och autentisera din identitet; (b) tillhandahålla CarerView-tjänsten; (c) skicka transaktionskommunikation såsom kontobekräftelser, lösenordsåterställningar och prenumerationsmeddelanden; (d) behandla betalningar säkert via Stripe; (e) övervaka och förbättra tjänstens prestanda; (f) uppfylla våra rättsliga skyldigheter. Vi använder inte dina uppgifter för automatiserat beslutsfattande med betydande rättsliga effekter.'),

  ('sv', 'policy.priv_s3_body',
   'Dina uppgifter lagras på infrastruktur tillhandahållen av Supabase, Inc., som drifts på Amazon Web Services (AWS) datacenter inom Europeiska ekonomiska samarbetsområdet och Storbritannien. All data krypteras under överföring med TLS 1.2 eller högre och i vila med AES-256. Vid ett personuppgiftsincident som sannolikt innebär en risk för dina rättigheter och friheter kommer vi att anmäla detta till behörig tillsynsmyndighet inom 72 timmar och informera dig utan onödigt dröjsmål när lagen kräver det.'),

  ('sv', 'policy.priv_s4_body',
   'Enligt UK GDPR har du följande rättigheter: (a) Rätt till tillgång; (b) Rätt till rättelse; (c) Rätt till radering; (d) Rätt till begränsning av behandling; (e) Rätt till dataportabilitet; (f) Rätt att invända; (g) Rättigheter avseende automatiserat beslutsfattande. Kontakta oss på CarerView@GrifDigi.com för att utöva dina rättigheter. Du har även rätt att lämna in ett klagomål till behörig dataskyddsmyndighet.'),

  ('sv', 'policy.priv_s5_title', 'Kakor (cookies)'),

  ('sv', 'policy.priv_s5_body',
   'CarerView använder inga spårnings-, reklam- eller analyskookies. Vi placerar inga tredjepartscookies på din enhet. Vår autentiseringstjänst kan sätta strikt nödvändiga sessionscookies enbart för att upprätthålla din aktiva session; dessa raderas när du stänger webbläsaren eller loggar ut. Inga personuppgifter överförs till tredje part via cookies.'),

  ('sv', 'policy.data_notice',
   'Denna datapolicy förklarar hur CarerView hanterar den omsorgsdata du registrerar i applikationen. Du behåller äganderätten till dessa uppgifter hela tiden. CarerView agerar som personuppgiftsbiträde för din räkning och kommer aldrig att använda din omsorgsdata för något annat ändamål än att tillhandahålla tjänsten du prenumererar på. Denna policy bör läsas tillsammans med vår integritetspolicy.'),

  ('sv', 'policy.data_s1_body',
   'Den omsorgsdata du skapar i CarerView — inklusive dagliga observationer, aktivitetspoäng, anteckningar och all personlig eller medicinsk information du väljer att registrera om den vårdbehövande — tillhör dig. Du är personuppgiftsansvarig för detta innehåll; CarerView behandlar det enbart på dina instruktioner. Där omsorgsdata rör hälsa eller funktionsnedsättning behandlas de som särskilda kategorier av personuppgifter med ytterligare tekniska skyddsåtgärder.'),

  ('sv', 'policy.data_s2_body',
   'CarerView kommer aldrig att sälja, hyra ut eller licensiera din omsorgsdata till tredje part. Vi delar inte din omsorgsdata med externa organisationer förutom: (a) med underbiträden som är strikt nödvändiga för tjänsteleveransen, under bindande personuppgiftsbiträdesavtal; (b) när du uttryckligen beviljat åtkomst för andra teammedlemmar; eller (c) när vi är rättsligt skyldiga att göra det. Vi kan använda helt anonymiserade, aggregerade statistiska uppgifter uteslutande för intern tjänsteförbättring.'),

  ('sv', 'policy.data_s3_body',
   'Din omsorgsdata sparas så länge ditt CarerView-konto är aktivt. Om du tar bort ditt konto raderar vi permanent all tillhörande omsorgsdata inom 30 dagar efter kontoavstängning, om det inte finns rättsliga skyldigheter att behålla viss information längre. Säkerhetskopior rensas i en rullande 30-dagarscykel.'),

  ('sv', 'policy.data_s4_body',
   'Du har rätt till en fullständig, portabel kopia av all omsorgsdata du registrerat i CarerView. Du kan när som helst generera och ladda ner en fullständig export från kontoinställningarna i DOCX-format. Det finns ingen frekvensgräns och ingen avgift. Kontakta CarerView@GrifDigi.com om du behöver hjälp.'),

  ('sv', 'policy.data_s5_body',
   'CarerView är ett verktyg för omsorgsobservation och journalföring. Det är inte en registrerad medicinteknisk produkt, ett kliniskt beslutsstödsystem eller ett diagnostiskt instrument. Information som registreras i CarerView återspeglar observationer gjorda av vårdgivare och ska inte tolkas som kliniska bedömningar eller medicinska diagnoser. Ingenting i CarerView utgör medicinsk rådgivning. Rådfråga alltid en kvalificerad sjukvårdspersonal.'),

-- ============================================================
-- FINNISH (fi)
-- ============================================================
  ('fi', 'policy.priv_notice',
   'Tässä tietosuojakäytännössä selitetään, miten CarerView (jota hallinnoi GrifDigi Ltd) kerää, käyttää, säilyttää ja suojaa henkilötietojasi palvelun käytön yhteydessä. Se on laadittu Yhdistyneen kuningaskunnan GDPR:n ja Data Protection Act 2018 -lain mukaisesti. GrifDigi Ltd toimii rekisterinpitäjänä sinulta saamiemme henkilötietojen osalta. Mikäli sinulla on kysymyksiä, ota yhteyttä osoitteeseen CarerView@GrifDigi.com.'),

  ('fi', 'policy.priv_s1_body',
   'Keräämme seuraavat henkilötietoluokat: (a) Tilitiedot — nimesi, sähköpostiosoitteesi ja salasanasi rekisteröitymisen yhteydessä; (b) Hoitohavainnot — jäsennellyt havainnot, muistiinpanot, pisteet ja arvioinnit, jotka syötät hoidettavasta henkilöstä; (c) Tiimi- ja profiiditiedot — tiedot hoitajista ja hoidettavista, jotka on liitetty tiliisi; (d) Käyttö- ja tekniset tiedot — IP-osoite, selaintyyppi, laitetunnisteet ja lokitiedot, jotka kerätään automaattisesti. Käsittelyn oikeusperusteet ovat: sopimuksen täyttäminen; oikeutetut edut; ja terveystietojen syöttämisen yhteydessä nimenomainen suostumuksesi UK GDPR:n 9 artiklan mukaisesti.'),

  ('fi', 'policy.priv_s2_body',
   'Käytämme henkilötietojasi seuraaviin tarkoituksiin: (a) tilisi luominen ja hallinta sekä henkilöllisyytesi todentaminen; (b) CarerView-palvelun tarjoaminen; (c) tapahtumaviestintä, kuten tilitilaukset, salasanan palautukset ja tilausilmoitukset; (d) maksujen turvallinen käsittely Stripen kautta; (e) palvelun suorituskyvyn seuranta ja kehittäminen; (f) lakisääteisten velvollisuuksiemme täyttäminen. Emme käytä tietojasi automaattiseen päätöksentekoon, jolla olisi merkittäviä oikeudellisia vaikutuksia.'),

  ('fi', 'policy.priv_s3_body',
   'Tietosi tallennetaan Supabase, Inc:n tarjoamaan infrastruktuuriin, jota isännöidään Amazon Web Services (AWS) -palvelinkeskuksissa Euroopan talousalueella ja Yhdistyneessä kuningaskunnassa. Kaikki tiedot salataan siirron aikana TLS 1.2:lla tai uudemmalla versiolla ja levossa AES-256:lla. Henkilötietoloukkauksesta, joka todennäköisesti aiheuttaa riskin oikeuksillesi ja vapauksillesi, ilmoitamme toimivaltaiselle valvontaviranomaiselle 72 tunnin kuluessa ja sinulle ilman aiheetonta viivytystä lain niin vaatiessa.'),

  ('fi', 'policy.priv_s4_body',
   'UK GDPR:n nojalla sinulla on seuraavat oikeudet: (a) Oikeus saada pääsy tietoihin; (b) Oikeus tietojen oikaisemiseen; (c) Oikeus tietojen poistamiseen; (d) Oikeus käsittelyn rajoittamiseen; (e) Oikeus siirtää tiedot järjestelmästä toiseen; (f) Vastustamisoikeus; (g) Automaattista päätöksentekoa koskevat oikeudet. Oikeuksien käyttämiseksi ota yhteyttä osoitteeseen CarerView@GrifDigi.com. Sinulla on myös oikeus tehdä valitus toimivaltaiselle tietosuojaviranomaiselle.'),

  ('fi', 'policy.priv_s5_title', 'Evästeet'),

  ('fi', 'policy.priv_s5_body',
   'CarerView ei käytä seuranta-, mainonta- tai analyyttisiä evästeitä. Emme aseta kolmansien osapuolten evästeitä laitteellesi. Todennuspalvelumme saattaa asettaa välttämättömiä istuntoevästeitä ainoastaan aktiivisen istuntosi ylläpitämiseksi; nämä poistetaan, kun suljet selaimen tai kirjaudut ulos. Henkilötietoja ei siirretä kolmansille osapuolille evästeiden kautta.'),

  ('fi', 'policy.data_notice',
   'Tässä datakäytännössä selitetään, miten CarerView käsittelee sovellukseen syöttämiäsi hoitotietoja. Säilytät näiden tietojen omistusoikeuden koko ajan. CarerView toimii tietojenkäsittelijänä puolestasi eikä koskaan käytä hoitotietojasi muuhun tarkoitukseen kuin tilaamasi palvelun toimittamiseen. Tämä käytäntö tulee lukea yhdessä tietosuojakäytäntömme kanssa.'),

  ('fi', 'policy.data_s1_body',
   'CarerViewiin luomasi hoitotiedot — mukaan lukien päivittäiset havainnot, toimintakykypisteytykset, muistiinpanot ja kaikki hoidettavasta henkilöstä kirjaamasi henkilökohtaiset tai lääketieteelliset tiedot — kuuluvat sinulle. Olet tämän sisällön rekisterinpitäjä; CarerView käsittelee sitä ainoastaan ohjeidesi mukaisesti. Terveyttä tai vammaisuutta koskevat hoitotiedot käsitellään erityisinä henkilötietoluokkina, joita suojataan lisäteknisin suojakeinoin.'),

  ('fi', 'policy.data_s2_body',
   'CarerView ei koskaan myy, vuokraa tai lisensoi hoitotietojasi kolmansille osapuolille. Emme jaa hoitotietojasi ulkopuolisille organisaatioille paitsi: (a) alihankkijoille, jotka ovat välttämättömiä palvelun toimittamiseksi, sitovien tietojenkäsittelysopimusten nojalla; (b) kun olet nimenomaisesti myöntänyt pääsyn muille tiimin jäsenille; tai (c) kun meitä velvoitetaan siihen laillisesti. Voimme käyttää täysin anonymisoituja, koottuja tilastotietoja ainoastaan palvelun sisäiseen kehittämiseen.'),

  ('fi', 'policy.data_s3_body',
   'Hoitotietojasi säilytetään niin kauan kuin CarerView-tilisi on aktiivinen. Jos poistat tilisi, poistamme kaikki siihen liittyvät hoitotiedot pysyvästi 30 päivän kuluessa tilin sulkemisesta, ellei lakisääteinen säilytysvelvollisuus edellytä pidempää säilytystä. Varmuuskopiot puhdistetaan jatkuvassa 30 päivän syklissä.'),

  ('fi', 'policy.data_s4_body',
   'Sinulla on oikeus saada täydellinen, siirrettävä kopio kaikista CarerViewiin syöttämistäsi hoitotiedoista. Voit luoda ja ladata täydellisen viennin milloin tahansa tiliasetuksista DOCX-muodossa. Viennille ei ole taajuusrajoituksia eikä siitä peritä maksua. Ota yhteyttä osoitteeseen CarerView@GrifDigi.com, jos tarvitset apua.'),

  ('fi', 'policy.data_s5_body',
   'CarerView on hoitohavaintojen ja -kirjausten työkalu. Se ei ole rekisteröity lääkinnällinen laite, kliininen päätöksentukijärjestelmä eikä diagnostinen väline. CarerViewiin kirjatut tiedot heijastavat hoitajien tekemiä havaintoja, eikä niitä tule tulkita kliinisinä arvioina tai lääketieteellisinä diagnooseina. Mikään CarerViewissä ei muodosta lääketieteellistä neuvontaa. Konsultoi aina pätevää terveydenhuollon ammattilaista.')

ON CONFLICT (locale, key) DO NOTHING;
