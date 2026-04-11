/*
  # Seed alias i18n keys for Providers, Insurance, and Identity sections

  ## Summary
  Several Memory Book components reference translation keys using a shorter naming
  convention than what was originally seeded. This migration adds the alias keys
  so both the old and new key names resolve correctly.

  ## Keys Added (12 aliases)
  - memory_book.toast_provider_required (alias for toast_provider_name_required)
  - memory_book.field_specialty (alias for field_provider_specialty)
  - memory_book.field_specialty_placeholder (alias for field_provider_specialty_placeholder)
  - memory_book.field_practice_name (alias for field_provider_practice)
  - memory_book.field_practice_name_placeholder (alias for field_provider_practice_placeholder)
  - memory_book.field_address (alias for field_provider_address)
  - memory_book.field_address_placeholder (alias for field_provider_address_placeholder)
  - memory_book.field_provider_is_primary (alias for field_provider_primary)
  - memory_book.provider_primary_label (alias for provider_primary_badge)
  - memory_book.insurance_dental_vision_heading (alias for insurance_dental_heading)
  - memory_book.field_cultural_prefs (alias for field_cultural_bg)
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- English
('en','memory_book.toast_provider_required','Provider name is required'),
('en','memory_book.field_specialty','Specialty / Role'),
('en','memory_book.field_specialty_placeholder','e.g. General Doctor, Cardiologist, Dentist, Pharmacy'),
('en','memory_book.field_practice_name','Practice / Clinic Name'),
('en','memory_book.field_practice_name_placeholder','Name of the practice or clinic'),
('en','memory_book.field_address','Address'),
('en','memory_book.field_address_placeholder','Clinic address'),
('en','memory_book.field_provider_is_primary','Mark as primary provider'),
('en','memory_book.provider_primary_label','Primary'),
('en','memory_book.insurance_dental_vision_heading','Dental & Vision Insurance'),
('en','memory_book.field_cultural_prefs','Cultural Preferences'),

-- Spanish
('es','memory_book.toast_provider_required','El nombre del proveedor es obligatorio'),
('es','memory_book.field_specialty','Especialidad / Rol'),
('es','memory_book.field_specialty_placeholder','p.ej. Médico General, Cardiólogo, Dentista, Farmacia'),
('es','memory_book.field_practice_name','Nombre de la Clínica'),
('es','memory_book.field_practice_name_placeholder','Nombre de la clínica o consultorio'),
('es','memory_book.field_address','Dirección'),
('es','memory_book.field_address_placeholder','Dirección de la clínica'),
('es','memory_book.field_provider_is_primary','Marcar como proveedor principal'),
('es','memory_book.provider_primary_label','Principal'),
('es','memory_book.insurance_dental_vision_heading','Seguro Dental y de Visión'),
('es','memory_book.field_cultural_prefs','Preferencias Culturales'),

-- Italian
('it','memory_book.toast_provider_required','Il nome del fornitore è obbligatorio'),
('it','memory_book.field_specialty','Specialità / Ruolo'),
('it','memory_book.field_specialty_placeholder','es. Medico Generico, Cardiologo, Dentista, Farmacia'),
('it','memory_book.field_practice_name','Nome dello Studio'),
('it','memory_book.field_practice_name_placeholder','Nome dello studio o clinica'),
('it','memory_book.field_address','Indirizzo'),
('it','memory_book.field_address_placeholder','Indirizzo della clinica'),
('it','memory_book.field_provider_is_primary','Segna come principale'),
('it','memory_book.provider_primary_label','Principale'),
('it','memory_book.insurance_dental_vision_heading','Assicurazione Dentale e Visiva'),
('it','memory_book.field_cultural_prefs','Preferenze Culturali'),

-- French
('fr','memory_book.toast_provider_required','Le nom du prestataire est obligatoire'),
('fr','memory_book.field_specialty','Spécialité / Rôle'),
('fr','memory_book.field_specialty_placeholder','ex. Médecin Généraliste, Cardiologue, Dentiste, Pharmacie'),
('fr','memory_book.field_practice_name','Nom du Cabinet'),
('fr','memory_book.field_practice_name_placeholder','Nom du cabinet ou de la clinique'),
('fr','memory_book.field_address','Adresse'),
('fr','memory_book.field_address_placeholder','Adresse de la clinique'),
('fr','memory_book.field_provider_is_primary','Marquer comme principal'),
('fr','memory_book.provider_primary_label','Principal'),
('fr','memory_book.insurance_dental_vision_heading','Assurance Dentaire et Visuelle'),
('fr','memory_book.field_cultural_prefs','Préférences Culturelles'),

-- German
('de','memory_book.toast_provider_required','Anbietername ist erforderlich'),
('de','memory_book.field_specialty','Fachgebiet / Rolle'),
('de','memory_book.field_specialty_placeholder','z.B. Hausarzt, Kardiologe, Zahnarzt, Apotheke'),
('de','memory_book.field_practice_name','Name der Praxis'),
('de','memory_book.field_practice_name_placeholder','Name der Praxis oder Klinik'),
('de','memory_book.field_address','Adresse'),
('de','memory_book.field_address_placeholder','Adresse der Klinik'),
('de','memory_book.field_provider_is_primary','Als Hauptanbieter markieren'),
('de','memory_book.provider_primary_label','Hauptanbieter'),
('de','memory_book.insurance_dental_vision_heading','Zahn- und Sehversicherung'),
('de','memory_book.field_cultural_prefs','Kulturelle Präferenzen'),

-- Swedish
('sv','memory_book.toast_provider_required','Leverantörsnamn krävs'),
('sv','memory_book.field_specialty','Specialitet / Roll'),
('sv','memory_book.field_specialty_placeholder','t.ex. Allmänläkare, Kardiolog, Tandläkare, Apotek'),
('sv','memory_book.field_practice_name','Klinikens namn'),
('sv','memory_book.field_practice_name_placeholder','Namn på mottagningen eller kliniken'),
('sv','memory_book.field_address','Adress'),
('sv','memory_book.field_address_placeholder','Klinikens adress'),
('sv','memory_book.field_provider_is_primary','Markera som primär'),
('sv','memory_book.provider_primary_label','Primär'),
('sv','memory_book.insurance_dental_vision_heading','Tand- och Synförsäkring'),
('sv','memory_book.field_cultural_prefs','Kulturella preferenser'),

-- Finnish
('fi','memory_book.toast_provider_required','Palveluntarjoajan nimi vaaditaan'),
('fi','memory_book.field_specialty','Erikoisala / Rooli'),
('fi','memory_book.field_specialty_placeholder','esim. Yleislääkäri, Kardiologi, Hammaslääkäri, Apteekki'),
('fi','memory_book.field_practice_name','Klinikan nimi'),
('fi','memory_book.field_practice_name_placeholder','Vastaanoton tai klinikan nimi'),
('fi','memory_book.field_address','Osoite'),
('fi','memory_book.field_address_placeholder','Klinikan osoite'),
('fi','memory_book.field_provider_is_primary','Merkitse ensisijaiseksi'),
('fi','memory_book.provider_primary_label','Ensisijainen'),
('fi','memory_book.insurance_dental_vision_heading','Hammas- ja Näkövakuutus'),
('fi','memory_book.field_cultural_prefs','Kulttuuriset mieltymykset')

ON CONFLICT (locale, key) DO NOTHING;
