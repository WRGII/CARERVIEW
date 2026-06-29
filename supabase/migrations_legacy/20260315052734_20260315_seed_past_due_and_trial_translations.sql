/*
  # Seed translations for past_due payment banner

  ## New keys added
  - inactive.past_due_title  — banner heading when subscription is past_due
  - inactive.past_due_detail — instructions to update payment method
  - inactive.update_payment  — button label linking to billing portal
  - billing.trial_ends       — label for trial end date in billing panel
*/

INSERT INTO public.ui_translations (key, locale, value) VALUES
  ('inactive.past_due_title',  'en', 'Payment failed'),
  ('inactive.past_due_detail', 'en', 'Your last payment did not go through. Please update your payment method to keep access.'),
  ('inactive.update_payment',  'en', 'Update payment method'),
  ('billing.trial_ends',       'en', 'Trial ends'),

  ('inactive.past_due_title',  'es', 'Pago fallido'),
  ('inactive.past_due_detail', 'es', 'Tu último pago no se procesó. Actualiza tu método de pago para mantener el acceso.'),
  ('inactive.update_payment',  'es', 'Actualizar método de pago'),
  ('billing.trial_ends',       'es', 'Prueba finaliza'),

  ('inactive.past_due_title',  'fr', 'Paiement échoué'),
  ('inactive.past_due_detail', 'fr', 'Votre dernier paiement n''a pas abouti. Veuillez mettre à jour votre moyen de paiement.'),
  ('inactive.update_payment',  'fr', 'Mettre à jour le paiement'),
  ('billing.trial_ends',       'fr', 'Fin de l''essai'),

  ('inactive.past_due_title',  'de', 'Zahlung fehlgeschlagen'),
  ('inactive.past_due_detail', 'de', 'Ihre letzte Zahlung ist fehlgeschlagen. Bitte aktualisieren Sie Ihre Zahlungsmethode.'),
  ('inactive.update_payment',  'de', 'Zahlungsmethode aktualisieren'),
  ('billing.trial_ends',       'de', 'Testphase endet'),

  ('inactive.past_due_title',  'it', 'Pagamento non riuscito'),
  ('inactive.past_due_detail', 'it', 'L''ultimo pagamento non è andato a buon fine. Aggiorna il metodo di pagamento.'),
  ('inactive.update_payment',  'it', 'Aggiorna metodo di pagamento'),
  ('billing.trial_ends',       'it', 'Fine prova'),

  ('inactive.past_due_title',  'sv', 'Betalning misslyckades'),
  ('inactive.past_due_detail', 'sv', 'Din senaste betalning gick inte igenom. Uppdatera din betalningsmetod.'),
  ('inactive.update_payment',  'sv', 'Uppdatera betalningsmetod'),
  ('billing.trial_ends',       'sv', 'Provperiod slutar'),

  ('inactive.past_due_title',  'fi', 'Maksu epäonnistui'),
  ('inactive.past_due_detail', 'fi', 'Viimeisin maksusi ei onnistunut. Päivitä maksutapasi pitääksesi pääsyn.'),
  ('inactive.update_payment',  'fi', 'Päivitä maksutapa'),
  ('billing.trial_ends',       'fi', 'Kokeilujakso päättyy')
ON CONFLICT (key, locale) DO UPDATE SET value = EXCLUDED.value;
