/*
  # Update guest_invite.button_label to "Invite Guest Carer Observation"

  Updates the button text for all supported locales.
*/

INSERT INTO ui_translations (locale, key, value)
VALUES
  ('en', 'guest_invite.button_label', 'Invite Guest Carer Observation'),
  ('es', 'guest_invite.button_label', 'Invitar observación de cuidador invitado'),
  ('fr', 'guest_invite.button_label', 'Inviter une observation d''aidant invité'),
  ('de', 'guest_invite.button_label', 'Gast-Beobachtung einladen'),
  ('it', 'guest_invite.button_label', 'Invita osservazione caregiver ospite'),
  ('sv', 'guest_invite.button_label', 'Bjud in gästobservation'),
  ('fi', 'guest_invite.button_label', 'Kutsu vierashavainto')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;
