/*
  # Seed contact role tag translations for all locales

  ## Summary
  The ContactsSection previously displayed hardcoded English role tags ("Family", "Doctor", etc.)
  in the dropdown and on contact cards regardless of the user's language.

  This migration seeds translated labels for all 10 role tags across all 7 supported locales.
  The stored `role_tag` database values remain as English keys for data stability.
  Only the displayed label is translated via these i18n keys.

  ## New Keys (10 keys × 7 locales = 70 rows)
  - memory_book.role_tag_family
  - memory_book.role_tag_friend
  - memory_book.role_tag_neighbour
  - memory_book.role_tag_primary_caregiver
  - memory_book.role_tag_backup_caregiver
  - memory_book.role_tag_doctor
  - memory_book.role_tag_emergency_contact
  - memory_book.role_tag_home_care
  - memory_book.role_tag_spiritual
  - memory_book.role_tag_other
*/

INSERT INTO ui_translations (key, locale, value) VALUES

-- English
('memory_book.role_tag_family',            'en', 'Family'),
('memory_book.role_tag_friend',            'en', 'Friend'),
('memory_book.role_tag_neighbour',         'en', 'Neighbour'),
('memory_book.role_tag_primary_caregiver', 'en', 'Primary Caregiver'),
('memory_book.role_tag_backup_caregiver',  'en', 'Backup Caregiver'),
('memory_book.role_tag_doctor',            'en', 'Doctor'),
('memory_book.role_tag_emergency_contact', 'en', 'Emergency Contact'),
('memory_book.role_tag_home_care',         'en', 'Home Care'),
('memory_book.role_tag_spiritual',         'en', 'Spiritual / Faith'),
('memory_book.role_tag_other',             'en', 'Other'),

-- Spanish
('memory_book.role_tag_family',            'es', 'Familia'),
('memory_book.role_tag_friend',            'es', 'Amigo/a'),
('memory_book.role_tag_neighbour',         'es', 'Vecino/a'),
('memory_book.role_tag_primary_caregiver', 'es', 'Cuidador/a principal'),
('memory_book.role_tag_backup_caregiver',  'es', 'Cuidador/a de respaldo'),
('memory_book.role_tag_doctor',            'es', 'Médico/a'),
('memory_book.role_tag_emergency_contact', 'es', 'Contacto de emergencia'),
('memory_book.role_tag_home_care',         'es', 'Cuidado en casa'),
('memory_book.role_tag_spiritual',         'es', 'Espiritual / Fe'),
('memory_book.role_tag_other',             'es', 'Otro'),

-- Italian
('memory_book.role_tag_family',            'it', 'Famiglia'),
('memory_book.role_tag_friend',            'it', 'Amico/a'),
('memory_book.role_tag_neighbour',         'it', 'Vicino/a'),
('memory_book.role_tag_primary_caregiver', 'it', 'Caregiver principale'),
('memory_book.role_tag_backup_caregiver',  'it', 'Caregiver di supporto'),
('memory_book.role_tag_doctor',            'it', 'Medico'),
('memory_book.role_tag_emergency_contact', 'it', 'Contatto di emergenza'),
('memory_book.role_tag_home_care',         'it', 'Assistenza domiciliare'),
('memory_book.role_tag_spiritual',         'it', 'Spirituale / Fede'),
('memory_book.role_tag_other',             'it', 'Altro'),

-- French
('memory_book.role_tag_family',            'fr', 'Famille'),
('memory_book.role_tag_friend',            'fr', 'Ami(e)'),
('memory_book.role_tag_neighbour',         'fr', 'Voisin(e)'),
('memory_book.role_tag_primary_caregiver', 'fr', 'Aidant(e) principal(e)'),
('memory_book.role_tag_backup_caregiver',  'fr', 'Aidant(e) secondaire'),
('memory_book.role_tag_doctor',            'fr', 'Médecin'),
('memory_book.role_tag_emergency_contact', 'fr', 'Contact d''urgence'),
('memory_book.role_tag_home_care',         'fr', 'Soins à domicile'),
('memory_book.role_tag_spiritual',         'fr', 'Spirituel / Foi'),
('memory_book.role_tag_other',             'fr', 'Autre'),

-- German
('memory_book.role_tag_family',            'de', 'Familie'),
('memory_book.role_tag_friend',            'de', 'Freund/Freundin'),
('memory_book.role_tag_neighbour',         'de', 'Nachbar/Nachbarin'),
('memory_book.role_tag_primary_caregiver', 'de', 'Hauptpflegeperson'),
('memory_book.role_tag_backup_caregiver',  'de', 'Stellvertretende Pflegeperson'),
('memory_book.role_tag_doctor',            'de', 'Arzt / Ärztin'),
('memory_book.role_tag_emergency_contact', 'de', 'Notfallkontakt'),
('memory_book.role_tag_home_care',         'de', 'Häusliche Pflege'),
('memory_book.role_tag_spiritual',         'de', 'Spirituell / Glaube'),
('memory_book.role_tag_other',             'de', 'Sonstiges'),

-- Swedish
('memory_book.role_tag_family',            'sv', 'Familj'),
('memory_book.role_tag_friend',            'sv', 'Vän'),
('memory_book.role_tag_neighbour',         'sv', 'Granne'),
('memory_book.role_tag_primary_caregiver', 'sv', 'Huvudvårdare'),
('memory_book.role_tag_backup_caregiver',  'sv', 'Reservvårdare'),
('memory_book.role_tag_doctor',            'sv', 'Läkare'),
('memory_book.role_tag_emergency_contact', 'sv', 'Nödkontakt'),
('memory_book.role_tag_home_care',         'sv', 'Hemvård'),
('memory_book.role_tag_spiritual',         'sv', 'Andlig / Tro'),
('memory_book.role_tag_other',             'sv', 'Övrigt'),

-- Finnish
('memory_book.role_tag_family',            'fi', 'Perhe'),
('memory_book.role_tag_friend',            'fi', 'Ystävä'),
('memory_book.role_tag_neighbour',         'fi', 'Naapuri'),
('memory_book.role_tag_primary_caregiver', 'fi', 'Päähoitaja'),
('memory_book.role_tag_backup_caregiver',  'fi', 'Varahoitaja'),
('memory_book.role_tag_doctor',            'fi', 'Lääkäri'),
('memory_book.role_tag_emergency_contact', 'fi', 'Hätäyhteyshenkilö'),
('memory_book.role_tag_home_care',         'fi', 'Kotihoito'),
('memory_book.role_tag_spiritual',         'fi', 'Henkinen / Usko'),
('memory_book.role_tag_other',             'fi', 'Muu')

ON CONFLICT (key, locale) DO NOTHING;
