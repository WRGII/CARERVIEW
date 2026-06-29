/*
  # Seed new i18n translation keys

  New keys introduced by recent feature work:

  ## ReplyComposer component (community.reply_*)
  - community.reply_banned_title
  - community.reply_banned_body
  - community.reply_replying_as
  - community.anonymous_caregiver
  - community.reply_label
  - community.reply_placeholder
  - community.reply_min_chars
  - community.reply_error_generic
  - community.reply_anon_active_title
  - community.reply_anon_inactive_title
  - community.anonymous
  - community.reply_post_anonymously
  - community.reply_posting
  - community.reply_submit
  - community.reply_anon_disclaimer

  ## ManageBillingButton component (billing.*)
  - billing.portal_no_url
  - billing.portal_error
  - billing.portal_opening
  - billing.manage_billing

  ## ChoosePlan page
  - choose_plan.checkout_failed

  All keys are inserted for all 7 active locales: en, es, it, fr, de, sv, fi
  Non-English locales use English text as fallback (to be translated later).
*/

INSERT INTO ui_translations (locale, key, value)
VALUES
  -- ============================================================
  -- community.reply_banned_title
  -- ============================================================
  ('en', 'community.reply_banned_title', 'Your account is restricted'),
  ('es', 'community.reply_banned_title', 'Your account is restricted'),
  ('it', 'community.reply_banned_title', 'Your account is restricted'),
  ('fr', 'community.reply_banned_title', 'Your account is restricted'),
  ('de', 'community.reply_banned_title', 'Your account is restricted'),
  ('sv', 'community.reply_banned_title', 'Your account is restricted'),
  ('fi', 'community.reply_banned_title', 'Your account is restricted'),

  -- ============================================================
  -- community.reply_banned_body
  -- ============================================================
  ('en', 'community.reply_banned_body', 'You are not able to post or reply at this time.'),
  ('es', 'community.reply_banned_body', 'You are not able to post or reply at this time.'),
  ('it', 'community.reply_banned_body', 'You are not able to post or reply at this time.'),
  ('fr', 'community.reply_banned_body', 'You are not able to post or reply at this time.'),
  ('de', 'community.reply_banned_body', 'You are not able to post or reply at this time.'),
  ('sv', 'community.reply_banned_body', 'You are not able to post or reply at this time.'),
  ('fi', 'community.reply_banned_body', 'You are not able to post or reply at this time.'),

  -- ============================================================
  -- community.reply_replying_as
  -- ============================================================
  ('en', 'community.reply_replying_as', 'Replying as'),
  ('es', 'community.reply_replying_as', 'Replying as'),
  ('it', 'community.reply_replying_as', 'Replying as'),
  ('fr', 'community.reply_replying_as', 'Replying as'),
  ('de', 'community.reply_replying_as', 'Replying as'),
  ('sv', 'community.reply_replying_as', 'Replying as'),
  ('fi', 'community.reply_replying_as', 'Replying as'),

  -- ============================================================
  -- community.anonymous_caregiver
  -- ============================================================
  ('en', 'community.anonymous_caregiver', 'Anonymous Caregiver'),
  ('es', 'community.anonymous_caregiver', 'Cuidador anónimo'),
  ('it', 'community.anonymous_caregiver', 'Caregiver anonimo'),
  ('fr', 'community.anonymous_caregiver', 'Aidant anonyme'),
  ('de', 'community.anonymous_caregiver', 'Anonyme Pflegeperson'),
  ('sv', 'community.anonymous_caregiver', 'Anonym vårdgivare'),
  ('fi', 'community.anonymous_caregiver', 'Anonyymi hoitaja'),

  -- ============================================================
  -- community.reply_label
  -- ============================================================
  ('en', 'community.reply_label', 'Your reply'),
  ('es', 'community.reply_label', 'Tu respuesta'),
  ('it', 'community.reply_label', 'La tua risposta'),
  ('fr', 'community.reply_label', 'Votre réponse'),
  ('de', 'community.reply_label', 'Deine Antwort'),
  ('sv', 'community.reply_label', 'Ditt svar'),
  ('fi', 'community.reply_label', 'Vastauksesi'),

  -- ============================================================
  -- community.reply_placeholder
  -- ============================================================
  ('en', 'community.reply_placeholder', 'Share your experience or advice…'),
  ('es', 'community.reply_placeholder', 'Comparte tu experiencia o consejo…'),
  ('it', 'community.reply_placeholder', 'Condividi la tua esperienza o consiglio…'),
  ('fr', 'community.reply_placeholder', 'Partagez votre expérience ou vos conseils…'),
  ('de', 'community.reply_placeholder', 'Teile deine Erfahrung oder deinen Rat…'),
  ('sv', 'community.reply_placeholder', 'Dela din erfarenhet eller ditt råd…'),
  ('fi', 'community.reply_placeholder', 'Jaa kokemuksesi tai neuvosi…'),

  -- ============================================================
  -- community.reply_min_chars
  -- ============================================================
  ('en', 'community.reply_min_chars', 'Reply must be at least 10 characters.'),
  ('es', 'community.reply_min_chars', 'La respuesta debe tener al menos 10 caracteres.'),
  ('it', 'community.reply_min_chars', 'La risposta deve contenere almeno 10 caratteri.'),
  ('fr', 'community.reply_min_chars', 'La réponse doit contenir au moins 10 caractères.'),
  ('de', 'community.reply_min_chars', 'Die Antwort muss mindestens 10 Zeichen enthalten.'),
  ('sv', 'community.reply_min_chars', 'Svaret måste vara minst 10 tecken.'),
  ('fi', 'community.reply_min_chars', 'Vastauksen on oltava vähintään 10 merkkiä.'),

  -- ============================================================
  -- community.reply_error_generic
  -- ============================================================
  ('en', 'community.reply_error_generic', 'Failed to post reply. Please try again.'),
  ('es', 'community.reply_error_generic', 'Error al publicar la respuesta. Inténtalo de nuevo.'),
  ('it', 'community.reply_error_generic', 'Impossibile pubblicare la risposta. Riprova.'),
  ('fr', 'community.reply_error_generic', 'Impossible de publier la réponse. Veuillez réessayer.'),
  ('de', 'community.reply_error_generic', 'Antwort konnte nicht gepostet werden. Bitte versuche es erneut.'),
  ('sv', 'community.reply_error_generic', 'Det gick inte att posta svaret. Försök igen.'),
  ('fi', 'community.reply_error_generic', 'Vastauksen lähettäminen epäonnistui. Yritä uudelleen.'),

  -- ============================================================
  -- community.reply_anon_active_title
  -- ============================================================
  ('en', 'community.reply_anon_active_title', 'Anonymous mode on'),
  ('es', 'community.reply_anon_active_title', 'Modo anónimo activado'),
  ('it', 'community.reply_anon_active_title', 'Modalità anonima attiva'),
  ('fr', 'community.reply_anon_active_title', 'Mode anonyme activé'),
  ('de', 'community.reply_anon_active_title', 'Anonymer Modus aktiv'),
  ('sv', 'community.reply_anon_active_title', 'Anonymt läge aktiverat'),
  ('fi', 'community.reply_anon_active_title', 'Anonyymi tila päällä'),

  -- ============================================================
  -- community.reply_anon_inactive_title
  -- ============================================================
  ('en', 'community.reply_anon_inactive_title', 'Post anonymously'),
  ('es', 'community.reply_anon_inactive_title', 'Publicar de forma anónima'),
  ('it', 'community.reply_anon_inactive_title', 'Pubblica in modo anonimo'),
  ('fr', 'community.reply_anon_inactive_title', 'Publier anonymement'),
  ('de', 'community.reply_anon_inactive_title', 'Anonym posten'),
  ('sv', 'community.reply_anon_inactive_title', 'Posta anonymt'),
  ('fi', 'community.reply_anon_inactive_title', 'Lähetä anonyymisti'),

  -- ============================================================
  -- community.anonymous
  -- ============================================================
  ('en', 'community.anonymous', 'Anonymous'),
  ('es', 'community.anonymous', 'Anónimo'),
  ('it', 'community.anonymous', 'Anonimo'),
  ('fr', 'community.anonymous', 'Anonyme'),
  ('de', 'community.anonymous', 'Anonym'),
  ('sv', 'community.anonymous', 'Anonym'),
  ('fi', 'community.anonymous', 'Anonyymi'),

  -- ============================================================
  -- community.reply_post_anonymously
  -- ============================================================
  ('en', 'community.reply_post_anonymously', 'Post anonymously'),
  ('es', 'community.reply_post_anonymously', 'Publicar de forma anónima'),
  ('it', 'community.reply_post_anonymously', 'Pubblica in modo anonimo'),
  ('fr', 'community.reply_post_anonymously', 'Publier anonymement'),
  ('de', 'community.reply_post_anonymously', 'Anonym posten'),
  ('sv', 'community.reply_post_anonymously', 'Posta anonymt'),
  ('fi', 'community.reply_post_anonymously', 'Lähetä anonyymisti'),

  -- ============================================================
  -- community.reply_posting
  -- ============================================================
  ('en', 'community.reply_posting', 'Posting…'),
  ('es', 'community.reply_posting', 'Publicando…'),
  ('it', 'community.reply_posting', 'Pubblicazione in corso…'),
  ('fr', 'community.reply_posting', 'Publication…'),
  ('de', 'community.reply_posting', 'Wird gepostet…'),
  ('sv', 'community.reply_posting', 'Postar…'),
  ('fi', 'community.reply_posting', 'Lähetetään…'),

  -- ============================================================
  -- community.reply_submit
  -- ============================================================
  ('en', 'community.reply_submit', 'Post reply'),
  ('es', 'community.reply_submit', 'Publicar respuesta'),
  ('it', 'community.reply_submit', 'Pubblica risposta'),
  ('fr', 'community.reply_submit', 'Publier la réponse'),
  ('de', 'community.reply_submit', 'Antwort posten'),
  ('sv', 'community.reply_submit', 'Posta svar'),
  ('fi', 'community.reply_submit', 'Lähetä vastaus'),

  -- ============================================================
  -- community.reply_anon_disclaimer
  -- ============================================================
  ('en', 'community.reply_anon_disclaimer', 'Your name will not be shown with this reply.'),
  ('es', 'community.reply_anon_disclaimer', 'Tu nombre no se mostrará con esta respuesta.'),
  ('it', 'community.reply_anon_disclaimer', 'Il tuo nome non verrà mostrato con questa risposta.'),
  ('fr', 'community.reply_anon_disclaimer', 'Votre nom ne sera pas affiché avec cette réponse.'),
  ('de', 'community.reply_anon_disclaimer', 'Dein Name wird nicht mit dieser Antwort angezeigt.'),
  ('sv', 'community.reply_anon_disclaimer', 'Ditt namn visas inte med detta svar.'),
  ('fi', 'community.reply_anon_disclaimer', 'Nimeäsi ei näytetä tämän vastauksen yhteydessä.'),

  -- ============================================================
  -- billing.portal_no_url
  -- ============================================================
  ('en', 'billing.portal_no_url', 'No billing portal URL received.'),
  ('es', 'billing.portal_no_url', 'No billing portal URL received.'),
  ('it', 'billing.portal_no_url', 'No billing portal URL received.'),
  ('fr', 'billing.portal_no_url', 'No billing portal URL received.'),
  ('de', 'billing.portal_no_url', 'No billing portal URL received.'),
  ('sv', 'billing.portal_no_url', 'No billing portal URL received.'),
  ('fi', 'billing.portal_no_url', 'No billing portal URL received.'),

  -- ============================================================
  -- billing.portal_error
  -- ============================================================
  ('en', 'billing.portal_error', 'Failed to open billing portal. Please try again.'),
  ('es', 'billing.portal_error', 'Error al abrir el portal de facturación. Inténtalo de nuevo.'),
  ('it', 'billing.portal_error', 'Impossibile aprire il portale di fatturazione. Riprova.'),
  ('fr', 'billing.portal_error', 'Impossible d''ouvrir le portail de facturation. Veuillez réessayer.'),
  ('de', 'billing.portal_error', 'Abrechnungsportal konnte nicht geöffnet werden. Bitte versuche es erneut.'),
  ('sv', 'billing.portal_error', 'Det gick inte att öppna faktureringsportalen. Försök igen.'),
  ('fi', 'billing.portal_error', 'Laskutusportaalin avaaminen epäonnistui. Yritä uudelleen.'),

  -- ============================================================
  -- billing.portal_opening
  -- ============================================================
  ('en', 'billing.portal_opening', 'Opening…'),
  ('es', 'billing.portal_opening', 'Abriendo…'),
  ('it', 'billing.portal_opening', 'Apertura in corso…'),
  ('fr', 'billing.portal_opening', 'Ouverture…'),
  ('de', 'billing.portal_opening', 'Öffnet…'),
  ('sv', 'billing.portal_opening', 'Öppnar…'),
  ('fi', 'billing.portal_opening', 'Avataan…'),

  -- ============================================================
  -- billing.manage_billing
  -- ============================================================
  ('en', 'billing.manage_billing', 'Manage billing'),
  ('es', 'billing.manage_billing', 'Gestionar facturación'),
  ('it', 'billing.manage_billing', 'Gestisci fatturazione'),
  ('fr', 'billing.manage_billing', 'Gérer la facturation'),
  ('de', 'billing.manage_billing', 'Abrechnung verwalten'),
  ('sv', 'billing.manage_billing', 'Hantera fakturering'),
  ('fi', 'billing.manage_billing', 'Hallinnoi laskutusta'),

  -- ============================================================
  -- choose_plan.checkout_failed
  -- ============================================================
  ('en', 'choose_plan.checkout_failed', 'Failed to start checkout process. Please try again.'),
  ('es', 'choose_plan.checkout_failed', 'Error al iniciar el proceso de pago. Inténtalo de nuevo.'),
  ('it', 'choose_plan.checkout_failed', 'Impossibile avviare il processo di pagamento. Riprova.'),
  ('fr', 'choose_plan.checkout_failed', 'Impossible de démarrer le processus de paiement. Veuillez réessayer.'),
  ('de', 'choose_plan.checkout_failed', 'Checkout-Prozess konnte nicht gestartet werden. Bitte versuche es erneut.'),
  ('sv', 'choose_plan.checkout_failed', 'Det gick inte att starta betalningsprocessen. Försök igen.'),
  ('fi', 'choose_plan.checkout_failed', 'Kassaprosessin aloittaminen epäonnistui. Yritä uudelleen.')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
