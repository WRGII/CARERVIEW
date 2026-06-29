/*
  # Fix Role Labels: Owner/Member → Primary Caregiver/Caregiver + add Resident

  ## Summary
  The Memory & Schedule Overview was incorrectly displaying the viewing caregiver's
  subscription role ("Owner") next to the resident's name, making it appear as though
  the resident held that role.

  ## Changes

  ### memory_book.role_owner
  - Was: "Owner" (and equivalents)
  - Now: "Primary Caregiver" (and equivalents)
  - Context: shown as the viewer's role in the Memory Book Overview

  ### memory_book.role_member
  - Was: "Member" (and equivalents)
  - Now: "Caregiver" (and equivalents)
  - Context: shown as the viewer's role when they are an invited caregiver

  ### memory_book.role_resident (NEW)
  - Value: "Resident" (and equivalents)
  - Context: static badge shown next to the resident/patient name

  ### memory_book.viewing_as (NEW)
  - Value: "Viewing as:" (and equivalents)
  - Context: label prefix before the viewer's role indicator

  ### team.role_owner
  - Was: "Owner" (and equivalents)
  - Now: "Primary Caregiver" (and equivalents)
  - Context: badge shown in Family Circle member list next to the account owner

  ## Locales Updated
  en, es, fr, de, it, sv, fi
*/

-- ─── memory_book.role_owner → Primary Caregiver ───────────────────────────────

UPDATE public.ui_translations SET value = 'Primary Caregiver'  WHERE key = 'memory_book.role_owner' AND locale = 'en';
UPDATE public.ui_translations SET value = 'Cuidador/a Principal' WHERE key = 'memory_book.role_owner' AND locale = 'es';
UPDATE public.ui_translations SET value = 'Aidant(e) Principal(e)' WHERE key = 'memory_book.role_owner' AND locale = 'fr';
UPDATE public.ui_translations SET value = 'Hauptpflegeperson'    WHERE key = 'memory_book.role_owner' AND locale = 'de';
UPDATE public.ui_translations SET value = 'Caregiver Principale' WHERE key = 'memory_book.role_owner' AND locale = 'it';
UPDATE public.ui_translations SET value = 'Primär vårdgivare'   WHERE key = 'memory_book.role_owner' AND locale = 'sv';
UPDATE public.ui_translations SET value = 'Päähoitaja'           WHERE key = 'memory_book.role_owner' AND locale = 'fi';

-- ─── memory_book.role_member → Caregiver ──────────────────────────────────────

UPDATE public.ui_translations SET value = 'Caregiver'    WHERE key = 'memory_book.role_member' AND locale = 'en';
UPDATE public.ui_translations SET value = 'Cuidador/a'   WHERE key = 'memory_book.role_member' AND locale = 'es';
UPDATE public.ui_translations SET value = 'Aidant(e)'    WHERE key = 'memory_book.role_member' AND locale = 'fr';
UPDATE public.ui_translations SET value = 'Pflegeperson' WHERE key = 'memory_book.role_member' AND locale = 'de';
UPDATE public.ui_translations SET value = 'Caregiver'    WHERE key = 'memory_book.role_member' AND locale = 'it';
UPDATE public.ui_translations SET value = 'Vårdgivare'   WHERE key = 'memory_book.role_member' AND locale = 'sv';
UPDATE public.ui_translations SET value = 'Hoitaja'      WHERE key = 'memory_book.role_member' AND locale = 'fi';

-- ─── memory_book.role_resident (NEW) ─────────────────────────────────────────

INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'memory_book.role_resident', 'Resident'),
  ('es', 'memory_book.role_resident', 'Residente'),
  ('fr', 'memory_book.role_resident', 'Résident(e)'),
  ('de', 'memory_book.role_resident', 'Bewohner/in'),
  ('it', 'memory_book.role_resident', 'Residente'),
  ('sv', 'memory_book.role_resident', 'Boende'),
  ('fi', 'memory_book.role_resident', 'Asukas')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ─── memory_book.viewing_as (NEW) ────────────────────────────────────────────

INSERT INTO public.ui_translations (locale, key, value) VALUES
  ('en', 'memory_book.viewing_as', 'Viewing as:'),
  ('es', 'memory_book.viewing_as', 'Viendo como:'),
  ('fr', 'memory_book.viewing_as', 'Vue en tant que :'),
  ('de', 'memory_book.viewing_as', 'Angezeigt als:'),
  ('it', 'memory_book.viewing_as', 'Visualizzato come:'),
  ('sv', 'memory_book.viewing_as', 'Visas som:'),
  ('fi', 'memory_book.viewing_as', 'Näytetään nimellä:')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- ─── team.role_owner → Primary Caregiver ─────────────────────────────────────

UPDATE public.ui_translations SET value = 'Primary Caregiver'   WHERE key = 'team.role_owner' AND locale = 'en';
UPDATE public.ui_translations SET value = 'Cuidador/a Principal' WHERE key = 'team.role_owner' AND locale = 'es';
UPDATE public.ui_translations SET value = 'Aidant(e) Principal(e)' WHERE key = 'team.role_owner' AND locale = 'fr';
UPDATE public.ui_translations SET value = 'Hauptpflegeperson'    WHERE key = 'team.role_owner' AND locale = 'de';
UPDATE public.ui_translations SET value = 'Caregiver Principale' WHERE key = 'team.role_owner' AND locale = 'it';
UPDATE public.ui_translations SET value = 'Primär vårdgivare'   WHERE key = 'team.role_owner' AND locale = 'sv';
UPDATE public.ui_translations SET value = 'Päähoitaja'           WHERE key = 'team.role_owner' AND locale = 'fi';
