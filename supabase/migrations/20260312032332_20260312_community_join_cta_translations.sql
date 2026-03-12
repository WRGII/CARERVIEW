/*
  # JoinFreeCTA i18n Translations

  ## Summary
  Seeds translations for the community JoinFreeCTA component, which was
  previously fully hardcoded in English. Covers all 7 supported locales:
  en, es, sv, fi, de, fr, it.

  ## New translation keys
  - community.join.title — main banner heading
  - community.join.description — banner subtext
  - community.join.benefit.connect — first benefit bullet
  - community.join.benefit.share — second benefit bullet
  - community.join.benefit.anonymous — third benefit bullet
  - community.join.cta.create_account — primary CTA button
  - community.join.cta.sign_in — secondary sign-in link
  - community.join.cta.already_registered — "already registered?" prefix text
  - community.join.card.title — card variant heading
  - community.join.card.description — card variant subtext
  - community.join.inline.description — inline variant fallback text
  - community.join.footer — small print below banner CTA
*/

INSERT INTO ui_translations (key, locale, value) VALUES
  ('community.join.title', 'en', 'Join the Caregiver Community — free'),
  ('community.join.title', 'es', 'Únete a la comunidad de cuidadores — gratis'),
  ('community.join.title', 'sv', 'Gå med i omsorgsgivarcommunity — gratis'),
  ('community.join.title', 'fi', 'Liity hoitajayhteisöön — ilmaiseksi'),
  ('community.join.title', 'de', 'Der Pflegenden-Community beitreten — kostenlos'),
  ('community.join.title', 'fr', 'Rejoignez la communauté des aidants — gratuitement'),
  ('community.join.title', 'it', 'Unisciti alla community dei caregiver — gratis'),

  ('community.join.description', 'en', 'Read discussions, share your experience, and connect with caregivers who understand what you''re going through. No subscription needed.'),
  ('community.join.description', 'es', 'Lee discusiones, comparte tu experiencia y conéctate con cuidadores que entienden lo que estás pasando. Sin suscripción.'),
  ('community.join.description', 'sv', 'Läs diskussioner, dela din erfarenhet och kontakta omsorgsgivare som förstår vad du går igenom. Inget abonnemang krävs.'),
  ('community.join.description', 'fi', 'Lue keskusteluja, jaa kokemuksiasi ja ota yhteyttä hoitajiin, jotka ymmärtävät mitä käyt läpi. Ei tilausta tarvita.'),
  ('community.join.description', 'de', 'Lesen Sie Diskussionen, teilen Sie Ihre Erfahrungen und verbinden Sie sich mit Pflegenden, die verstehen, was Sie durchmachen. Kein Abonnement erforderlich.'),
  ('community.join.description', 'fr', 'Lisez les discussions, partagez votre expérience et connectez-vous avec des aidants qui comprennent ce que vous traversez. Aucun abonnement nécessaire.'),
  ('community.join.description', 'it', 'Leggi le discussioni, condividi la tua esperienza e connettiti con i caregiver che capiscono cosa stai attraversando. Nessun abbonamento richiesto.'),

  ('community.join.benefit.connect', 'en', 'Connect with caregivers who truly understand'),
  ('community.join.benefit.connect', 'es', 'Conéctate con cuidadores que realmente entienden'),
  ('community.join.benefit.connect', 'sv', 'Kontakta omsorgsgivare som verkligen förstår'),
  ('community.join.benefit.connect', 'fi', 'Ota yhteyttä hoitajiin, jotka todella ymmärtävät'),
  ('community.join.benefit.connect', 'de', 'Verbinden Sie sich mit Pflegenden, die wirklich verstehen'),
  ('community.join.benefit.connect', 'fr', 'Connectez-vous avec des aidants qui comprennent vraiment'),
  ('community.join.benefit.connect', 'it', 'Connettiti con i caregiver che capiscono davvero'),

  ('community.join.benefit.share', 'en', 'Share experiences and get peer support'),
  ('community.join.benefit.share', 'es', 'Comparte experiencias y obtén apoyo entre pares'),
  ('community.join.benefit.share', 'sv', 'Dela erfarenheter och få stöd från andra'),
  ('community.join.benefit.share', 'fi', 'Jaa kokemuksia ja saa vertaistukea'),
  ('community.join.benefit.share', 'de', 'Erfahrungen teilen und gegenseitige Unterstützung erhalten'),
  ('community.join.benefit.share', 'fr', 'Partagez des expériences et bénéficiez du soutien des pairs'),
  ('community.join.benefit.share', 'it', 'Condividi esperienze e ottieni supporto dai pari'),

  ('community.join.benefit.anonymous', 'en', 'Post anonymously when you need privacy'),
  ('community.join.benefit.anonymous', 'es', 'Publica de forma anónima cuando necesites privacidad'),
  ('community.join.benefit.anonymous', 'sv', 'Posta anonymt när du behöver integritet'),
  ('community.join.benefit.anonymous', 'fi', 'Julkaise nimettömästi kun tarvitset yksityisyyttä'),
  ('community.join.benefit.anonymous', 'de', 'Anonym posten wenn Sie Privatsphäre benötigen'),
  ('community.join.benefit.anonymous', 'fr', 'Publiez anonymement quand vous avez besoin de confidentialité'),
  ('community.join.benefit.anonymous', 'it', 'Pubblica in modo anonimo quando hai bisogno di privacy'),

  ('community.join.cta.create_account', 'en', 'Create free account'),
  ('community.join.cta.create_account', 'es', 'Crear cuenta gratuita'),
  ('community.join.cta.create_account', 'sv', 'Skapa gratis konto'),
  ('community.join.cta.create_account', 'fi', 'Luo ilmainen tili'),
  ('community.join.cta.create_account', 'de', 'Kostenloses Konto erstellen'),
  ('community.join.cta.create_account', 'fr', 'Créer un compte gratuit'),
  ('community.join.cta.create_account', 'it', 'Crea un account gratuito'),

  ('community.join.cta.join_free', 'en', 'Join free'),
  ('community.join.cta.join_free', 'es', 'Unirse gratis'),
  ('community.join.cta.join_free', 'sv', 'Gå med gratis'),
  ('community.join.cta.join_free', 'fi', 'Liity ilmaiseksi'),
  ('community.join.cta.join_free', 'de', 'Kostenlos beitreten'),
  ('community.join.cta.join_free', 'fr', 'Rejoindre gratuitement'),
  ('community.join.cta.join_free', 'it', 'Unisciti gratis'),

  ('community.join.cta.sign_in', 'en', 'Sign in'),
  ('community.join.cta.sign_in', 'es', 'Iniciar sesión'),
  ('community.join.cta.sign_in', 'sv', 'Logga in'),
  ('community.join.cta.sign_in', 'fi', 'Kirjaudu sisään'),
  ('community.join.cta.sign_in', 'de', 'Anmelden'),
  ('community.join.cta.sign_in', 'fr', 'Se connecter'),
  ('community.join.cta.sign_in', 'it', 'Accedi'),

  ('community.join.cta.already_registered', 'en', 'Already registered?'),
  ('community.join.cta.already_registered', 'es', '¿Ya estás registrado?'),
  ('community.join.cta.already_registered', 'sv', 'Redan registrerad?'),
  ('community.join.cta.already_registered', 'fi', 'Jo rekisteröitynyt?'),
  ('community.join.cta.already_registered', 'de', 'Bereits registriert?'),
  ('community.join.cta.already_registered', 'fr', 'Déjà inscrit ?'),
  ('community.join.cta.already_registered', 'it', 'Già registrato?'),

  ('community.join.card.title', 'en', 'Join the Community'),
  ('community.join.card.title', 'es', 'Únete a la comunidad'),
  ('community.join.card.title', 'sv', 'Gå med i community'),
  ('community.join.card.title', 'fi', 'Liity yhteisöön'),
  ('community.join.card.title', 'de', 'Der Community beitreten'),
  ('community.join.card.title', 'fr', 'Rejoindre la communauté'),
  ('community.join.card.title', 'it', 'Unisciti alla community'),

  ('community.join.card.description', 'en', 'Free for all caregivers. No subscription required.'),
  ('community.join.card.description', 'es', 'Gratis para todos los cuidadores. Sin suscripción.'),
  ('community.join.card.description', 'sv', 'Gratis för alla omsorgsgivare. Inget abonnemang krävs.'),
  ('community.join.card.description', 'fi', 'Ilmainen kaikille hoitajille. Ei tilausta tarvita.'),
  ('community.join.card.description', 'de', 'Kostenlos für alle Pflegenden. Kein Abonnement erforderlich.'),
  ('community.join.card.description', 'fr', 'Gratuit pour tous les aidants. Aucun abonnement requis.'),
  ('community.join.card.description', 'it', 'Gratuito per tutti i caregiver. Nessun abbonamento richiesto.'),

  ('community.join.inline.description', 'en', 'Join the community to post and connect with other caregivers.'),
  ('community.join.inline.description', 'es', 'Únete a la comunidad para publicar y conectarte con otros cuidadores.'),
  ('community.join.inline.description', 'sv', 'Gå med i community för att posta och kontakta andra omsorgsgivare.'),
  ('community.join.inline.description', 'fi', 'Liity yhteisöön julkaistaksesi ja ottaaksesi yhteyttä muihin hoitajiin.'),
  ('community.join.inline.description', 'de', 'Treten Sie der Community bei, um zu posten und sich mit anderen Pflegenden zu vernetzen.'),
  ('community.join.inline.description', 'fr', 'Rejoignez la communauté pour publier et vous connecter avec d''autres aidants.'),
  ('community.join.inline.description', 'it', 'Unisciti alla community per pubblicare e connetterti con altri caregiver.'),

  ('community.join.footer', 'en', 'Community is free. Structured care tracking features are part of paid plans.'),
  ('community.join.footer', 'es', 'La comunidad es gratuita. Las funciones de seguimiento de cuidados son parte de los planes de pago.'),
  ('community.join.footer', 'sv', 'Community är gratis. Strukturerade vårdspårningsfunktioner ingår i betalda planer.'),
  ('community.join.footer', 'fi', 'Yhteisö on ilmainen. Strukturoidut hoitoseurantaominaisuudet ovat osa maksullisia suunnitelmia.'),
  ('community.join.footer', 'de', 'Die Community ist kostenlos. Strukturierte Pflegeverfolgungsfunktionen sind Teil kostenpflichtiger Pläne.'),
  ('community.join.footer', 'fr', 'La communauté est gratuite. Les fonctionnalités de suivi des soins structurées font partie des plans payants.'),
  ('community.join.footer', 'it', 'La community è gratuita. Le funzionalità di monitoraggio strutturato delle cure fanno parte dei piani a pagamento.')

ON CONFLICT (key, locale) DO NOTHING;
