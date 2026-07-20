/*
# Error Logging Table and Error i18n Keys

## 1. Purpose
This migration creates the infrastructure for comprehensive error handling:
- A durable `error_logs` table for persisting client-side errors to Supabase.
- Translation keys for user-friendly error messages across all 8 supported locales.

## 2. New Tables
- `error_logs`
  - `id` (uuid, primary key)
  - `user_id` (uuid, nullable — errors can occur before login)
  - `severity` (text: 'low' | 'medium' | 'high' | 'critical')
  - `error_class` (text: 'network' | 'auth' | 'rate_limit' | 'server' | 'validation' | 'offline' | 'unknown')
  - `message` (text, not null)
  - `stack` (text, nullable)
  - `url` (text, nullable — page URL where error occurred)
  - `user_agent` (text, nullable)
  - `created_at` (timestamptz, default now())

## 3. Security
- RLS enabled on `error_logs`.
- Authenticated users can INSERT their own error logs (user_id = auth.uid() OR user_id IS NULL for pre-login errors).
- Authenticated users can SELECT only their own error logs.
- No UPDATE or DELETE from the client — errors are append-only from the frontend.
- Service role (admin) can read all logs.

## 4. i18n Seeds
- Seeds `errors.*` namespace keys into `ui_translations` for all 8 locales (en, es, it, fr, de, sv, fi, ja).
- Keys: network_failure, auth_expired, auth_invalid, rate_limited, server_error, validation_failed, offline, unknown, boundary_title, boundary_description, boundary_retry, boundary_dashboard, boundary_details, boundary_hide, offline_banner_title, offline_banner_body, cached_data_notice.
*/

-- ============================================================
-- 1. error_logs table
-- ============================================================
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  error_class text NOT NULL DEFAULT 'unknown' CHECK (error_class IN ('network', 'auth', 'rate_limit', 'server', 'validation', 'offline', 'unknown')),
  message text NOT NULL,
  stack text,
  url text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own logs (or logs with null user_id for pre-login errors)
DROP POLICY IF EXISTS "insert_own_error_logs" ON error_logs;
CREATE POLICY "insert_own_error_logs" ON error_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Authenticated users can read only their own logs
DROP POLICY IF EXISTS "select_own_error_logs" ON error_logs;
CREATE POLICY "select_own_error_logs" ON error_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- No UPDATE or DELETE policies — errors are append-only from the client

-- Index for querying by user and time
CREATE INDEX IF NOT EXISTS idx_error_logs_user_created ON error_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs (severity);

-- ============================================================
-- 2. i18n error translation keys
-- ============================================================

