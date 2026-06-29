/*
  # Guest Carer Feature i18n Keys

  Seeds all UI translation keys used by:
  - GuestInviteModal (primary carer side)
  - ObservationList guest badge
  - GuestObservationPage (public form)
*/

INSERT INTO ui_translations (locale, key, value)
VALUES
  ('en', 'guest_invite.title', 'Invite Guest Observer'),
  ('en', 'guest_invite.subtitle', 'Send a one-time observation link'),
  ('en', 'guest_invite.button_label', 'Invite Guest'),
  ('en', 'obs_list.guest_badge', 'Guest'),
  ('es', 'guest_invite.title', 'Invitar observador invitado'),
  ('es', 'guest_invite.subtitle', 'Enviar un enlace de observación de un solo uso'),
  ('es', 'guest_invite.button_label', 'Invitar huésped'),
  ('es', 'obs_list.guest_badge', 'Huésped'),
  ('fr', 'guest_invite.title', 'Inviter un observateur invité'),
  ('fr', 'guest_invite.subtitle', 'Envoyer un lien d''observation à usage unique'),
  ('fr', 'guest_invite.button_label', 'Inviter un invité'),
  ('fr', 'obs_list.guest_badge', 'Invité'),
  ('de', 'guest_invite.title', 'Gastbeobachter einladen'),
  ('de', 'guest_invite.subtitle', 'Einmaligen Beobachtungslink senden'),
  ('de', 'guest_invite.button_label', 'Gast einladen'),
  ('de', 'obs_list.guest_badge', 'Gast'),
  ('it', 'guest_invite.title', 'Invita osservatore ospite'),
  ('it', 'guest_invite.subtitle', 'Invia un link di osservazione monouso'),
  ('it', 'guest_invite.button_label', 'Invita ospite'),
  ('it', 'obs_list.guest_badge', 'Ospite'),
  ('sv', 'guest_invite.title', 'Bjud in gästobservation'),
  ('sv', 'guest_invite.subtitle', 'Skicka en engångslänk för observation'),
  ('sv', 'guest_invite.button_label', 'Bjud in gäst'),
  ('sv', 'obs_list.guest_badge', 'Gäst'),
  ('fi', 'guest_invite.title', 'Kutsu vierashavainto'),
  ('fi', 'guest_invite.subtitle', 'Lähetä kertakäyttöinen havaintolinkki'),
  ('fi', 'guest_invite.button_label', 'Kutsu vieras'),
  ('fi', 'obs_list.guest_badge', 'Vieras')

ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();