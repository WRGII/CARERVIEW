/*
  # Community Member — Dashboard panel keys + subtitle_free, all locales

  1. caregiver.subtitle_free — completely missing key, seed all 8 locales
  2. caregiver.subscriber_tools_heading — add es, it, fr, de, sv, fi (ja exists)
  3. caregiver.upsell_mb_desc — add es, it, fr, de, sv, fi (ja exists)
  4. caregiver.upsell_cp_desc — add es, it, fr, de, sv, fi (ja exists)
*/

INSERT INTO public.ui_translations (locale, key, value) VALUES

  -- caregiver.subtitle_free — seed all 8 locales (key has zero rows currently)
  ('en', 'caregiver.subtitle_free', 'Your free Community Member account'),
  ('es', 'caregiver.subtitle_free', 'Tu cuenta gratuita de Miembro Comunitario'),
  ('it', 'caregiver.subtitle_free', 'Il tuo account gratuito da Membro della Comunità'),
  ('fr', 'caregiver.subtitle_free', 'Votre compte gratuit de Membre de la Communauté'),
  ('de', 'caregiver.subtitle_free', 'Ihr kostenloses Community-Mitglied-Konto'),
  ('sv', 'caregiver.subtitle_free', 'Ditt gratis Gemenskapsmedlem-konto'),
  ('fi', 'caregiver.subtitle_free', 'Ilmainen Yhteisön jäsen -tilisi'),
  ('ja', 'caregiver.subtitle_free', 'あなたの無料コミュニティメンバーアカウント'),

  -- caregiver.subscriber_tools_heading — add es, it, fr, de, sv, fi
  ('es', 'caregiver.subscriber_tools_heading', 'Herramientas de suscriptor'),
  ('it', 'caregiver.subscriber_tools_heading', 'Strumenti abbonato'),
  ('fr', 'caregiver.subscriber_tools_heading', 'Outils abonné'),
  ('de', 'caregiver.subscriber_tools_heading', 'Abonnenten-Tools'),
  ('sv', 'caregiver.subscriber_tools_heading', 'Prenumerantverktyg'),
  ('fi', 'caregiver.subscriber_tools_heading', 'Tilaajatyökalut'),

  -- caregiver.upsell_mb_desc — add es, it, fr, de, sv, fi
  ('es', 'caregiver.upsell_mb_desc', 'Conoce a la persona — identidad, salud, preferencias, contactos'),
  ('it', 'caregiver.upsell_mb_desc', 'Conosci la persona — identità, salute, preferenze, contatti'),
  ('fr', 'caregiver.upsell_mb_desc', 'Connaître la personne — identité, santé, préférences, contacts'),
  ('de', 'caregiver.upsell_mb_desc', 'Die Person kennen — Identität, Gesundheit, Vorlieben, Kontakte'),
  ('sv', 'caregiver.upsell_mb_desc', 'Känn personen — identitet, hälsa, preferenser, kontakter'),
  ('fi', 'caregiver.upsell_mb_desc', 'Tunne henkilö — identiteetti, terveys, mieltymykset, yhteystiedot'),

  -- caregiver.upsell_cp_desc — add es, it, fr, de, sv, fi
  ('es', 'caregiver.upsell_cp_desc', 'Coordina el equipo — roles, autoridad, sostenibilidad'),
  ('it', 'caregiver.upsell_cp_desc', 'Coordina il team — ruoli, autorità, sostenibilità'),
  ('fr', 'caregiver.upsell_cp_desc', 'Coordonner l''équipe — rôles, autorité, durabilité'),
  ('de', 'caregiver.upsell_cp_desc', 'Das Team koordinieren — Rollen, Zuständigkeiten, Nachhaltigkeit'),
  ('sv', 'caregiver.upsell_cp_desc', 'Koordinera teamet — roller, befogenhet, hållbarhet'),
  ('fi', 'caregiver.upsell_cp_desc', 'Koordinoi tiimi — roolit, valtuudet, kestävyys')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
