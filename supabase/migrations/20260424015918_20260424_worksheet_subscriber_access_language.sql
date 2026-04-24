/*
  # Worksheet Subscriber Access Language

  Replaces "Coming soon" messaging on worksheet cards with accurate
  subscriber-access language. Also adds a subtle one-line note used
  under worksheet section headings on module pages.

  ## Changes

  1. New key `new_carer.ws_subscriber_access`
     - Replaces the old `ws_coming_soon` key used in ResourceCard footer
     - Rendered with a Lock icon instead of a Clock icon
     - All 7 locales

  2. Update `new_carer.ws_all_intro` (hub page intro body)
     - Adds a short clause noting worksheets are available to subscribers
     - All 7 locales

  3. New key `new_carer.ws_subscriber_note`
     - Short one-liner shown under "Supporting worksheets" heading on module pages
     - All 7 locales
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- ── Card footer: subscriber access label ─────────────────────────────────────

('en', 'new_carer.ws_subscriber_access', 'Available with CarerView'),
('es', 'new_carer.ws_subscriber_access', 'Disponible con CarerView'),
('it', 'new_carer.ws_subscriber_access', 'Disponibile con CarerView'),
('fr', 'new_carer.ws_subscriber_access', 'Disponible avec CarerView'),
('de', 'new_carer.ws_subscriber_access', 'Verfügbar mit CarerView'),
('sv', 'new_carer.ws_subscriber_access', 'Tillgänglig med CarerView'),
('fi', 'new_carer.ws_subscriber_access', 'Saatavilla CarerView''lla'),

-- ── Hub page intro body (ws_all_intro) ───────────────────────────────────────

('en', 'new_carer.ws_all_intro', 'These practical worksheets complement the planning modules. They are available to CarerView subscribers — use them as structured thinking tools alongside each section.'),
('es', 'new_carer.ws_all_intro', 'Estas hojas de trabajo prácticas complementan los módulos de planificación. Están disponibles para los suscriptores de CarerView — úsalas como herramientas de reflexión estructurada junto a cada sección.'),
('it', 'new_carer.ws_all_intro', 'Questi fogli di lavoro pratici completano i moduli di pianificazione. Sono disponibili per gli abbonati CarerView — usali come strumenti di riflessione strutturata insieme a ogni sezione.'),
('fr', 'new_carer.ws_all_intro', 'Ces fiches pratiques complètent les modules de planification. Elles sont disponibles pour les abonnés CarerView — utilisez-les comme outils de réflexion structurée aux côtés de chaque section.'),
('de', 'new_carer.ws_all_intro', 'Diese praktischen Arbeitsblätter ergänzen die Planungsmodule. Sie stehen CarerView-Abonnenten zur Verfügung — nutzen Sie sie als strukturierte Denkwerkzeuge neben den einzelnen Abschnitten.'),
('sv', 'new_carer.ws_all_intro', 'Dessa praktiska arbetsblad kompletterar planeringsmodulerna. De är tillgängliga för CarerView-prenumeranter — använd dem som strukturerade tankeverktyg vid sidan av varje avsnitt.'),
('fi', 'new_carer.ws_all_intro', 'Nämä käytännölliset työarkit täydentävät suunnittelumoduuleja. Ne ovat saatavilla CarerView-tilaajille — käytä niitä jäsenneltyinä ajattelutyökaluina kunkin osion rinnalla.'),

-- ── Module-page one-liner below worksheet heading ────────────────────────────

('en', 'new_carer.ws_subscriber_note', 'Available to CarerView subscribers.'),
('es', 'new_carer.ws_subscriber_note', 'Disponibles para suscriptores de CarerView.'),
('it', 'new_carer.ws_subscriber_note', 'Disponibili per gli abbonati CarerView.'),
('fr', 'new_carer.ws_subscriber_note', 'Disponibles pour les abonnés CarerView.'),
('de', 'new_carer.ws_subscriber_note', 'Für CarerView-Abonnenten verfügbar.'),
('sv', 'new_carer.ws_subscriber_note', 'Tillgängliga för CarerView-prenumeranter.'),
('fi', 'new_carer.ws_subscriber_note', 'Saatavilla CarerView-tilaajille.')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
