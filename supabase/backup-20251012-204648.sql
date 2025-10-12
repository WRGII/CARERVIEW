

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "app";


ALTER SCHEMA "app" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "app"."gender" AS ENUM (
    'female',
    'male',
    'nonbinary',
    'unknown'
);


ALTER TYPE "app"."gender" OWNER TO "postgres";


CREATE TYPE "app"."member_state" AS ENUM (
    'active',
    'frozen'
);


ALTER TYPE "app"."member_state" OWNER TO "postgres";


CREATE TYPE "app"."team_role" AS ENUM (
    'owner',
    'member'
);


ALTER TYPE "app"."team_role" OWNER TO "postgres";


CREATE TYPE "public"."cv_gender" AS ENUM (
    'female',
    'male',
    'nonbinary',
    'unknown'
);


ALTER TYPE "public"."cv_gender" OWNER TO "postgres";


CREATE TYPE "public"."cv_member_role" AS ENUM (
    'owner',
    'member'
);


ALTER TYPE "public"."cv_member_role" OWNER TO "postgres";


CREATE TYPE "public"."cv_member_state" AS ENUM (
    'active',
    'frozen'
);


ALTER TYPE "public"."cv_member_state" OWNER TO "postgres";


CREATE TYPE "public"."cv_team_role" AS ENUM (
    'owner',
    'member'
);


ALTER TYPE "public"."cv_team_role" OWNER TO "postgres";


CREATE TYPE "public"."stripe_order_status" AS ENUM (
    'pending',
    'completed',
    'canceled'
);


ALTER TYPE "public"."stripe_order_status" OWNER TO "postgres";


CREATE TYPE "public"."stripe_subscription_status" AS ENUM (
    'not_started',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
);


ALTER TYPE "public"."stripe_subscription_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."_touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'app'
    AS $$
begin
  new.updated_at := now();
  return new;
end
$$;


ALTER FUNCTION "app"."_touch_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."admin_cancel_at_period_end"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  update public.user_subscriptions
  set cancel_at_period_end = true
  where user_id = p_user_id
    and status in ('active','trialing','past_due');

  -- optional: when webhook flips to canceled, call admin_downgrade_to_free(p_user_id)
end;
$$;


ALTER FUNCTION "app"."admin_cancel_at_period_end"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."admin_downgrade_to_free"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select app.admin_set_user_plan(p_user_id, 'free', 'active', now());
$$;


ALTER FUNCTION "app"."admin_downgrade_to_free"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."admin_set_user_plan"("p_user_id" "uuid", "p_plan_id" "text", "p_status" "text" DEFAULT 'active'::"text", "p_start" timestamp with time zone DEFAULT "now"()) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_sub_id text := 'local:' || substr(gen_random_uuid()::text,1,8);
  v_price_id text;
begin
  -- validate plan and fetch its Stripe price_id (may be null for 'free')
  select stripe_price_id
    into v_price_id
  from public.subscription_plans
  where id = p_plan_id;

  if not found then
    raise exception 'Unknown plan_id: %', p_plan_id;
  end if;

  -- close any active/trialing/past_due rows
  update public.user_subscriptions
  set status = 'canceled',
      current_period_end = p_start
  where user_id = p_user_id
    and status in ('active','trialing','past_due');

  -- insert fresh row; price_id mirrors plan's stripe_price_id now
  insert into public.user_subscriptions(
    user_id, subscription_id, plan_id, status,
    current_period_start, current_period_end, cancel_at_period_end, price_id
  ) values (
    p_user_id, v_sub_id, p_plan_id, p_status,
    p_start, null, false, v_price_id
  );
end;
$$;


