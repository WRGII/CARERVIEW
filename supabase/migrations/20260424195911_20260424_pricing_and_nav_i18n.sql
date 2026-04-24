/*
  # Pricing Page Feature Lists and Nav Label Updates

  Updates paid plan feature lists to include Care Plan Builder, Decision Engine,
  Memory Book, and Care Hub access. Updates free tier description for clarity.
  Updates nav "New Carer" label to "Caregiver Guide".

  All 7 locales: en, es, it, fr, de, sv, fi
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES

-- Free tier description and name clarification
('en', 'pricing.plan_free_name', 'Community Observer'),
('es', 'pricing.plan_free_name', 'Observador Comunitario'),
('it', 'pricing.plan_free_name', 'Osservatore Comunitario'),
('fr', 'pricing.plan_free_name', 'Observateur Communautaire'),
('de', 'pricing.plan_free_name', 'Gemeinschaftsbeobachter'),
('sv', 'pricing.plan_free_name', 'Gemenskapsobservatör'),
('fi', 'pricing.plan_free_name', 'Yhteisön tarkkailija'),

('en', 'pricing.plan_free_desc', 'Join a care team by invite. View updates, follow observations, and add occasional notes. Always free.'),
('es', 'pricing.plan_free_desc', 'Únete a un equipo de cuidado por invitación. Ve actualizaciones, sigue las observaciones y añade notas ocasionales. Siempre gratis.'),
('it', 'pricing.plan_free_desc', 'Unisciti a un team di cura tramite invito. Visualizza aggiornamenti, segui le osservazioni e aggiungi note occasionali. Sempre gratuito.'),
('fr', 'pricing.plan_free_desc', 'Rejoignez une équipe de soins sur invitation. Consultez les mises à jour, suivez les observations et ajoutez des notes occasionnelles. Toujours gratuit.'),
('de', 'pricing.plan_free_desc', 'Treten Sie einem Pflegeteam per Einladung bei. Sehen Sie Updates, verfolgen Sie Beobachtungen und fügen Sie gelegentliche Notizen hinzu. Immer kostenlos.'),
('sv', 'pricing.plan_free_desc', 'Gå med i ett vårdteam via inbjudan. Se uppdateringar, följ observationer och lägg till tillfälliga anteckningar. Alltid gratis.'),
('fi', 'pricing.plan_free_desc', 'Liity hoitotiimiin kutsulla. Katso päivityksiä, seuraa havaintoja ja lisää satunnaisia muistiinpanoja. Aina ilmainen.'),

-- Primary Caregiver plan — new features (feat5 onward)
('en', 'pricing.plan_primary_feat5', 'Care Plan Builder (6 sections)'),
('es', 'pricing.plan_primary_feat5', 'Constructor de Plan de Cuidados (6 secciones)'),
('it', 'pricing.plan_primary_feat5', 'Costruttore di Piano di Cura (6 sezioni)'),
('fr', 'pricing.plan_primary_feat5', 'Constructeur de Plan de soins (6 sections)'),
('de', 'pricing.plan_primary_feat5', 'Pflegeplan-Builder (6 Abschnitte)'),
('sv', 'pricing.plan_primary_feat5', 'Omvårdnadsplansbyggare (6 avsnitt)'),
('fi', 'pricing.plan_primary_feat5', 'Hoitosuunnitelman rakentaja (6 osiota)'),

('en', 'pricing.plan_primary_feat6', 'Decision Engine — gap detection by severity'),
('es', 'pricing.plan_primary_feat6', 'Motor de Decisiones — detección de brechas por gravedad'),
('it', 'pricing.plan_primary_feat6', 'Motore Decisionale — rilevamento lacune per gravità'),
('fr', 'pricing.plan_primary_feat6', 'Moteur de Décision — détection des lacunes par gravité'),
('de', 'pricing.plan_primary_feat6', 'Entscheidungs-Engine — Lückenerkennung nach Schweregrad'),
('sv', 'pricing.plan_primary_feat6', 'Beslutsmotorn — luckor identifierade efter allvarlighetsgrad'),
('fi', 'pricing.plan_primary_feat6', 'Päätösmoottori — aukkojen havaitseminen vakavuuden mukaan'),

('en', 'pricing.plan_primary_feat7', 'Memory Book — full care profile for your loved one'),
('es', 'pricing.plan_primary_feat7', 'Memory Book — perfil de cuidado completo para tu ser querido'),
('it', 'pricing.plan_primary_feat7', 'Memory Book — profilo di cura completo per la tua persona cara'),
('fr', 'pricing.plan_primary_feat7', 'Memory Book — profil de soins complet pour votre proche'),
('de', 'pricing.plan_primary_feat7', 'Memory Book — vollständiges Pflegeprofil für Ihren Angehörigen'),
('sv', 'pricing.plan_primary_feat7', 'Memory Book — komplett vårdprofil för din närstående'),
('fi', 'pricing.plan_primary_feat7', 'Muistokirja — täydellinen hoitoprofiili läheisellesi'),

('en', 'pricing.plan_primary_feat8', 'Care Hub — all three tools in one coordinated workspace'),
('es', 'pricing.plan_primary_feat8', 'Care Hub — las tres herramientas en un espacio de trabajo coordinado'),
('it', 'pricing.plan_primary_feat8', 'Care Hub — tutti e tre gli strumenti in un unico spazio di lavoro coordinato'),
('fr', 'pricing.plan_primary_feat8', 'Care Hub — les trois outils dans un espace de travail coordonné'),
('de', 'pricing.plan_primary_feat8', 'Care Hub — alle drei Tools in einem koordinierten Arbeitsbereich'),
('sv', 'pricing.plan_primary_feat8', 'Care Hub — alla tre verktygen i ett koordinerat arbetsområde'),
('fi', 'pricing.plan_primary_feat8', 'Hoitokeskus — kaikki kolme työkalua yhdessä koordinoidussa työtilassa'),

-- Family Circle plan — new features
('en', 'pricing.plan_family_feat5', 'Care Plan Builder (6 sections) — shared across the team'),
('es', 'pricing.plan_family_feat5', 'Constructor de Plan de Cuidados (6 secciones) — compartido en el equipo'),
('it', 'pricing.plan_family_feat5', 'Costruttore di Piano di Cura (6 sezioni) — condiviso nel team'),
('fr', 'pricing.plan_family_feat5', 'Constructeur de Plan de soins (6 sections) — partagé dans l''équipe'),
('de', 'pricing.plan_family_feat5', 'Pflegeplan-Builder (6 Abschnitte) — im Team geteilt'),
('sv', 'pricing.plan_family_feat5', 'Omvårdnadsplansbyggare (6 avsnitt) — delad i teamet'),
('fi', 'pricing.plan_family_feat5', 'Hoitosuunnitelman rakentaja (6 osiota) — jaettu tiimissä'),

('en', 'pricing.plan_family_feat6', 'Decision Engine — shared gap alerts for the whole team'),
('es', 'pricing.plan_family_feat6', 'Motor de Decisiones — alertas de brechas compartidas para todo el equipo'),
('it', 'pricing.plan_family_feat6', 'Motore Decisionale — avvisi di lacune condivisi per tutto il team'),
('fr', 'pricing.plan_family_feat6', 'Moteur de Décision — alertes de lacunes partagées pour toute l''équipe'),
('de', 'pricing.plan_family_feat6', 'Entscheidungs-Engine — gemeinsame Lückenwarnungen für das gesamte Team'),
('sv', 'pricing.plan_family_feat6', 'Beslutsmotorn — delade luckvarningar för hela teamet'),
('fi', 'pricing.plan_family_feat6', 'Päätösmoottori — jaetut aukkohälytykset koko tiimille'),

('en', 'pricing.plan_family_feat7', 'Memory Book — accessible to all team members instantly'),
('es', 'pricing.plan_family_feat7', 'Memory Book — accesible para todos los miembros del equipo al instante'),
('it', 'pricing.plan_family_feat7', 'Memory Book — accessibile a tutti i membri del team immediatamente'),
('fr', 'pricing.plan_family_feat7', 'Memory Book — accessible à tous les membres de l''équipe instantanément'),
('de', 'pricing.plan_family_feat7', 'Memory Book — sofort für alle Teammitglieder zugänglich'),
('sv', 'pricing.plan_family_feat7', 'Memory Book — tillgänglig för alla teammedlemmar omedelbart'),
('fi', 'pricing.plan_family_feat7', 'Muistokirja — kaikkien tiimin jäsenten käytettävissä välittömästi'),

('en', 'pricing.plan_family_feat8', 'Care Hub — full coordination workspace for the whole family'),
('es', 'pricing.plan_family_feat8', 'Care Hub — espacio de trabajo de coordinación completo para toda la familia'),
('it', 'pricing.plan_family_feat8', 'Care Hub — spazio di lavoro di coordinamento completo per tutta la famiglia'),
('fr', 'pricing.plan_family_feat8', 'Care Hub — espace de travail de coordination complet pour toute la famille'),
('de', 'pricing.plan_family_feat8', 'Care Hub — vollständiger Koordinations-Arbeitsbereich für die ganze Familie'),
('sv', 'pricing.plan_family_feat8', 'Care Hub — fullt koordinationsarbetsområde för hela familjen'),
('fi', 'pricing.plan_family_feat8', 'Hoitokeskus — täydellinen koordinointityötila koko perheelle'),

-- Nav label update: New Carer → Caregiver Guide
('en', 'nav.new_carer', 'Caregiver Guide'),
('es', 'nav.new_carer', 'Guía del Cuidador'),
('it', 'nav.new_carer', 'Guida del Caregiver'),
('fr', 'nav.new_carer', 'Guide de l''Aidant'),
('de', 'nav.new_carer', 'Leitfaden für Pflegepersonen'),
('sv', 'nav.new_carer', 'Vårdarguide'),
('fi', 'nav.new_carer', 'Hoitajan opas')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
