-- ============================================================
-- Migration: church directory columns + church at sign-up — 2026-11-03
--
-- The church list is about to grow from 5 hand-entered parishes to ~1,150
-- imported from the Coptic Orthodox Directory (https://directory.nihov.org,
-- volunteer-run; terms https://nihov.org/terms allow reading, searching,
-- linking and sharing; they forbid wholesale republication and harvesting
-- contacts). Only name, nickname, address parts, coordinates, kind and
-- precision are imported, by scripts/import-churches.ts, into the
-- 2026110302000N_seed_churches_from_directory_NofM.sql files (five in this
-- run, each its own migration version; the count follows the 45 KB paste
-- cap). Paste this file first; each seed file checks that it ran.
--
-- BEFORE PASTING, run and keep the output of:
--   select id, name, address, address_line1, city, latitude
--     from public.churches order by name;
--   select id, full_name, role from public.profiles
--     where church_id = '587308d6-216b-471f-9dff-3c91832d1f67';
-- The second tells you whether anything points at the "100 Test Ave" row
-- (id 587308d6-…, name "St. Mary & Archangel Michael Coptic Orthodox Church",
-- address only in the legacy text column, no coordinates — read through the
-- public API on 2026-11-02). Nothing below deletes or hides it; if it is test
-- data with no dependants, hide it afterwards with:
--   update public.churches set hidden_at = now()
--     where id = '587308d6-216b-471f-9dff-3c91832d1f67';
--
-- Safe to re-run.
-- ============================================================

-- ── 1. Columns ───────────────────────────────────────────────
alter table public.churches
  add column if not exists source        text not null default 'manual',
  add column if not exists source_id     text,
  add column if not exists kind          text not null default 'church',
  add column if not exists nickname      text,
  add column if not exists geo_precision text,
  add column if not exists hidden_at     timestamptz;

-- A readable failure instead of a constraint error buried in a paste: the
-- country check below would otherwise fail on any legacy row.
do $$ begin
  if exists (select 1 from public.churches where country is not null and country !~ '^[A-Z]{2}$') then
    raise exception 'churches.country must be ISO-2 (e.g. US, EG) on every row before this migration; fix the rows listed by: select id, name, country from churches where country !~ ''^[A-Z]{2}$''';
  end if;
end $$;

alter table public.churches drop constraint if exists churches_source_pair_check;
alter table public.churches add constraint churches_source_pair_check
  check ((source = 'manual') = (source_id is null));
alter table public.churches drop constraint if exists churches_source_unique;
alter table public.churches add constraint churches_source_unique unique (source, source_id);
alter table public.churches drop constraint if exists churches_kind_check;
alter table public.churches add constraint churches_kind_check
  check (kind in ('church', 'monastery'));
alter table public.churches drop constraint if exists churches_geo_precision_check;
alter table public.churches add constraint churches_geo_precision_check
  check (geo_precision is null or geo_precision in ('address', 'street', 'city', 'state'));
alter table public.churches drop constraint if exists churches_country_iso2_check;
alter table public.churches add constraint churches_country_iso2_check
  check (country is null or country ~ '^[A-Z]{2}$');

comment on table public.churches is
  'Parish list. source = nihov rows come from the Coptic Orthodox Directory (https://directory.nihov.org; terms https://nihov.org/terms): name, nickname, address parts, coordinates, kind, precision only — never phone or website. source = manual rows are admin-entered. hidden_at hides a row from pickers without breaking profiles.church_id.';
comment on column public.churches.source_id is 'Directory marker id when source = nihov; null for manual rows.';
comment on column public.churches.geo_precision is 'How exact the coordinates are (directory value). city/state rows are centroids and are shown as approximate.';
comment on column public.churches.hidden_at is 'Soft hide, set by hand only. The seed never sets or clears it. Preferred over delete because profiles.church_id is ON DELETE SET NULL.';

-- ── 2. Adopt the three rows that are the same buildings as directory entries
--      so the seed UPDATES them (profiles.church_id keeps pointing at them),
--      as the 2026-10-23 coordinate backfill did. The not-exists guard means a
--      re-run after the seed has inserted a twin cannot hit the unique constraint.
update public.churches set source = 'nihov', source_id = '125'
  where id = '9adb1c9f-b9ae-4621-9896-7e389aaad333' and source = 'manual'
    and not exists (select 1 from public.churches where source = 'nihov' and source_id = '125');  -- Fairfax VA, 0.12 km
update public.churches set source = 'nihov', source_id = '588'
  where id = '18e706d2-8f98-4e35-96a0-4ca4d5ea471a' and source = 'manual'
    and not exists (select 1 from public.churches where source = 'nihov' and source_id = '588');  -- Westlake OH, 0.04 km
