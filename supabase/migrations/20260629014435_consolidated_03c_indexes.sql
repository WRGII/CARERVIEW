/*
  Consolidated Schema - Part 3c: Indexes
*/

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_observations_user_id ON public.observations(user_id);
CREATE INDEX IF NOT EXISTS idx_observations_team_id ON public.observations(team_id);
CREATE INDEX IF NOT EXISTS idx_observations_caregiver_email ON public.observations(caregiver_email);
CREATE INDEX IF NOT EXISTS idx_observations_user_form_type_idx ON public.observations(user_id, form_type);
CREATE INDEX IF NOT EXISTS idx_responses_observation_id ON public.responses(observation_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON public.responses(question_id);
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON public.questions(category_id);

-- Community indexes
CREATE INDEX IF NOT EXISTS community_profiles_handle_idx
  ON public.community_profiles (lower(handle));

CREATE INDEX IF NOT EXISTS community_rooms_sort_idx
  ON public.community_rooms (sort_order, is_active);

CREATE INDEX IF NOT EXISTS community_posts_room_status_idx
  ON public.community_posts (room_id, post_status, last_activity_at DESC);

CREATE INDEX IF NOT EXISTS community_posts_author_idx
  ON public.community_posts (author_user_id);

CREATE INDEX IF NOT EXISTS community_posts_created_at_idx
  ON public.community_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS community_replies_post_status_idx
  ON public.community_replies (post_id, reply_status, created_at ASC);

CREATE INDEX IF NOT EXISTS community_replies_author_idx
  ON public.community_replies (author_user_id);

CREATE INDEX IF NOT EXISTS community_reports_status_idx
  ON public.community_reports (report_status, created_at DESC);

CREATE INDEX IF NOT EXISTS community_reports_reporter_idx
  ON public.community_reports (reporter_user_id);

CREATE INDEX IF NOT EXISTS community_reactions_post_idx
  ON public.community_reactions (post_id);

CREATE INDEX IF NOT EXISTS community_reactions_user_idx
  ON public.community_reactions (user_id);

-- Guest tokens indexes
CREATE INDEX IF NOT EXISTS idx_guest_tokens_team_id ON public.cv_guest_tokens(team_id);
CREATE INDEX IF NOT EXISTS idx_guest_tokens_invited_by ON public.cv_guest_tokens(invited_by_user_id);

-- i18n indexes
CREATE INDEX IF NOT EXISTS idx_ui_translations_locale ON public.ui_translations(locale);
CREATE INDEX IF NOT EXISTS idx_ui_translations_locale_ns ON public.ui_translations(locale, namespace);

-- Rate limit log indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_lookup ON public.rate_limit_log(identifier, endpoint, window_start);

-- Community notifications indexes
CREATE INDEX IF NOT EXISTS idx_community_notifications_user ON public.community_notifications(user_id, read, created_at DESC);
