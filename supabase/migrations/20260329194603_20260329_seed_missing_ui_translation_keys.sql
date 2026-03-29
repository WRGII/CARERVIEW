/*
  # Seed missing UI translation keys

  Adds keys that exist in enFallback.ts but were absent from ui_translations.
  English values are authoritative; other locales copy English as a safe fallback
  (translators can update them later via the Admin Translations page).

  New keys:
  - account_menu.manage_account / restart_tutorial
  - billing.portal_failed
  - checkout.signin_required / signin_body / plan_active_named
  - choose_plan.title / manage_title / current_sub / cancelled / auth_required / activate_failed / sub_default
  - common.opening / back_dashboard
  - create_account.plan_missing_price / incomplete_setup_notice
*/

DO $$
DECLARE
  locales text[] := ARRAY['en','de','es','fi','fr','it','sv'];
  loc text;
  en_vals jsonb := '{
    "account_menu.manage_account": "Manage Account",
    "account_menu.restart_tutorial": "Restart Tutorial",
    "billing.portal_failed": "Could not open the billing portal. Please try again.",
    "checkout.signin_required": "Sign In Required",
    "checkout.signin_body": "Please sign in to confirm your subscription.",
    "checkout.plan_active_named": "Your {plan} plan is now active.",
    "choose_plan.title": "Choose Your Plan",
    "choose_plan.manage_title": "Manage Your Plan",
    "choose_plan.current_sub": "Current Subscription",
    "choose_plan.cancelled": "Your checkout was cancelled. No charge was made.",
    "choose_plan.auth_required": "You must be signed in to select a plan.",
    "choose_plan.activate_failed": "Could not activate the free plan. Please try again.",
    "choose_plan.sub_default": "Your subscription is not active. Choose a plan below to continue.",
    "common.opening": "Opening...",
    "common.back_dashboard": "Back to Dashboard",
    "create_account.plan_missing_price": "This plan is not available for purchase right now. Please contact support.",
    "create_account.incomplete_setup_notice": "Your account was created but setup was not completed. Please choose a plan below to continue."
  }';
  kv record;
BEGIN
  FOR kv IN SELECT key, value FROM jsonb_each_text(en_vals) LOOP
    FOREACH loc IN ARRAY locales LOOP
      INSERT INTO public.ui_translations (locale, key, value)
      VALUES (
        loc,
        kv.key,
        CASE WHEN loc = 'en' THEN kv.value ELSE kv.value END
      )
      ON CONFLICT (locale, key) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