ALTER FUNCTION "app"."admin_set_user_plan"("p_user_id" "uuid", "p_plan_id" "text", "p_status" "text", "p_start" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."admin_set_user_price"("p_user_id" "uuid", "p_price_id" "text", "p_status" "text" DEFAULT 'active'::"text", "p_start" timestamp with time zone DEFAULT "now"()) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_plan_id text;
begin
  select id into v_plan_id
  from public.subscription_plans
  where stripe_price_id = p_price_id;

  if not found then
    raise exception 'Unknown price_id: %', p_price_id;
  end if;

  perform app.admin_set_user_plan(p_user_id, v_plan_id, p_status, p_start);
end;
$$;


ALTER FUNCTION "app"."admin_set_user_price"("p_user_id" "uuid", "p_price_id" "text", "p_status" "text", "p_start" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."bootstrap_login"("_display_name" "text", "_email" "text") RETURNS TABLE("raw_token" "text", "role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_role text;
BEGIN
  v_role := CASE
              WHEN lower(_email) = 'william.griffith@grifii.com' THEN 'admin'
              ELSE 'caregiver'
            END;

  -- Reuse your existing generator so we don't change any internals
  RETURN QUERY
  SELECT t.raw_token, v_role
  FROM app.generate_token(_role => v_role, _display_name => _display_name, _email => _email) AS t;
END;
$$;


ALTER FUNCTION "app"."bootstrap_login"("_display_name" "text", "_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."can_insert_observation"("u" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    SET "search_path" TO 'pg_catalog', 'app'
    AS $$
declare
  pid text;
  pwin text;            -- 'week' | 'month' | 'first30d'
  limit_n int;
  start_window timestamptz;
  end_window   timestamptz;
  taken int;
  now_ts timestamptz := now();
  user_created timestamptz;
begin
  -- Admins bypass
  if app.is_admin(u) then
    return true;
  end if;

  -- Resolve plan (default to free)
  select s.plan_id into pid
  from app.user_subscriptions s
  where s.user_id = u and s.status = 'active';

  if pid is null then pid := 'free'; end if;

  select obs_limit, usage_window into limit_n, pwin
  from app.subscription_plans
  where id = pid;

  if limit_n is null then
    return true; -- unlimited
  end if;

  -- Get account creation for free-window
  select coalesce(p.created_at, now_ts) into user_created
  from public.profiles p where p.id = u;

  -- Window anchors (UTC)
  if pwin = 'week' then
    -- CURRENTLY Monday 00:00 UTC via date_trunc('week')
    -- To switch to Sunday 00:00 UTC, replace next line with:
    -- start_window := date_trunc('week', now_ts) - interval '1 day';
    start_window := date_trunc('week', now_ts);
    end_window   := start_window + interval '7 days';
  elsif pwin = 'month' then
    start_window := date_trunc('month', now_ts);
    end_window   := start_window + interval '1 month';
  elsif pwin = 'first30d' then
    start_window := user_created;
    end_window   := user_created + interval '30 days';
    if now_ts >= end_window then
      return false; -- free period ended
    end if;
  else
    return false; -- unknown window -> deny
  end if;

  select count(*) into taken
  from public.observations o
  where o.user_id = u
    and o.created_at >= start_window
    and o.created_at <  end_window;

  return taken < limit_n;
end;
$$;


ALTER FUNCTION "app"."can_insert_observation"("u" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."get_current_role"() RETURNS "text"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'app', 'public', 'pg_temp'
    AS $$
  SELECT COALESCE(current_setting('app.current_role', true), 'anonymous');
$$;


ALTER FUNCTION "app"."get_current_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."get_current_token_id"() RETURNS "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT COALESCE(current_setting('app.current_token_id', true), '00000000-0000-0000-0000-000000000000')::uuid;
$$;


ALTER FUNCTION "app"."get_current_token_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND LOWER(email) = 'william.griffith@grifii.com'
  );
$$;


ALTER FUNCTION "app"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."is_admin"("_uid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'pg_catalog', 'app'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = _uid
      and role = 'admin'
      and coalesce(disabled,false) = false
  );
$$;


ALTER FUNCTION "app"."is_admin"("_uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."jwt_role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$ select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role','') $$;


ALTER FUNCTION "app"."jwt_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."obs_owned_by_user"("obs_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1
    from public.observations o
    where o.id = obs_id
      and o.user_id = (select auth.uid())
  );
$$;


ALTER FUNCTION "app"."obs_owned_by_user"("obs_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."on_user_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  -- if the user somehow already has a sub, skip
  if exists (
    select 1 from public.user_subscriptions
    where user_id = new.id
      and status in ('active','trialing','past_due')
  ) then
    return new;
  end if;

  -- assign Free plan explicitly
  perform app.admin_set_user_plan(new.id, 'free', 'active', now());
  return new;
end;
$$;


ALTER FUNCTION "app"."on_user_signup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."tg_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'app'
    AS $$
begin
  new.updated_at := now();
  return new;
end $$;


ALTER FUNCTION "app"."tg_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."upsert_user_subscription_from_stripe"("p_customer_id" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'app', 'public'
    AS $$
declare
  v_user_id uuid;
  v_price_id text;
  v_plan_id  text;
  v_status   text;
  v_start    timestamptz;
  v_end      timestamptz;
begin
  -- map stripe customer -> user
  select user_id into v_user_id
  from public.stripe_customers
  where customer_id = p_customer_id;

  if v_user_id is null then
    raise notice 'No user found for customer %', p_customer_id;
    return;
  end if;

  -- get latest subscription mirror (assumes one active sub per customer)
  select s.price_id,
         s.status,
         to_timestamp(s.current_period_start) at time zone 'utc',
         to_timestamp(s.current_period_end)   at time zone 'utc'
    into v_price_id, v_status, v_start, v_end
  from public.stripe_subscriptions s
  where s.customer_id = p_customer_id
  order by s.updated_at desc nulls last
  limit 1;

  -- resolve price -> plan
  select plan_id into v_plan_id
  from app.v_plan_by_price
  where stripe_price_id = v_price_id;

  -- upsert app-facing row
  insert into app.user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
  values (v_user_id, v_plan_id, v_status, v_start, v_end)
  on conflict (user_id) do update
    set plan_id = excluded.plan_id,
        status  = excluded.status,
        current_period_start = excluded.current_period_start,
        current_period_end   = excluded.current_period_end,
        updated_at = now();
end;
$$;


ALTER FUNCTION "app"."upsert_user_subscription_from_stripe"("p_customer_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."validate_token"("_raw_token" "text") RETURNS TABLE("token_id" "uuid", "role" "text", "valid" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  v_secret text;
  v_hash   text;
  v_row    access_tokens%rowtype;
begin
  -- Turn on a per-request flag so RLS can allow this specific read
  perform set_config('app.allow_validate', 'on', true);

  select hash_secret into v_secret from app_secrets where id is true;
  if v_secret is null then
    return query select null::uuid, null::text, false;
  end if;

  -- Hash raw token + secret (explicit ::bytea cast)
  select encode(digest((_raw_token || v_secret)::bytea, 'sha256'), 'hex')
  into v_hash;

  -- Read token row (RLS will allow because of the flag we just set)
  select * into v_row
  from access_tokens
  where token_hash = v_hash;

  if v_row.id is null
     or v_row.is_active is not true
     or (v_row.expires_at is not null and v_row.expires_at <= now()) then
    return query select null::uuid, null::text, false;
  else
    return query select v_row.id, v_row.role, true;
  end if;
end
$$;


ALTER FUNCTION "app"."validate_token"("_raw_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app"."window_start_for"("win" "text") RETURNS timestamp with time zone
    LANGUAGE "sql" IMMUTABLE
    AS $_$
  select case lower($1)
    when 'year'  then date_trunc('day', now() - interval '1 year')
    when 'month' then date_trunc('day', now() - interval '1 month')
    when 'week'  then date_trunc('day', now() - interval '1 week')
    else date_trunc('day', now() - interval '1 year')
  end
$_$;


ALTER FUNCTION "app"."window_start_for"("win" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_create_observation"("uid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select coalesce(r.remaining, 0) > 0
  from app.v_observation_remaining r
  where r.user_id = uid
$$;


ALTER FUNCTION "public"."can_create_observation"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_accept_invite"("p_token" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare v_inv record;
begin
  select i.*
  into v_inv
  from public.cv_team_invites i
  where encode(i.token_hash,'hex') = encode(digest(p_token,'sha256'),'hex')
    and i.consumed_at is null
    and i.expires_at > now()
  limit 1;

  if not found then
    raise exception 'Invalid or expired invite';
  end if;

  insert into public.cv_team_members(team_id, user_id, role, state)
  values (v_inv.team_id, auth.uid(), 'member', 'active')
  on conflict (user_id, team_id) do update
    set revoked_at = null, state = 'active';

  update public.cv_team_invites
  set consumed_at = now()
  where id = v_inv.id;

  return v_inv.team_id;
end $$;


ALTER FUNCTION "public"."cv_accept_invite"("p_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_apply_plan_to_owner_teams"("p_owner" "uuid", "p_plan_id" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare r record;
begin
  for r in select id from public.cv_team where owner_user_id = p_owner loop
    perform public.cv_apply_team_plan(r.id, p_plan_id);
  end loop;
end $$;


ALTER FUNCTION "public"."cv_apply_plan_to_owner_teams"("p_owner" "uuid", "p_plan_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_apply_team_plan"("p_team" "uuid", "p_plan_id" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare v_seats int;
begin
  update public.cv_team set plan_id = p_plan_id where id = p_team;

  select seats_limit into v_seats
  from public.subscription_plans
  where id = p_plan_id;

  if v_seats is null then
    -- default solo seat: 1 owner only
    v_seats := 1;
  end if;

  perform public.cv_freeze_extras_fifo(p_team, v_seats);
end $$;


ALTER FUNCTION "public"."cv_apply_team_plan"("p_team" "uuid", "p_plan_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_can_create_observation_team"("p_team" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare cap int; used int;
begin
  select sp.observations_quota_year into cap
  from public.cv_team t
  join public.subscription_plans sp on sp.id = t.plan_id
  where t.id = p_team;

  if cap is null or cap <= 0 then
    return true; -- unlimited
  end if;

  -- count this year's team observations
  select count(*) into used
  from public.observations o
  where o.team_id = p_team
    and date_trunc('year', o.created_at) = date_trunc('year', now());

  return used < cap;
end $$;


ALTER FUNCTION "public"."cv_can_create_observation_team"("p_team" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_check_seat_cap"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare cap int; active_count int;
begin
  if new.role = 'owner' then return new; end if;

  select pl.seats into cap
  from public.cv_plan_limits pl
  join public.cv_team t on t.plan_id = pl.plan_id
  where t.id = new.team_id;

  select count(*) into active_count
  from public.cv_team_members m
  where m.team_id = new.team_id and m.state = 'active' and m.role = 'member';

  if active_count >= cap - 1 then
    raise exception 'Seat cap reached';
  end if;
  return new;
end $$;


ALTER FUNCTION "public"."cv_check_seat_cap"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_check_team_seats"("p_team" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
  v_seat_limit integer;
  v_current_count integer;
BEGIN
  -- Get seat limit from cv_plan_limits via team's plan_id
  SELECT cpl.seats
  INTO v_seat_limit
  FROM public.cv_team t
  JOIN public.cv_plan_limits cpl ON cpl.plan_id = t.plan_id
  WHERE t.id = p_team;

  -- If no limit found, deny
  IF v_seat_limit IS NULL THEN
    RETURN false;
  END IF;

  -- Count current active members
  SELECT COUNT(*)
  INTO v_current_count
  FROM public.cv_team_members
  WHERE team_id = p_team
    AND state = 'active';

  -- Return whether there's room
  RETURN v_current_count < v_seat_limit;
END;
$$;


ALTER FUNCTION "public"."cv_check_team_seats"("p_team" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_create_invite"("p_team" "uuid", "p_email" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_token text;
  v_token_hash bytea;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify caller is owner or active member of this team
  IF NOT EXISTS (
    SELECT 1
    FROM public.cv_team_members
    WHERE team_id = p_team
      AND user_id = v_user_id
      AND state = 'active'
  ) THEN
    RAISE EXCEPTION 'Not authorized to create invites for this team';
  END IF;

  -- Check if team has available seats
  IF NOT public.cv_check_team_seats(p_team) THEN
    RAISE EXCEPTION 'Team has reached maximum seat capacity';
  END IF;

  -- Generate random token (32 bytes = 64 hex chars)
  v_token := encode(gen_random_bytes(32), 'hex');

  -- Hash token for storage
  v_token_hash := digest(v_token, 'sha256');

  -- Insert invite record
  INSERT INTO public.cv_team_invites (
    team_id,
    email,
    token_hash,
    expires_at,
    created_by
  ) VALUES (
    p_team,
    p_email,
    v_token_hash,
    now() + interval '7 days',
    v_user_id
  );

  -- Return plaintext token (only time it's visible)
  RETURN v_token;
END;
$$;


ALTER FUNCTION "public"."cv_create_invite"("p_team" "uuid", "p_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_create_team_with_patient"("p_name" "text", "p_plan_id" "text", "p_patient_name" "text", "p_dob" "date" DEFAULT NULL::"date", "p_gender" "public"."cv_gender" DEFAULT 'unknown'::"public"."cv_gender", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare v_team uuid;
begin
  insert into public.cv_team(name, owner_user_id, plan_id)
  values (p_name, auth.uid(), p_plan_id)
  returning id into v_team;

  insert into public.cv_team_members(team_id, user_id, role)
  values (v_team, auth.uid(), 'owner');

  insert into public.cv_team_patient(team_id, full_name, date_of_birth, gender, notes)
  values (v_team, p_patient_name, p_dob, p_gender, p_notes);

  update public.profiles set active_team_id = v_team where id = auth.uid();

  return v_team;
end $$;


ALTER FUNCTION "public"."cv_create_team_with_patient"("p_name" "text", "p_plan_id" "text", "p_patient_name" "text", "p_dob" "date", "p_gender" "public"."cv_gender", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_freeze_extras_fifo"("p_team" "uuid", "p_allow_seats" integer) RETURNS "void"
    LANGUAGE "sql"
    AS $$
  with ranked as (
    select user_id, row_number() over (order by joined_at asc) rn
    from public.cv_team_members
    where team_id = p_team and role = 'member' and revoked_at is null
  )
  update public.cv_team_members m
  set state = case
    when r.rn > greatest(p_allow_seats - 1,0) then 'frozen'::public.cv_member_state
    else 'active'::public.cv_member_state
  end
  from ranked r
  where m.team_id = p_team and m.user_id = r.user_id;
$$;


ALTER FUNCTION "public"."cv_freeze_extras_fifo"("p_team" "uuid", "p_allow_seats" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_get_active_team"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select active_team_id from public.profiles where id = auth.uid();
$$;


ALTER FUNCTION "public"."cv_get_active_team"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_is_team_member"("p_team" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1 from public.cv_team_members
    where team_id = p_team and user_id = auth.uid() and revoked_at is null
  );
$$;


ALTER FUNCTION "public"."cv_is_team_member"("p_team" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_list_members"("p_team" "uuid") RETURNS TABLE("user_id" "uuid", "role" "public"."cv_team_role", "state" "public"."cv_member_state", "joined_at" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select user_id, role, state, joined_at
  from public.cv_team_members
  where team_id = p_team and public.cv_is_team_member(p_team);
$$;


ALTER FUNCTION "public"."cv_list_members"("p_team" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_obs_quota_guard"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare ok boolean;
begin
  -- Solo user: no team
  if new.team_id is null then
    begin
      select public.can_create_observation(new.user_id) into ok;
      if ok is false then
        raise exception 'User quota reached';
      end if;
    exception when undefined_function then
      -- no-op if function not defined
      null;
    end;
    return new;
  end if;

  -- Team user: has team
  begin
    select public.cv_can_create_observation_team(new.team_id) into ok;
    if ok is false then
      raise exception 'Team quota reached';
    end if;
  exception when undefined_function then
    null;
  end;

  return new;
end
$$;


ALTER FUNCTION "public"."cv_obs_quota_guard"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_obs_set_team_on_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if new.author_user_id is null then
    new.author_user_id := auth.uid();
  end if;
  if new.team_id is null then
    select active_team_id into new.team_id
    from public.profiles
    where id = auth.uid();
  end if;
  return new;
end $$;


ALTER FUNCTION "public"."cv_obs_set_team_on_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_remove_member"("p_team" "uuid", "p_user" "uuid") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  delete from public.cv_team_members
  where team_id = p_team
    and user_id = p_user
    and exists (
      select 1 from public.cv_team t
      where t.id = p_team and t.owner_user_id = auth.uid()
    );
$$;


ALTER FUNCTION "public"."cv_remove_member"("p_team" "uuid", "p_user" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_revoke_invite"("p_invite" "uuid") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  update public.cv_team_invites
  set expires_at = now(), consumed_at = now()
  where id = p_invite
    and team_id in (
      select id from public.cv_team where owner_user_id = auth.uid()
    );
$$;


ALTER FUNCTION "public"."cv_revoke_invite"("p_invite" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_set_active_team"("p_team" "uuid") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  update public.profiles
  set active_team_id = p_team, updated_at = now()
  where id = auth.uid();
$$;


ALTER FUNCTION "public"."cv_set_active_team"("p_team" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_transfer_owner"("p_team" "uuid", "p_new_owner" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  if (select owner_user_id from public.cv_team where id = p_team) <> auth.uid() then
    raise exception 'Only owner can transfer';
  end if;

  update public.cv_team_members
  set role = 'member'
  where team_id = p_team and user_id = auth.uid();

  update public.cv_team_members
  set role = 'owner'
  where team_id = p_team and user_id = p_new_owner;

  update public.cv_team
  set owner_user_id = p_new_owner
  where id = p_team;
end $$;


ALTER FUNCTION "public"."cv_transfer_owner"("p_team" "uuid", "p_new_owner" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_unfreeze_up_to"("p_team" "uuid", "p_allow_seats" integer) RETURNS "void"
    LANGUAGE "sql"
    AS $$
  with ranked as (
    select user_id, row_number() over (order by joined_at asc) rn
    from public.cv_team_members
    where team_id = p_team and role = 'member' and revoked_at is null
  )
  update public.cv_team_members m
  set state = case
    when r.rn <= greatest(p_allow_seats - 1,0) then 'active'::public.cv_member_state
    else 'frozen'::public.cv_member_state
  end
  from ranked r
  where m.team_id = p_team and m.user_id = r.user_id;
$$;


ALTER FUNCTION "public"."cv_unfreeze_up_to"("p_team" "uuid", "p_allow_seats" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cv_user_role_in_team"("p_team" "uuid") RETURNS "public"."cv_team_role"
    LANGUAGE "sql" STABLE
    AS $$
  select role from public.cv_team_members
  where team_id = p_team and user_id = auth.uid() and revoked_at is null;
$$;


ALTER FUNCTION "public"."cv_user_role_in_team"("p_team" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_single_admin_by_email"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF NEW.email = 'william.griffith@grifii.com' THEN
    NEW.role := 'admin';
  ELSIF NEW.role = 'admin' THEN
    NEW.role := 'caregiver';
  END IF;
  RETURN NEW;
END
$$;


ALTER FUNCTION "public"."enforce_single_admin_by_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_validate_response_against_observation_form_type"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  obs_type text;
  q_type   text;
begin
  -- Find the observation's form_type
  select o.form_type into obs_type
  from public.observations o
  where o.id = new.observation_id;

  -- Find the question's category.type (ADL/IADL)
  select c.type into q_type
  from public.questions q
  join public.categories c on c.id = q.category_id
  where q.id = new.question_id;

  if obs_type = 'COMPREHENSIVE' then
    return new; -- both allowed
  end if;

  if q_type is null then
    raise exception 'Question % has no category/type', new.question_id;
  end if;

  if q_type <> obs_type then
    raise exception 'Response question type % does not match observation form_type %', q_type, obs_type;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."fn_validate_response_against_observation_form_type"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_token"("_role" "text", "_display_name" "text" DEFAULT NULL::"text", "_email" "text" DEFAULT NULL::"text") RETURNS TABLE("token_id" "uuid", "raw_token" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select * from app.generate_token(_role, _display_name, _email);
$$;


ALTER FUNCTION "public"."generate_token"("_role" "text", "_display_name" "text", "_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_average_scores_by_category"() RETURNS TABLE("category" "text", "type" "text", "average" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name as category,
    c.type::text,
    ROUND(AVG(r.score::numeric), 2) as average
  FROM categories c
  JOIN questions q ON q.category_id = c.id
  JOIN responses r ON r.question_id = q.id
  GROUP BY c.id, c.name, c.type, c.sort_order
  ORDER BY c.sort_order;
END;
$$;


ALTER FUNCTION "public"."get_average_scores_by_category"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_category_questions"("p_form_type" "text") RETURNS TABLE("category_id" "uuid", "category_name" "text", "category_type" "text", "category_order" integer, "question_id" "uuid", "question_text" "text", "question_order" integer)
    LANGUAGE "sql"
    AS $$
  select
    c.id, c.name, c.type, c.sort_order, q.id, q.question_text, q.sort_order
  from public.categories c
  join public.questions q on q.category_id = c.id
  where
    case
      when p_form_type = 'ADL' then c.type = 'ADL'
      when p_form_type = 'IADL' then c.type = 'IADL'
      else true  -- COMPREHENSIVE or any other fallback → both
    end
  order by c.sort_order, q.sort_order
$$;


ALTER FUNCTION "public"."get_category_questions"("p_form_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, display_name, role, disabled)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    case when lower(new.email) = 'william.griffith@grifii.com' then 'admin' else 'caregiver' end,
    false
  )
  on conflict (id) do update set
    display_name = excluded.display_name;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
  select app.is_admin(auth.uid());
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_token_context"("p_token_id" "uuid", "p_role" "text") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  SELECT set_config('app.current_token_id', p_token_id::text, false);
  SELECT set_config('app.current_role', p_role, false);
$$;


ALTER FUNCTION "public"."set_token_context"("p_token_id" "uuid", "p_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at := now();
  return new;
end
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  new.updated_at := now();
  return new;
end $$;


ALTER FUNCTION "public"."tg_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_not_disabled"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT COALESCE(NOT p.disabled, true)
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;


ALTER FUNCTION "public"."user_not_disabled"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "app"."site_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "logo_url" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "landing_image_1_url" "text",
    "landing_image_2_url" "text",
    "why_image_1_url" "text",
    "why_image_2_url" "text"
);


ALTER TABLE "app"."site_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "user_id" "uuid" NOT NULL,
    "subscription_id" "text" NOT NULL,
    "status" "text",
    "price_id" "text",
    "current_period_end" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "plan_id" "text",
    "current_period_start" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "app"."user_subscriptions" AS
 SELECT "user_id",
    "subscription_id",
    "status",
    "price_id",
    "current_period_end",
    "updated_at",
    "plan_id",
    "current_period_start"
   FROM "public"."user_subscriptions";


ALTER VIEW "app"."user_subscriptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "app"."v_active_subscription" AS
 SELECT DISTINCT ON ("user_id") "user_id",
    "plan_id",
    "current_period_start",
    "current_period_end"
   FROM "public"."user_subscriptions" "us"
  WHERE ("status" = ANY (ARRAY['active'::"text", 'trialing'::"text", 'past_due'::"text"]))
  ORDER BY "user_id", COALESCE("current_period_start", "now"()) DESC;


ALTER VIEW "app"."v_active_subscription" OWNER TO "postgres";


CREATE OR REPLACE VIEW "app"."v_user_effective_plan" AS
 SELECT "u"."id" AS "user_id",
    COALESCE("a"."plan_id", 'free'::"text") AS "plan_id"
   FROM ("auth"."users" "u"
     LEFT JOIN "app"."v_active_subscription" "a" ON (("a"."user_id" = "u"."id")));


ALTER VIEW "app"."v_user_effective_plan" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "interval" "text" NOT NULL,
    "price_cents" integer DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "obs_limit" integer,
    "usage_window" "text" DEFAULT 'year'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "stripe_price_id" "text",
    "observations_quota_year" integer DEFAULT 0 NOT NULL,
    "seats_limit" integer,
    CONSTRAINT "subscription_plans_interval_check" CHECK (("interval" = ANY (ARRAY['week'::"text", 'month'::"text", 'none'::"text", 'quarter'::"text"]))),
    CONSTRAINT "subscription_plans_usage_window_check" CHECK (("usage_window" = ANY (ARRAY['week'::"text", 'month'::"text", 'year'::"text"])))
);


ALTER TABLE "public"."subscription_plans" OWNER TO "postgres";


CREATE OR REPLACE VIEW "app"."v_user_plan_limits" AS
 SELECT "e"."user_id",
    "e"."plan_id",
    "p"."usage_window",
    "p"."observations_quota_year" AS "quota",
    "app"."window_start_for"("p"."usage_window") AS "window_start"
   FROM ("app"."v_user_effective_plan" "e"
     JOIN "public"."subscription_plans" "p" ON (("p"."id" = "e"."plan_id")));


ALTER VIEW "app"."v_user_plan_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."observations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patient_name" "text" DEFAULT ''::"text" NOT NULL,
    "observation_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "notes" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "date_of_observation" "date" DEFAULT CURRENT_DATE,
    "mode_of_observation" "text" DEFAULT 'In Person'::"text",
    "caregiver_name" character varying(255) NOT NULL,
    "caregiver_email" character varying(320) NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "form_type" "text",
    "team_id" "uuid",
    "author_user_id" "uuid",
    CONSTRAINT "observations_caregiver_email_format" CHECK ((("caregiver_email")::"text" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text")),
    CONSTRAINT "observations_form_type_check" CHECK (("form_type" = ANY (ARRAY['ADL'::"text", 'IADL'::"text", 'COMPREHENSIVE'::"text"]))),
    CONSTRAINT "observations_mode_check" CHECK (("mode_of_observation" = ANY (ARRAY['In Person'::"text", 'Voice Call'::"text", 'Video Call'::"text"])))
);


ALTER TABLE "public"."observations" OWNER TO "postgres";


COMMENT ON COLUMN "public"."observations"."author_user_id" IS 'creator; only this user may edit/delete';



CREATE OR REPLACE VIEW "app"."v_observation_usage" AS
 SELECT "l"."user_id",
    "count"("o"."id") AS "used_in_window"
   FROM ("app"."v_user_plan_limits" "l"
     LEFT JOIN "public"."observations" "o" ON ((("o"."user_id" = "l"."user_id") AND ("o"."created_at" >= "l"."window_start"))))
  GROUP BY "l"."user_id";


ALTER VIEW "app"."v_observation_usage" OWNER TO "postgres";


CREATE OR REPLACE VIEW "app"."v_observation_remaining" AS
 SELECT "l"."user_id",
    "l"."plan_id",
    "l"."quota",
    COALESCE("u"."used_in_window", (0)::bigint) AS "used_in_window",
    GREATEST(("l"."quota" - COALESCE("u"."used_in_window", (0)::bigint)), (0)::bigint) AS "remaining"
   FROM ("app"."v_user_plan_limits" "l"
     LEFT JOIN "app"."v_observation_usage" "u" ON (("u"."user_id" = "l"."user_id")));


ALTER VIEW "app"."v_observation_remaining" OWNER TO "postgres";


CREATE OR REPLACE VIEW "app"."v_plan_by_price" WITH ("security_invoker"='on') AS
 SELECT "id" AS "plan_id",
    "name",
    "interval",
    "price_cents",
    "currency",
    "obs_limit",
    "usage_window",
    "created_at",
    "stripe_price_id"
   FROM "public"."subscription_plans";


ALTER VIEW "app"."v_plan_by_price" OWNER TO "postgres";


COMMENT ON VIEW "app"."v_plan_by_price" IS 'Legacy-compatible view over public.subscription_plans (plan_id alias, same column order).';



CREATE TABLE IF NOT EXISTS "public"."admin_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_id" "uuid" NOT NULL,
    "actor_email" "text",
    "action" "text" NOT NULL,
    "target_email" "text",
    "target_user_id" "uuid",
    "success" boolean DEFAULT false NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_secrets" (
    "id" boolean DEFAULT true NOT NULL,
    "hash_secret" "text" NOT NULL
);


ALTER TABLE "public"."app_secrets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "ada_definition" "text" DEFAULT ''::"text" NOT NULL,
    "ot_definition" "text" DEFAULT ''::"text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "categories_type_check" CHECK (("type" = ANY (ARRAY['ADL'::"text", 'IADL'::"text"])))
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cv_plan_limits" (
    "plan_id" "text" NOT NULL,
    "seats" integer NOT NULL,
    "team_quota_year" integer
);


ALTER TABLE "public"."cv_plan_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cv_team" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "owner_user_id" "uuid" NOT NULL,
    "plan_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cv_team" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cv_team_invites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "token_hash" "bytea" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "consumed_at" timestamp with time zone
);


ALTER TABLE "public"."cv_team_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cv_team_members" (
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."cv_member_role" NOT NULL,
    "state" "public"."cv_member_state" DEFAULT 'active'::"public"."cv_member_state" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "revoked_at" timestamp with time zone
);


ALTER TABLE "public"."cv_team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cv_team_patient" (
    "team_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "date_of_birth" "date",
    "gender" "public"."cv_gender" DEFAULT 'unknown'::"public"."cv_gender",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cv_team_patient" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."cv_v_team_usage_year" WITH ("security_invoker"='true') AS
 SELECT "team_id",
    "count"(*) FILTER (WHERE ("created_at" >= ("now"() - '365 days'::interval))) AS "used_in_window"
   FROM "public"."observations" "o"
  GROUP BY "team_id";


ALTER VIEW "public"."cv_v_team_usage_year" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."cv_v_team_remaining" WITH ("security_invoker"='true') AS
 SELECT "t"."id" AS "team_id",
    COALESCE("u"."used_in_window", (0)::bigint) AS "used_in_window",
    "pl"."team_quota_year" AS "quota",
    GREATEST(("pl"."team_quota_year" - COALESCE("u"."used_in_window", (0)::bigint)), (0)::bigint) AS "remaining"
   FROM (("public"."cv_team" "t"
     JOIN "public"."cv_plan_limits" "pl" ON (("pl"."plan_id" = "t"."plan_id")))
     LEFT JOIN "public"."cv_v_team_usage_year" "u" ON (("u"."team_id" = "t"."id")));


ALTER VIEW "public"."cv_v_team_remaining" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."legend" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "score" integer NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "legend_score_check" CHECK ((("score" >= 1) AND ("score" <= 5)))
);


ALTER TABLE "public"."legend" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text" DEFAULT ''::"text" NOT NULL,
    "role" "text" DEFAULT 'caregiver'::"text" NOT NULL,
    "disabled" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "active_team_id" "uuid",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'caregiver'::"text"]))),
    CONSTRAINT "profiles_role_check_allowed" CHECK (("role" = ANY (ARRAY['admin'::"text", 'caregiver'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "question_text" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions_stage" (
    "type" "text" NOT NULL,
    "category_name" "text" NOT NULL,
    "question_text" "text" NOT NULL,
    "sort_order" integer NOT NULL
);


ALTER TABLE "public"."questions_stage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "observation_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "score" integer NOT NULL,
    "notes" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "category_notes" "text" DEFAULT ''::"text",
    CONSTRAINT "responses_score_valid" CHECK ((("score" >= 1) AND ("score" <= 5)))
);


ALTER TABLE "public"."responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stripe_customers" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "customer_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."stripe_customers" OWNER TO "postgres";


ALTER TABLE "public"."stripe_customers" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."stripe_customers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."stripe_orders" (
    "id" bigint NOT NULL,
    "checkout_session_id" "text" NOT NULL,
    "payment_intent_id" "text" NOT NULL,
    "customer_id" "text" NOT NULL,
    "amount_subtotal" bigint NOT NULL,
    "amount_total" bigint NOT NULL,
    "currency" "text" NOT NULL,
    "payment_status" "text" NOT NULL,
    "status" "public"."stripe_order_status" DEFAULT 'pending'::"public"."stripe_order_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."stripe_orders" OWNER TO "postgres";


ALTER TABLE "public"."stripe_orders" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."stripe_orders_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."stripe_subscriptions" (
    "id" bigint NOT NULL,
    "customer_id" "text" NOT NULL,
    "subscription_id" "text",
    "price_id" "text",
    "current_period_start" bigint,
    "current_period_end" bigint,
    "cancel_at_period_end" boolean DEFAULT false,
    "payment_method_brand" "text",
    "payment_method_last4" "text",
    "status" "public"."stripe_subscription_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "cancel_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "coupon_id" "text",
    "promotion_code" "text",
    "discount_percent" numeric,
    "discount_amount" integer
);


ALTER TABLE "public"."stripe_subscriptions" OWNER TO "postgres";


ALTER TABLE "public"."stripe_subscriptions" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."stripe_subscriptions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."stripe_user_orders" WITH ("security_invoker"='true') AS
 SELECT "c"."customer_id",
    "o"."id" AS "order_id",
    "o"."checkout_session_id",
    "o"."payment_intent_id",
    "o"."amount_subtotal",
    "o"."amount_total",
    "o"."currency",
    "o"."payment_status",
    "o"."status" AS "order_status",
    "o"."created_at" AS "order_date"
   FROM ("public"."stripe_customers" "c"
     LEFT JOIN "public"."stripe_orders" "o" ON (("c"."customer_id" = "o"."customer_id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL) AND ("o"."deleted_at" IS NULL));


ALTER VIEW "public"."stripe_user_orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."stripe_user_subscriptions" WITH ("security_invoker"='true') AS
 SELECT "c"."customer_id",
    "s"."subscription_id",
    "s"."status" AS "subscription_status",
    "s"."price_id",
    "s"."current_period_start",
    "s"."current_period_end",
    "s"."cancel_at_period_end",
    "s"."payment_method_brand",
    "s"."payment_method_last4"
   FROM ("public"."stripe_customers" "c"
     LEFT JOIN "public"."stripe_subscriptions" "s" ON (("c"."customer_id" = "s"."customer_id")))
  WHERE (("c"."user_id" = "auth"."uid"()) AND ("c"."deleted_at" IS NULL) AND ("s"."deleted_at" IS NULL));


ALTER VIEW "public"."stripe_user_subscriptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_category_questions" WITH ("security_invoker"='true') AS
 SELECT "c"."id" AS "category_id",
    "c"."name" AS "category_name",
    "c"."type",
    "c"."sort_order" AS "category_order",
    "q"."id" AS "question_id",
    "q"."question_text",
    "q"."sort_order" AS "question_order"
   FROM ("public"."categories" "c"
     JOIN "public"."questions" "q" ON (("q"."category_id" = "c"."id")))
  WHERE ("c"."name" <> 'CATEGORY'::"text");


ALTER VIEW "public"."v_category_questions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_plan_by_price" WITH ("security_invoker"='on') AS
 SELECT "id" AS "plan_id",
    "name",
    "interval",
    "price_cents",
    "stripe_price_id"
   FROM "public"."subscription_plans";


ALTER VIEW "public"."v_plan_by_price" OWNER TO "postgres";


ALTER TABLE ONLY "app"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_events"
    ADD CONSTRAINT "admin_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_secrets"
    ADD CONSTRAINT "app_secrets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cv_plan_limits"
    ADD CONSTRAINT "cv_plan_limits_pkey" PRIMARY KEY ("plan_id");



ALTER TABLE ONLY "public"."cv_team_invites"
    ADD CONSTRAINT "cv_team_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cv_team_members"
    ADD CONSTRAINT "cv_team_members_pkey" PRIMARY KEY ("team_id", "user_id");



ALTER TABLE ONLY "public"."cv_team_patient"
    ADD CONSTRAINT "cv_team_patient_pkey" PRIMARY KEY ("team_id");



ALTER TABLE ONLY "public"."cv_team"
    ADD CONSTRAINT "cv_team_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legend"
    ADD CONSTRAINT "legend_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legend"
    ADD CONSTRAINT "legend_score_uniq" UNIQUE ("score");



ALTER TABLE ONLY "public"."observations"
    ADD CONSTRAINT "observations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."responses"
    ADD CONSTRAINT "responses_observation_id_question_id_key" UNIQUE ("observation_id", "question_id");



ALTER TABLE ONLY "public"."responses"
    ADD CONSTRAINT "responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_customers"
    ADD CONSTRAINT "stripe_customers_customer_id_key" UNIQUE ("customer_id");



ALTER TABLE ONLY "public"."stripe_customers"
    ADD CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_customers"
    ADD CONSTRAINT "stripe_customers_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."stripe_orders"
    ADD CONSTRAINT "stripe_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_subscriptions"
    ADD CONSTRAINT "stripe_subscriptions_customer_id_key" UNIQUE ("customer_id");



ALTER TABLE ONLY "public"."stripe_subscriptions"
    ADD CONSTRAINT "stripe_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_subscriptions"
    ADD CONSTRAINT "stripe_subscriptions_subscription_id_key" UNIQUE ("subscription_id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_stripe_price_id_key" UNIQUE ("stripe_price_id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("user_id", "subscription_id");



CREATE INDEX "categories_sort_order_idx" ON "public"."categories" USING "btree" ("sort_order");



CREATE INDEX "categories_type_idx" ON "public"."categories" USING "btree" ("type");



CREATE INDEX "categories_type_sort_order_idx" ON "public"."categories" USING "btree" ("type", "sort_order");



CREATE INDEX "cv_invites_team_idx" ON "public"."cv_team_invites" USING "btree" ("team_id");



CREATE UNIQUE INDEX "cv_invites_unique_active" ON "public"."cv_team_invites" USING "btree" ("team_id", "lower"("email")) WHERE ("consumed_at" IS NULL);



CREATE INDEX "cv_team_members_user_idx" ON "public"."cv_team_members" USING "btree" ("user_id");



CREATE INDEX "cv_team_owner_idx" ON "public"."cv_team" USING "btree" ("owner_user_id");



CREATE INDEX "idx_cv_team_members_team_user" ON "public"."cv_team_members" USING "btree" ("team_id", "user_id");



CREATE INDEX "idx_observations_user_id" ON "public"."observations" USING "btree" ("user_id");



CREATE INDEX "idx_questions_category_order" ON "public"."questions" USING "btree" ("category_id", "sort_order");



CREATE INDEX "idx_responses_observation_id" ON "public"."responses" USING "btree" ("observation_id");



CREATE INDEX "idx_stripe_customers_customer" ON "public"."stripe_customers" USING "btree" ("customer_id");



CREATE INDEX "idx_stripe_orders_customer" ON "public"."stripe_orders" USING "btree" ("customer_id");



CREATE INDEX "idx_stripe_subs_customer" ON "public"."stripe_subscriptions" USING "btree" ("customer_id");



CREATE INDEX "obs_team_idx" ON "public"."observations" USING "btree" ("team_id");



CREATE INDEX "obs_user_idx" ON "public"."observations" USING "btree" ("user_id");



CREATE INDEX "observations_author_idx" ON "public"."observations" USING "btree" ("author_user_id");



CREATE INDEX "observations_caregiver_email_idx" ON "public"."observations" USING "btree" ("caregiver_email");



CREATE INDEX "observations_caregiver_name_idx" ON "public"."observations" USING "btree" ("caregiver_name");



CREATE INDEX "observations_observation_date_idx" ON "public"."observations" USING "btree" ("observation_date");



CREATE INDEX "observations_team_idx" ON "public"."observations" USING "btree" ("team_id");



CREATE INDEX "observations_user_form_type_idx" ON "public"."observations" USING "btree" ("user_id", "form_type");



CREATE INDEX "profiles_active_team_idx" ON "public"."profiles" USING "btree" ("active_team_id");



CREATE INDEX "profiles_email_idx" ON "public"."profiles" USING "btree" ("email");



CREATE UNIQUE INDEX "profiles_email_unique" ON "public"."profiles" USING "btree" ("lower"("email")) WHERE ("email" IS NOT NULL);



CREATE INDEX "questions_category_id_idx" ON "public"."questions" USING "btree" ("category_id");



CREATE INDEX "questions_sort_order_idx" ON "public"."questions" USING "btree" ("sort_order");



CREATE INDEX "responses_observation_id_idx" ON "public"."responses" USING "btree" ("observation_id");



CREATE INDEX "responses_question_id_idx" ON "public"."responses" USING "btree" ("question_id");



CREATE INDEX "team_members_state_idx" ON "public"."cv_team_members" USING "btree" ("team_id", "state");



CREATE UNIQUE INDEX "uniq_question_text_per_category" ON "public"."questions" USING "btree" ("category_id", "lower"("question_text"));



CREATE UNIQUE INDEX "user_subscriptions_subscription_id_key" ON "public"."user_subscriptions" USING "btree" ("subscription_id");



CREATE INDEX "user_subscriptions_user_id_idx" ON "public"."user_subscriptions" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "app"."site_settings" FOR EACH ROW EXECUTE FUNCTION "app"."tg_set_updated_at"();



CREATE OR REPLACE TRIGGER "a_cv_obs_set_team_before_ins" BEFORE INSERT ON "public"."observations" FOR EACH ROW EXECUTE FUNCTION "public"."cv_obs_set_team_on_insert"();



CREATE OR REPLACE TRIGGER "cv_trg_check_seat_cap" BEFORE INSERT ON "public"."cv_team_members" FOR EACH ROW EXECUTE FUNCTION "public"."cv_check_seat_cap"();



CREATE OR REPLACE TRIGGER "trg_observations_updated_at" BEFORE UPDATE ON "public"."observations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_enforce_single_admin" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_single_admin_by_email"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."tg_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "trg_responses_updated_at" BEFORE UPDATE ON "public"."responses" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_validate_response_form_type" BEFORE INSERT OR UPDATE ON "public"."responses" FOR EACH ROW EXECUTE FUNCTION "public"."fn_validate_response_against_observation_form_type"();



CREATE OR REPLACE TRIGGER "z_cv_obs_quota_guard_before_ins" BEFORE INSERT ON "public"."observations" FOR EACH ROW EXECUTE FUNCTION "public"."cv_obs_quota_guard"();



ALTER TABLE ONLY "public"."cv_team_invites"
    ADD CONSTRAINT "cv_team_invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."cv_team_invites"
    ADD CONSTRAINT "cv_team_invites_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."cv_team"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cv_team_members"
    ADD CONSTRAINT "cv_team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."cv_team"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cv_team_members"
    ADD CONSTRAINT "cv_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cv_team"
    ADD CONSTRAINT "cv_team_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cv_team_patient"
    ADD CONSTRAINT "cv_team_patient_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."cv_team"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cv_team"
    ADD CONSTRAINT "cv_team_plan_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id");



ALTER TABLE ONLY "public"."observations"
    ADD CONSTRAINT "observations_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."cv_team"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."observations"
    ADD CONSTRAINT "observations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_active_team_fk" FOREIGN KEY ("active_team_id") REFERENCES "public"."cv_team"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."responses"
    ADD CONSTRAINT "responses_observation_id_fkey" FOREIGN KEY ("observation_id") REFERENCES "public"."observations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."responses"
    ADD CONSTRAINT "responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stripe_customers"
    ADD CONSTRAINT "stripe_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_plan_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE "app"."site_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "site_settings_admin_delete" ON "app"."site_settings" FOR DELETE USING ("app"."is_admin"());



CREATE POLICY "site_settings_admin_insert" ON "app"."site_settings" FOR INSERT WITH CHECK ("app"."is_admin"());



CREATE POLICY "site_settings_admin_update" ON "app"."site_settings" FOR UPDATE USING ("app"."is_admin"()) WITH CHECK ("app"."is_admin"());



CREATE POLICY "site_settings_read_all" ON "app"."site_settings" FOR SELECT USING (true);



CREATE POLICY "site_settings_select_public" ON "app"."site_settings" FOR SELECT TO "dashboard_user", "authenticated", "anon", "authenticator" USING (true);



ALTER TABLE "public"."admin_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_events_select_admins" ON "public"."admin_events" FOR SELECT USING ("app"."is_admin"());



ALTER TABLE "public"."app_secrets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cat_block_writes" ON "public"."categories" TO "authenticated", "anon" USING (false) WITH CHECK (false);



CREATE POLICY "cat_read_all" ON "public"."categories" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "categories_auth_select" ON "public"."categories" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "categories_read_all" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "cv_members_insert_owner" ON "public"."cv_team_members" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."cv_team" "t"
  WHERE (("t"."id" = "cv_team_members"."team_id") AND ("t"."owner_user_id" = "auth"."uid"())))));



CREATE POLICY "cv_members_insert_self" ON "public"."cv_team_members" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND (EXISTS ( SELECT 1
   FROM "public"."cv_team_members" "m"
  WHERE (("m"."team_id" = "cv_team_members"."team_id") AND ("m"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "cv_members_select" ON "public"."cv_team_members" FOR SELECT USING ("public"."cv_is_team_member"("team_id"));



CREATE POLICY "cv_members_update_owner" ON "public"."cv_team_members" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."cv_team" "t"
  WHERE (("t"."id" = "cv_team_members"."team_id") AND ("t"."owner_user_id" = "auth"."uid"())))));



CREATE POLICY "cv_members_update_self" ON "public"."cv_team_members" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."cv_plan_limits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cv_resp_cud_by_author" ON "public"."responses" USING ((EXISTS ( SELECT 1
   FROM "public"."observations" "o"
  WHERE (("o"."id" = "responses"."observation_id") AND ("o"."author_user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."observations" "o"
  WHERE (("o"."id" = "responses"."observation_id") AND ("o"."author_user_id" = "auth"."uid"())))));



CREATE POLICY "cv_resp_select_visible" ON "public"."responses" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."observations" "o"
  WHERE (("o"."id" = "responses"."observation_id") AND ("o"."author_user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM ("public"."observations" "o"
     JOIN "public"."cv_team_members" "tm" ON ((("tm"."team_id" = "o"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."state" = 'active'::"public"."cv_member_state") AND ("tm"."revoked_at" IS NULL))))
  WHERE ("o"."id" = "responses"."observation_id")))));



ALTER TABLE "public"."cv_team" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cv_team_block_writes" ON "public"."cv_team" USING (false) WITH CHECK (false);



ALTER TABLE "public"."cv_team_invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cv_team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cv_team_patient" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cv_team_select" ON "public"."cv_team" FOR SELECT USING ("public"."cv_is_team_member"("id"));



CREATE POLICY "cv_team_select_members" ON "public"."cv_team" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."cv_team_members" "tm"
  WHERE (("tm"."team_id" = "cv_team"."id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."revoked_at" IS NULL)))));



CREATE POLICY "cv_team_update_owner" ON "public"."cv_team" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."cv_team_members" "tm"
  WHERE (("tm"."team_id" = "cv_team"."id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'owner'::"public"."cv_member_role") AND ("tm"."revoked_at" IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."cv_team_members" "tm"
  WHERE (("tm"."team_id" = "cv_team"."id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'owner'::"public"."cv_member_role") AND ("tm"."revoked_at" IS NULL)))));



CREATE POLICY "cv_ti_block_writes" ON "public"."cv_team_invites" USING (false) WITH CHECK (false);



CREATE POLICY "cv_ti_select_members" ON "public"."cv_team_invites" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."cv_team_members" "me"
  WHERE (("me"."team_id" = "cv_team_invites"."team_id") AND ("me"."user_id" = "auth"."uid"()) AND ("me"."revoked_at" IS NULL)))));



CREATE POLICY "cv_tp_block_writes" ON "public"."cv_team_patient" USING (false) WITH CHECK (false);



CREATE POLICY "cv_tp_select_members" ON "public"."cv_team_patient" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."cv_team_members" "me"
  WHERE (("me"."team_id" = "cv_team_patient"."team_id") AND ("me"."user_id" = "auth"."uid"()) AND ("me"."revoked_at" IS NULL)))));



CREATE POLICY "cv_tp_update_owner" ON "public"."cv_team_patient" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."cv_team_members" "tm"
  WHERE (("tm"."team_id" = "cv_team_patient"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'owner'::"public"."cv_member_role") AND ("tm"."revoked_at" IS NULL))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."cv_team_members" "tm"
  WHERE (("tm"."team_id" = "cv_team_patient"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."role" = 'owner'::"public"."cv_member_role") AND ("tm"."revoked_at" IS NULL)))));



ALTER TABLE "public"."legend" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "legend_read_all" ON "public"."legend" FOR SELECT USING (true);



CREATE POLICY "obs_delete_own" ON "public"."observations" FOR DELETE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "obs_quota_insert" ON "public"."observations" FOR INSERT TO "authenticated" WITH CHECK ("public"."can_create_observation"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "obs_read_own" ON "public"."observations" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "obs_update_own" ON "public"."observations" FOR UPDATE TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."observations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "plans_block_writes" ON "public"."subscription_plans" TO "authenticated", "anon" USING (false) WITH CHECK (false);



CREATE POLICY "plans_select_all" ON "public"."subscription_plans" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete_admin_only" ON "public"."profiles" FOR DELETE USING ("app"."is_admin"());



CREATE POLICY "profiles_insert_self_or_admin" ON "public"."profiles" FOR INSERT WITH CHECK ((("id" = "auth"."uid"()) OR "app"."is_admin"()));



CREATE POLICY "profiles_select_self_or_admin" ON "public"."profiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR "app"."is_admin"()));



CREATE POLICY "profiles_update_self_or_admin" ON "public"."profiles" FOR UPDATE USING ((("id" = "auth"."uid"()) OR "app"."is_admin"())) WITH CHECK ((("id" = "auth"."uid"()) OR "app"."is_admin"()));



CREATE POLICY "q_block_writes" ON "public"."questions" TO "authenticated", "anon" USING (false) WITH CHECK (false);



CREATE POLICY "q_read_all" ON "public"."questions" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "questions_auth_select" ON "public"."questions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "questions_read_all" ON "public"."questions" FOR SELECT USING (true);



ALTER TABLE "public"."questions_stage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."responses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sc_self" ON "public"."stripe_customers" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."stripe_customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stripe_orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "stripe_orders_select_own" ON "public"."stripe_orders" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stripe_customers" "c"
  WHERE (("c"."customer_id" = "stripe_orders"."customer_id") AND ("c"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "public"."stripe_subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "stripe_subscriptions_select_own" ON "public"."stripe_subscriptions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stripe_customers" "c"
  WHERE (("c"."customer_id" = "stripe_subscriptions"."customer_id") AND ("c"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "subs_block_writes" ON "public"."user_subscriptions" USING (false) WITH CHECK (false);



ALTER TABLE "public"."subscription_plans" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "us_self" ON "public"."user_subscriptions" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_can_delete_own_observations" ON "public"."observations" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "app" TO PUBLIC;
GRANT USAGE ON SCHEMA "app" TO "service_role";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "app"."admin_cancel_at_period_end"("p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "app"."admin_cancel_at_period_end"("p_user_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "app"."admin_downgrade_to_free"("p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "app"."admin_downgrade_to_free"("p_user_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "app"."admin_set_user_plan"("p_user_id" "uuid", "p_plan_id" "text", "p_status" "text", "p_start" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "app"."admin_set_user_plan"("p_user_id" "uuid", "p_plan_id" "text", "p_status" "text", "p_start" timestamp with time zone) TO "authenticated";



REVOKE ALL ON FUNCTION "app"."admin_set_user_price"("p_user_id" "uuid", "p_price_id" "text", "p_status" "text", "p_start" timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION "app"."admin_set_user_price"("p_user_id" "uuid", "p_price_id" "text", "p_status" "text", "p_start" timestamp with time zone) TO "authenticated";



GRANT ALL ON FUNCTION "app"."bootstrap_login"("_display_name" "text", "_email" "text") TO "anon";



REVOKE ALL ON FUNCTION "app"."on_user_signup"() FROM PUBLIC;
GRANT ALL ON FUNCTION "app"."on_user_signup"() TO "service_role";



REVOKE ALL ON FUNCTION "app"."validate_token"("_raw_token" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "app"."validate_token"("_raw_token" "text") TO "anon";
GRANT ALL ON FUNCTION "app"."validate_token"("_raw_token" "text") TO "authenticated";

























































































































































GRANT ALL ON FUNCTION "public"."can_create_observation"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_observation"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_observation"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_accept_invite"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_accept_invite"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_accept_invite"("p_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_apply_plan_to_owner_teams"("p_owner" "uuid", "p_plan_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_apply_plan_to_owner_teams"("p_owner" "uuid", "p_plan_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_apply_plan_to_owner_teams"("p_owner" "uuid", "p_plan_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_apply_team_plan"("p_team" "uuid", "p_plan_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_apply_team_plan"("p_team" "uuid", "p_plan_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_apply_team_plan"("p_team" "uuid", "p_plan_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_can_create_observation_team"("p_team" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_can_create_observation_team"("p_team" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_can_create_observation_team"("p_team" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_check_seat_cap"() TO "anon";
GRANT ALL ON FUNCTION "public"."cv_check_seat_cap"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_check_seat_cap"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_check_team_seats"("p_team" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_check_team_seats"("p_team" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_check_team_seats"("p_team" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_create_invite"("p_team" "uuid", "p_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_create_invite"("p_team" "uuid", "p_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_create_invite"("p_team" "uuid", "p_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_create_team_with_patient"("p_name" "text", "p_plan_id" "text", "p_patient_name" "text", "p_dob" "date", "p_gender" "public"."cv_gender", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_create_team_with_patient"("p_name" "text", "p_plan_id" "text", "p_patient_name" "text", "p_dob" "date", "p_gender" "public"."cv_gender", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_create_team_with_patient"("p_name" "text", "p_plan_id" "text", "p_patient_name" "text", "p_dob" "date", "p_gender" "public"."cv_gender", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_freeze_extras_fifo"("p_team" "uuid", "p_allow_seats" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."cv_freeze_extras_fifo"("p_team" "uuid", "p_allow_seats" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_freeze_extras_fifo"("p_team" "uuid", "p_allow_seats" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_get_active_team"() TO "anon";
GRANT ALL ON FUNCTION "public"."cv_get_active_team"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_get_active_team"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_is_team_member"("p_team" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_is_team_member"("p_team" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_is_team_member"("p_team" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_list_members"("p_team" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_list_members"("p_team" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_list_members"("p_team" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_obs_quota_guard"() TO "anon";
GRANT ALL ON FUNCTION "public"."cv_obs_quota_guard"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_obs_quota_guard"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_obs_set_team_on_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."cv_obs_set_team_on_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_obs_set_team_on_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_remove_member"("p_team" "uuid", "p_user" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_remove_member"("p_team" "uuid", "p_user" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_remove_member"("p_team" "uuid", "p_user" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_revoke_invite"("p_invite" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_revoke_invite"("p_invite" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_revoke_invite"("p_invite" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_set_active_team"("p_team" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_set_active_team"("p_team" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_set_active_team"("p_team" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_transfer_owner"("p_team" "uuid", "p_new_owner" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_transfer_owner"("p_team" "uuid", "p_new_owner" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_transfer_owner"("p_team" "uuid", "p_new_owner" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_unfreeze_up_to"("p_team" "uuid", "p_allow_seats" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."cv_unfreeze_up_to"("p_team" "uuid", "p_allow_seats" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_unfreeze_up_to"("p_team" "uuid", "p_allow_seats" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."cv_user_role_in_team"("p_team" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cv_user_role_in_team"("p_team" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cv_user_role_in_team"("p_team" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_single_admin_by_email"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_single_admin_by_email"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_single_admin_by_email"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_validate_response_against_observation_form_type"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_validate_response_against_observation_form_type"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_validate_response_against_observation_form_type"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_token"("_role" "text", "_display_name" "text", "_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_token"("_role" "text", "_display_name" "text", "_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_token"("_role" "text", "_display_name" "text", "_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_average_scores_by_category"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_average_scores_by_category"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_average_scores_by_category"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_category_questions"("p_form_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_category_questions"("p_form_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_category_questions"("p_form_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_token_context"("p_token_id" "uuid", "p_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_token_context"("p_token_id" "uuid", "p_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_token_context"("p_token_id" "uuid", "p_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."tg_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."tg_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."tg_profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_not_disabled"() TO "anon";
GRANT ALL ON FUNCTION "public"."user_not_disabled"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_not_disabled"() TO "service_role";












GRANT SELECT ON TABLE "app"."site_settings" TO "anon";
GRANT SELECT ON TABLE "app"."site_settings" TO "authenticated";



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_plans" TO "anon";
GRANT ALL ON TABLE "public"."subscription_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_plans" TO "service_role";



GRANT ALL ON TABLE "public"."observations" TO "anon";
GRANT ALL ON TABLE "public"."observations" TO "authenticated";
GRANT ALL ON TABLE "public"."observations" TO "service_role";









GRANT ALL ON TABLE "public"."admin_events" TO "anon";
GRANT ALL ON TABLE "public"."admin_events" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_events" TO "service_role";



GRANT ALL ON TABLE "public"."app_secrets" TO "anon";
GRANT ALL ON TABLE "public"."app_secrets" TO "authenticated";
GRANT ALL ON TABLE "public"."app_secrets" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."cv_plan_limits" TO "anon";
GRANT ALL ON TABLE "public"."cv_plan_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."cv_plan_limits" TO "service_role";



GRANT ALL ON TABLE "public"."cv_team" TO "anon";
GRANT ALL ON TABLE "public"."cv_team" TO "authenticated";
GRANT ALL ON TABLE "public"."cv_team" TO "service_role";



GRANT ALL ON TABLE "public"."cv_team_invites" TO "anon";
GRANT ALL ON TABLE "public"."cv_team_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."cv_team_invites" TO "service_role";



GRANT ALL ON TABLE "public"."cv_team_members" TO "anon";
GRANT ALL ON TABLE "public"."cv_team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."cv_team_members" TO "service_role";



GRANT ALL ON TABLE "public"."cv_team_patient" TO "anon";
GRANT ALL ON TABLE "public"."cv_team_patient" TO "authenticated";
GRANT ALL ON TABLE "public"."cv_team_patient" TO "service_role";



GRANT ALL ON TABLE "public"."cv_v_team_usage_year" TO "anon";
GRANT ALL ON TABLE "public"."cv_v_team_usage_year" TO "authenticated";
GRANT ALL ON TABLE "public"."cv_v_team_usage_year" TO "service_role";



GRANT ALL ON TABLE "public"."cv_v_team_remaining" TO "anon";
GRANT ALL ON TABLE "public"."cv_v_team_remaining" TO "authenticated";
GRANT ALL ON TABLE "public"."cv_v_team_remaining" TO "service_role";



GRANT ALL ON TABLE "public"."legend" TO "anon";
GRANT ALL ON TABLE "public"."legend" TO "authenticated";
GRANT ALL ON TABLE "public"."legend" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON TABLE "public"."questions_stage" TO "anon";
GRANT ALL ON TABLE "public"."questions_stage" TO "authenticated";
GRANT ALL ON TABLE "public"."questions_stage" TO "service_role";



GRANT ALL ON TABLE "public"."responses" TO "anon";
GRANT ALL ON TABLE "public"."responses" TO "authenticated";
GRANT ALL ON TABLE "public"."responses" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_customers" TO "anon";
GRANT ALL ON TABLE "public"."stripe_customers" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_customers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."stripe_customers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."stripe_customers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."stripe_customers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_orders" TO "anon";
GRANT ALL ON TABLE "public"."stripe_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_orders" TO "service_role";



GRANT ALL ON SEQUENCE "public"."stripe_orders_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."stripe_orders_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."stripe_orders_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."stripe_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_subscriptions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."stripe_subscriptions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."stripe_subscriptions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."stripe_subscriptions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_user_orders" TO "anon";
GRANT ALL ON TABLE "public"."stripe_user_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_user_orders" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."stripe_user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_user_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."v_category_questions" TO "anon";
GRANT ALL ON TABLE "public"."v_category_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."v_category_questions" TO "service_role";



GRANT ALL ON TABLE "public"."v_plan_by_price" TO "anon";
GRANT ALL ON TABLE "public"."v_plan_by_price" TO "authenticated";
GRANT ALL ON TABLE "public"."v_plan_by_price" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