update public.churches set source = 'nihov', source_id = '494'
  where id = '65a637ba-a8cc-4bf6-9201-6b259264a62c' and source = 'manual'
    and not exists (select 1 from public.churches where source = 'nihov' and source_id = '494');  -- Arlington VA, 0.03 km
-- 32d61988-… Leesburg has no directory entry and stays manual. If it appears
-- upstream later, add an adoption line like the three above and re-paste.

-- ── 3. Sign-up writes the church in the same insert as the account ──────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta  jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  req   text  := lower(trim(coalesce(meta->>'requested_role', '')));
  cid_t text  := trim(coalesce(meta->>'church_id', ''));
  cid   uuid;
  cname text;
begin
  if req not in ('congregant', 'servant', 'priest') then req := 'congregant'; end if;

  -- The church is the client's claim. An id counts only if it names a row we
  -- have, and then the row's name wins over whatever the client typed, so
  -- church_name (which the FOC card and invite lookup read) always mirrors
  -- the picked row. NOTHING in this block may abort: a raised error here fails
  -- the auth.users insert, i.e. every sign-up on every build reads "Database
  -- error saving new user". The regex means the cast cannot fail; the handler
  -- is for whatever we have not thought of, and it says so in the Postgres
  -- log (WARNING is logged by default; NOTICE is not). A hidden church is not
  -- a valid pick: a stale device cache could still offer it, and the typed
  -- name then stands in.
  begin
    if cid_t ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      select c.id, c.name into cid, cname from public.churches c
        where c.id = cid_t::uuid and c.hidden_at is null;
    end if;
  exception when others then
    raise warning 'handle_new_user: church lookup skipped for %: % (%)', new.id, sqlerrm, sqlstate;
    cid := null; cname := null;
  end;
  if cid is null then
    cname := nullif(left(trim(coalesce(meta->>'church_name', '')), 120), '');
  end if;

  insert into public.profiles (id, full_name, role, church_id, church_name)
  values (new.id, meta->>'full_name', req, cid, cname);
  return new;
end;
$$;
-- Trigger on_auth_user_created is unchanged: create or replace keeps it bound.

-- ── 4. Admin breakdown: one card per church would now be ~1,150 cards ───────
-- Same body as 20261008010000 (keep the n_* CTE names and the ordinal ORDER
-- BY; see its notes) with ONE added predicate on the first select. A WHERE,
-- not a HAVING: there is no GROUP BY in that select, so HAVING would fail at
-- call time. Manual rows stay visible even with zero members (Leesburg, or a
-- church Bishoy just added), otherwise the admin tab would lose them on reload.
create or replace function public.get_church_breakdown()
returns table (church_id uuid, church_name text, priests bigint, servants bigint, congregants bigint, foc_linked bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Access denied'; end if;
  return query
    with counts as (
      select p.church_id as cid,
             count(*) filter (where p.role = 'priest')     as n_priests,
             count(*) filter (where p.role = 'servant')    as n_servants,
             count(*) filter (where p.role = 'congregant') as n_congregants,
             count(*) filter (where p.role = 'congregant' and p.foc_id is not null) as n_foc
      from profiles p group by p.church_id
    )
    select c.id, c.name,
           coalesce(n.n_priests, 0), coalesce(n.n_servants, 0),
           coalesce(n.n_congregants, 0), coalesce(n.n_foc, 0)
    from churches c
    left join counts n on n.cid = c.id
    where (c.source = 'manual' and c.hidden_at is null)
       or coalesce(n.n_priests, 0) + coalesce(n.n_servants, 0) + coalesce(n.n_congregants, 0) > 0
    union all
    select null::uuid, null::text, n.n_priests, n.n_servants, n.n_congregants, n.n_foc
    from counts n
    where n.cid is null and n.n_priests + n.n_servants + n.n_congregants > 0
    order by 2 asc nulls last;
end;
$$;

-- ── 5. Manual check (run after pasting; documented, not automated) ──────────
-- The Studio "Add user" dialog has no metadata field, so check through the
-- app: on the web build, sign up two throwaway accounts, one picking a church
-- from the list and one typing a name under "My church isn't listed", then
--   select full_name, church_id, church_name from public.profiles
--     where full_name in ('<name 1>', '<name 2>');
-- Expect: the first with the church's id and the row's own name; the second
-- with church_id null and the typed "name, city". The bad-id and hidden-row
-- paths (church_id that is not a uuid or names no visible row → both null,
-- or the typed name) were exercised against a local PGlite copy of this
-- schema before the file was committed. Delete the two accounts afterwards.
