/*
  # Add Foreign Key: community_posts.room_id → community_rooms.id

  ## Summary
  Adds the missing FK constraint that PostgREST requires to resolve the
  embedded `room:community_rooms(...)` join used throughout all community
  post queries. Without this FK, every query that selects room data via
  the PostgREST resource embedding syntax silently errors and leaves the
  UI in a permanent loading state.

  ## Changes
  - community_posts: adds FK constraint on room_id referencing community_rooms(id)
    with ON DELETE RESTRICT (prevents deleting a room that still has posts)

  ## Notes
  - Uses IF NOT EXISTS pattern to be idempotent
  - ON DELETE RESTRICT is intentional — rooms should not be deleted while posts exist
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'community_posts'
      AND kcu.column_name = 'room_id'
  ) THEN
    ALTER TABLE community_posts
      ADD CONSTRAINT community_posts_room_id_fkey
      FOREIGN KEY (room_id)
      REFERENCES community_rooms (id)
      ON DELETE RESTRICT;
  END IF;
END $$;
