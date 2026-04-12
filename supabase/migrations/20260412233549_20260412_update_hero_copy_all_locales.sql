/*
  # Update Landing Page Hero Copy — All Locales

  ## Summary
  Updates the hero headline (landing.hero_title) and body copy (landing.hero_body)
  for all 7 supported locales (en, es, fr, it, de, sv, fi).

  ## Changes
  - landing.hero_title: Shortened headline, removes "through Clear Observations" suffix
  - landing.hero_body: New emotionally-led copy that introduces both the Memory Book
    and Observations as named product features, replaces barometer metaphor

  ## Locales Updated
  - en, es, fr, it, de, sv, fi
*/

UPDATE ui_translations SET value = 'Better Family and In-Home Caregiving',                          updated_at = now() WHERE key = 'landing.hero_title' AND locale = 'en';
UPDATE ui_translations SET value = 'Caring for someone you love means carrying a lot — their history, their health, what''s changing, and who needs to know. CarerView brings your whole care team together with a shared Memory Book for everything that matters, and a simple Observations tool to track how things shift day-to-day — so everyone involved is working from the same picture.', updated_at = now() WHERE key = 'landing.hero_body' AND locale = 'en';

UPDATE ui_translations SET value = 'Mejor cuidado familiar y en el hogar',                          updated_at = now() WHERE key = 'landing.hero_title' AND locale = 'es';
UPDATE ui_translations SET value = 'Cuidar a alguien que amas significa cargar con mucho — su historia, su salud, lo que está cambiando y quién necesita saberlo. CarerView une a todo tu equipo de cuidado con un Memory Book compartido para todo lo que importa, y una sencilla herramienta de Observaciones para seguir cómo cambian las cosas día a día — para que todos trabajen con la misma imagen.', updated_at = now() WHERE key = 'landing.hero_body' AND locale = 'es';

UPDATE ui_translations SET value = 'De Meilleurs Soins Familiaux et à Domicile',                    updated_at = now() WHERE key = 'landing.hero_title' AND locale = 'fr';
UPDATE ui_translations SET value = 'Prendre soin de quelqu''un que vous aimez implique de porter beaucoup de choses — son histoire, sa santé, ce qui change et qui doit le savoir. CarerView réunit toute votre équipe de soins grâce à un Memory Book partagé pour tout ce qui compte, et un outil d''Observations simple pour suivre l''évolution des choses au quotidien — afin que tout le monde travaille avec la même image.', updated_at = now() WHERE key = 'landing.hero_body' AND locale = 'fr';

UPDATE ui_translations SET value = 'Assistenza Familiare e Domiciliare Migliore',                   updated_at = now() WHERE key = 'landing.hero_title' AND locale = 'it';
UPDATE ui_translations SET value = 'Prendersi cura di qualcuno che ami significa portare molto — la sua storia, la sua salute, ciò che sta cambiando e chi ha bisogno di saperlo. CarerView riunisce tutto il tuo team di assistenza con un Memory Book condiviso per tutto ciò che conta, e un semplice strumento di Osservazioni per monitorare come le cose cambiano giorno per giorno — così tutti lavorano con la stessa immagine.', updated_at = now() WHERE key = 'landing.hero_body' AND locale = 'it';

UPDATE ui_translations SET value = 'Bessere Familien- und Hauspflege',                              updated_at = now() WHERE key = 'landing.hero_title' AND locale = 'de';
UPDATE ui_translations SET value = 'Für jemanden zu sorgen, den man liebt, bedeutet, vieles zu tragen — seine Geschichte, seine Gesundheit, was sich verändert und wer es wissen muss. CarerView bringt Ihr gesamtes Pflegeteam mit einem gemeinsamen Memory Book für alles Wichtige zusammen und einem einfachen Beobachtungswerkzeug, um tägliche Veränderungen zu verfolgen — damit alle mit demselben Bild arbeiten.', updated_at = now() WHERE key = 'landing.hero_body' AND locale = 'de';

UPDATE ui_translations SET value = 'Bättre familje- och hemvård',                                   updated_at = now() WHERE key = 'landing.hero_title' AND locale = 'sv';
UPDATE ui_translations SET value = 'Att ta hand om någon du älskar innebär att bära mycket — deras historia, deras hälsa, vad som förändras och vem som behöver veta. CarerView samlar hela ditt vårdteam med en delad Memory Book för allt som spelar roll, och ett enkelt Observations-verktyg för att följa hur saker förändras dag för dag — så att alla arbetar utifrån samma bild.', updated_at = now() WHERE key = 'landing.hero_body' AND locale = 'sv';

UPDATE ui_translations SET value = 'Parempi perhe- ja kotihoito',                                   updated_at = now() WHERE key = 'landing.hero_title' AND locale = 'fi';
UPDATE ui_translations SET value = 'Rakastamasi henkilön hoitaminen tarkoittaa paljon kantamista — hänen historiansa, terveytensä, muutokset ja kenen täytyy tietää. CarerView kokoaa koko hoitotiimisi yhteen jaetun Memory Bookin avulla kaikelle tärkeälle, ja yksinkertaisen Havainnot-työkalun päivittäisten muutosten seuraamiseen — jotta kaikki työskentelevät saman kuvan pohjalta.', updated_at = now() WHERE key = 'landing.hero_body' AND locale = 'fi';
