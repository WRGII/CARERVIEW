/*
  # Community Notifications Table

  ## Purpose
  Stores in-app notifications sent to community members when admin takes moderation actions.
  Members see these notifications in the community UI to understand why content was actioned.

  ## New Tables
  - `community_notifications`
    - `id` (uuid, pk)
    - `user_id` (uuid, FK to profiles) — recipient
    - `type` (text) — 'post_flagged' | 'post_removed' | 'reply_removed' | 'account_banned' | 'advisory'
    - `subject` (text) — short subject line
    - `message` (text) — full message body from admin
    - `post_id` (uuid, nullable) — related post if applicable
    - `reply_id` (uuid, nullable) — related reply if applicable
    - `is_read` (boolean)
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Users can only read their own notifications
  - Only service role (admin actions) can insert
  - Users can update is_read on their own notifications
*/

CREATE TABLE IF NOT EXISTS community_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type = ANY (ARRAY[
    'post_flagged',
    'post_removed',
    'reply_removed',
    'account_banned',
    'advisory'
  ])),
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  post_id uuid REFERENCES community_posts(id) ON DELETE SET NULL,
  reply_id uuid REFERENCES community_replies(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_notifications_user_idx ON community_notifications(user_id, is_read, created_at DESC);

ALTER TABLE community_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON community_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications read"
  ON community_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications"
  ON community_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