-- English
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('en', 'errors', 'network_failure', 'Network connection failed. Please check your internet and try again.'),
  ('en', 'errors', 'auth_expired', 'Your session has expired. Please sign in again.'),
  ('en', 'errors', 'auth_invalid', 'Invalid email or password.'),
  ('en', 'errors', 'rate_limited', 'Too many requests. Please wait a moment and try again.'),
  ('en', 'errors', 'server_error', 'Something went wrong on our end. Please try again.'),
  ('en', 'errors', 'validation_failed', 'Please check the highlighted fields and try again.'),
  ('en', 'errors', 'offline', 'You are offline. Some features may be unavailable.'),
  ('en', 'errors', 'unknown', 'An unexpected error occurred. Please try again.'),
  ('en', 'errors', 'boundary_title', 'Something went wrong'),
  ('en', 'errors', 'boundary_description', 'An unexpected error occurred. You can try again or return to the dashboard.'),
  ('en', 'errors', 'boundary_retry', 'Try again'),
  ('en', 'errors', 'boundary_dashboard', 'Go to dashboard'),
  ('en', 'errors', 'boundary_details', 'Show error details'),
  ('en', 'errors', 'boundary_hide', 'Hide details'),
  ('en', 'errors', 'offline_banner_title', 'You are offline'),
  ('en', 'errors', 'offline_banner_body', 'Showing cached data. Changes will sync when you reconnect.'),
  ('en', 'errors', 'cached_data_notice', 'Showing cached data')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Spanish
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('es', 'errors', 'network_failure', 'Error de conexión. Verifique su internet e inténtelo de nuevo.'),
  ('es', 'errors', 'auth_expired', 'Su sesión ha expirado. Por favor inicie sesión de nuevo.'),
  ('es', 'errors', 'auth_invalid', 'Correo o contraseña inválidos.'),
  ('es', 'errors', 'rate_limited', 'Demasiadas solicitudes. Espere un momento e inténtelo de nuevo.'),
  ('es', 'errors', 'server_error', 'Algo salió mal de nuestro lado. Por favor inténtelo de nuevo.'),
  ('es', 'errors', 'validation_failed', 'Revise los campos resaltados e inténtelo de nuevo.'),
  ('es', 'errors', 'offline', 'Está sin conexión. Algunas funciones pueden no estar disponibles.'),
  ('es', 'errors', 'unknown', 'Ocurrió un error inesperado. Por favor inténtelo de nuevo.'),
  ('es', 'errors', 'boundary_title', 'Algo salió mal'),
  ('es', 'errors', 'boundary_description', 'Ocurrió un error inesperado. Puede intentar de nuevo o volver al panel.'),
  ('es', 'errors', 'boundary_retry', 'Intentar de nuevo'),
  ('es', 'errors', 'boundary_dashboard', 'Ir al panel'),
  ('es', 'errors', 'boundary_details', 'Mostrar detalles del error'),
  ('es', 'errors', 'boundary_hide', 'Ocultar detalles'),
  ('es', 'errors', 'offline_banner_title', 'Sin conexión'),
  ('es', 'errors', 'offline_banner_body', 'Mostrando datos en caché. Los cambios se sincronizarán al reconectar.'),
  ('es', 'errors', 'cached_data_notice', 'Mostrando datos en caché')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Italian
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('it', 'errors', 'network_failure', 'Connessione di rete fallita. Controlla la tua connessione e riprova.'),
  ('it', 'errors', 'auth_expired', 'La sessione è scaduta. Accedi di nuovo.'),
  ('it', 'errors', 'auth_invalid', 'Email o password non validi.'),
  ('it', 'errors', 'rate_limited', 'Troppe richieste. Attendi un momento e riprova.'),
  ('it', 'errors', 'server_error', 'Qualcosa è andato storto da noi. Riprova.'),
  ('it', 'errors', 'validation_failed', 'Controlla i campi evidenziati e riprova.'),
  ('it', 'errors', 'offline', 'Sei offline. Alcune funzioni potrebbero non essere disponibili.'),
  ('it', 'errors', 'unknown', 'Si è verificato un errore imprevisto. Riprova.'),
  ('it', 'errors', 'boundary_title', 'Qualcosa è andato storto'),
  ('it', 'errors', 'boundary_description', 'Si è verificato un errore imprevisto. Puoi riprovare o tornare alla dashboard.'),
  ('it', 'errors', 'boundary_retry', 'Riprova'),
  ('it', 'errors', 'boundary_dashboard', 'Vai alla dashboard'),
  ('it', 'errors', 'boundary_details', 'Mostra dettagli errore'),
  ('it', 'errors', 'boundary_hide', 'Nascondi dettagli'),
  ('it', 'errors', 'offline_banner_title', 'Sei offline'),
  ('it', 'errors', 'offline_banner_body', 'Mostrando dati in cache. Le modifiche si sincronizzeranno alla riconnessione.'),
  ('it', 'errors', 'cached_data_notice', 'Mostrando dati in cache')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- French
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('fr', 'errors', 'network_failure', 'Échec de la connexion réseau. Vérifiez votre connexion et réessayez.'),
  ('fr', 'errors', 'auth_expired', 'Votre session a expiré. Veuillez vous reconnecter.'),
  ('fr', 'errors', 'auth_invalid', 'Email ou mot de passe invalide.'),
  ('fr', 'errors', 'rate_limited', 'Trop de requêtes. Patientez un instant et réessayez.'),
  ('fr', 'errors', 'server_error', 'Un problème est survenu de notre côté. Veuillez réessayer.'),
  ('fr', 'errors', 'validation_failed', 'Vérifiez les champs surlignés et réessayez.'),
  ('fr', 'errors', 'offline', 'Vous êtes hors ligne. Certaines fonctionnalités peuvent être indisponibles.'),
  ('fr', 'errors', 'unknown', 'Une erreur inattendue est survenue. Veuillez réessayer.'),
  ('fr', 'errors', 'boundary_title', 'Une erreur est survenue'),
  ('fr', 'errors', 'boundary_description', 'Une erreur inattendue est survenue. Vous pouvez réessayer ou revenir au tableau de bord.'),
  ('fr', 'errors', 'boundary_retry', 'Réessayer'),
  ('fr', 'errors', 'boundary_dashboard', 'Aller au tableau de bord'),
  ('fr', 'errors', 'boundary_details', 'Afficher les détails'),
  ('fr', 'errors', 'boundary_hide', 'Masquer les détails'),
  ('fr', 'errors', 'offline_banner_title', 'Vous êtes hors ligne'),
  ('fr', 'errors', 'offline_banner_body', 'Affichage des données en cache. Les modifications se synchroniseront à la reconnexion.'),
  ('fr', 'errors', 'cached_data_notice', 'Affichage des données en cache')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- German
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('de', 'errors', 'network_failure', 'Netzwerkverbindung fehlgeschlagen. Überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.'),
  ('de', 'errors', 'auth_expired', 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.'),
  ('de', 'errors', 'auth_invalid', 'Ungültige E-Mail oder Passwort.'),
  ('de', 'errors', 'rate_limited', 'Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.'),
  ('de', 'errors', 'server_error', 'Es ist ein Fehler auf unserer Seite aufgetreten. Bitte versuchen Sie es erneut.'),
  ('de', 'errors', 'validation_failed', 'Bitte überprüfen Sie die markierten Felder und versuchen Sie es erneut.'),
  ('de', 'errors', 'offline', 'Sie sind offline. Einige Funktionen sind möglicherweise nicht verfügbar.'),
  ('de', 'errors', 'unknown', 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'),
  ('de', 'errors', 'boundary_title', 'Etwas ist schiefgelaufen'),
  ('de', 'errors', 'boundary_description', 'Ein unerwarteter Fehler ist aufgetreten. Sie können es erneut versuchen oder zum Dashboard zurückkehren.'),
  ('de', 'errors', 'boundary_retry', 'Erneut versuchen'),
  ('de', 'errors', 'boundary_dashboard', 'Zum Dashboard'),
  ('de', 'errors', 'boundary_details', 'Fehlerdetails anzeigen'),
  ('de', 'errors', 'boundary_hide', 'Details ausblenden'),
  ('de', 'errors', 'offline_banner_title', 'Sie sind offline'),
  ('de', 'errors', 'offline_banner_body', 'Zwischengespeicherte Daten werden angezeigt. Änderungen werden bei der Wiederverbindung synchronisiert.'),
  ('de', 'errors', 'cached_data_notice', 'Zwischengespeicherte Daten')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Swedish
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('sv', 'errors', 'network_failure', 'Nätverksanslutningen misslyckades. Kontrollera din internetanslutning och försök igen.'),
  ('sv', 'errors', 'auth_expired', 'Din session har löpt ut. Logga in igen.'),
  ('sv', 'errors', 'auth_invalid', 'Ogiltig e-post eller lösenord.'),
  ('sv', 'errors', 'rate_limited', 'För många förfrågningar. Vänta en stund och försök igen.'),
  ('sv', 'errors', 'server_error', 'Något gick fel på vår sida. Försök igen.'),
  ('sv', 'errors', 'validation_failed', 'Kontrollera de markerade fälten och försök igen.'),
  ('sv', 'errors', 'offline', 'Du är offline. Vissa funktioner kanske inte är tillgängliga.'),
  ('sv', 'errors', 'unknown', 'Ett oväntat fel uppstod. Försök igen.'),
  ('sv', 'errors', 'boundary_title', 'Något gick fel'),
  ('sv', 'errors', 'boundary_description', 'Ett oväntat fel uppstod. Du kan försöka igen eller återvända till instrumentpanelen.'),
  ('sv', 'errors', 'boundary_retry', 'Försök igen'),
  ('sv', 'errors', 'boundary_dashboard', 'Till instrumentpanelen'),
  ('sv', 'errors', 'boundary_details', 'Visa feldetaljer'),
  ('sv', 'errors', 'boundary_hide', 'Dölj detaljer'),
  ('sv', 'errors', 'offline_banner_title', 'Du är offline'),
  ('sv', 'errors', 'offline_banner_body', 'Visar cachad data. Ändringar synkroniseras när du återansluter.'),
  ('sv', 'errors', 'cached_data_notice', 'Visar cachad data')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Finnish
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('fi', 'errors', 'network_failure', 'Verkkoyhteys epäonnistui. Tarkista internet-yhteytesi ja yritä uudelleen.'),
  ('fi', 'errors', 'auth_expired', 'Istuntosi on vanhentunut. Kirjaudu sisään uudelleen.'),
  ('fi', 'errors', 'auth_invalid', 'Virheellinen sähköposti tai salasana.'),
  ('fi', 'errors', 'rate_limited', 'Liikaa pyyntöjä. Odota hetki ja yritä uudelleen.'),
  ('fi', 'errors', 'server_error', 'Jokin meni vikaan meidän päässä. Yritä uudelleen.'),
  ('fi', 'errors', 'validation_failed', 'Tarkista korostetut kentät ja yritä uudelleen.'),
  ('fi', 'errors', 'offline', 'Olet offline-tilassa. Jotkin ominaisuudet eivät välttämättä ole käytettävissä.'),
  ('fi', 'errors', 'unknown', 'Odottamaton virhe tapahtui. Yritä uudelleen.'),
  ('fi', 'errors', 'boundary_title', 'Jokin meni vikaan'),
  ('fi', 'errors', 'boundary_description', 'Odottamaton virhe tapahtui. Voit yrittää uudelleen tai palata kojelautaan.'),
  ('fi', 'errors', 'boundary_retry', 'Yritä uudelleen'),
  ('fi', 'errors', 'boundary_dashboard', 'Siirry kojelautaan'),
  ('fi', 'errors', 'boundary_details', 'Näytä virhetiedot'),
  ('fi', 'errors', 'boundary_hide', 'Piilota tiedot'),
  ('fi', 'errors', 'offline_banner_title', 'Olet offline-tilassa'),
  ('fi', 'errors', 'offline_banner_body', 'Näytetään välimuistissa olevaa dataa. Muutokset synkronoidaan, kun yhteys palaa.'),
  ('fi', 'errors', 'cached_data_notice', 'Näytetään välimuistissa olevaa dataa')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;

-- Japanese
INSERT INTO ui_translations (locale, namespace, key, value) VALUES
  ('ja', 'errors', 'network_failure', 'ネットワーク接続に失敗しました。インターネット接続を確認して再試行してください。'),
  ('ja', 'errors', 'auth_expired', 'セッションの有効期限が切れました。再度サインインしてください。'),
  ('ja', 'errors', 'auth_invalid', 'メールアドレスまたはパスワードが無効です。'),
  ('ja', 'errors', 'rate_limited', 'リクエストが多すぎます。しばらく待ってから再試行してください。'),
  ('ja', 'errors', 'server_error', 'サーバー側でエラーが発生しました。再試行してください。'),
  ('ja', 'errors', 'validation_failed', 'ハイライトされたフィールドを確認して再試行してください。'),
  ('ja', 'errors', 'offline', 'オフラインです。一部の機能が利用できない場合があります。'),
  ('ja', 'errors', 'unknown', '予期しないエラーが発生しました。再試行してください。'),
  ('ja', 'errors', 'boundary_title', 'エラーが発生しました'),
  ('ja', 'errors', 'boundary_description', '予期しないエラーが発生しました。再試行するかダッシュボードに戻ることができます。'),
  ('ja', 'errors', 'boundary_retry', '再試行'),
  ('ja', 'errors', 'boundary_dashboard', 'ダッシュボードへ'),
  ('ja', 'errors', 'boundary_details', 'エラーの詳細を表示'),
  ('ja', 'errors', 'boundary_hide', '詳細を非表示'),
  ('ja', 'errors', 'offline_banner_title', 'オフラインです'),
  ('ja', 'errors', 'offline_banner_body', 'キャッシュされたデータを表示中。再接続時に変更が同期されます。'),
  ('ja', 'errors', 'cached_data_notice', 'キャッシュされたデータを表示中')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value;
