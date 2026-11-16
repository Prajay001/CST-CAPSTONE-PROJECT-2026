-- =====================================================
-- Subscription Sniper - ADMIN SQL functions (Week 9)
-- Run this whole file once in the Supabase SQL Editor.
--
-- 1. Security fix: normal users cannot change their own Role
-- 2. admin_list_users()          list every registered user
-- 3. admin_deactivate_user()     block a user from logging in for N days
-- 4. admin_reactivate_user()     lift the block
-- 5. admin_delete_user()         permanently delete a user and their data
--
-- Every admin function first checks is_admin(). An admin
-- cannot deactivate or delete themselves or another admin.
-- =====================================================


-- -----------------------------------------------------
-- 1. SECURITY FIX: stop users from making themselves admin
--    (the "update own profile" policy would otherwise let a
--    user change their own "Role" column)
-- -----------------------------------------------------
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    -- Direct database / service-role access has no logged-in user: allow
    if auth.uid() is null or public.is_admin() then
        return new;
    end if;

    -- A normal user can never choose or change a Role
    if tg_op = 'INSERT' then
        new."Role" := 'user';
    else
        new."Role" := old."Role";
    end if;
    return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
before insert or update on public.profiles
for each row execute function public.protect_profile_role();


-- -----------------------------------------------------
-- 2. LIST every registered user (admin only)
-- -----------------------------------------------------
create or replace function public.admin_list_users()
returns table (
    user_id        uuid,
    email          text,
    full_name      text,
    display_name   text,
    role           text,
    created_at     timestamptz,
    banned_until   timestamptz,
    is_deactivated boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'Not allowed' using errcode = '42501';
    end if;

    return query
    select
        u.id,
        u.email::text,
        p.full_name,
        p.display_name,
        coalesce(p."Role", 'user'),
        u.created_at,
        u.banned_until,
        (u.banned_until is not null and u.banned_until > now())
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.created_at desc;
end;
$$;


-- -----------------------------------------------------
-- 3. DEACTIVATE a user for a number of days (admin only)
--    Sets banned_until, which blocks login, and ends their
--    current sessions. Their data is kept.
-- -----------------------------------------------------
create or replace function public.admin_deactivate_user(p_user_id uuid, p_days integer)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
    v_until timestamptz;
begin
    if not public.is_admin() then
        raise exception 'Not allowed' using errcode = '42501';
    end if;
    if p_days is null or p_days < 1 or p_days > 3650 then
        raise exception 'Days must be between 1 and 3650' using errcode = '22023';
    end if;
    if p_user_id = auth.uid() then
        raise exception 'You cannot deactivate your own account' using errcode = '42501';
    end if;
    if exists (select 1 from public.profiles where id = p_user_id and "Role" = 'admin') then
        raise exception 'You cannot deactivate an administrator' using errcode = '42501';
    end if;

    v_until := now() + make_interval(days => p_days);

    update auth.users
    set banned_until = v_until
    where id = p_user_id;

    if not found then
        raise exception 'User not found' using errcode = 'P0002';
    end if;

    -- Sign them out everywhere right away
    delete from auth.sessions where user_id = p_user_id;

    return v_until;
end;
$$;


-- -----------------------------------------------------
-- 4. REACTIVATE a user (admin only)
-- -----------------------------------------------------
create or replace function public.admin_reactivate_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'Not allowed' using errcode = '42501';
    end if;

    update auth.users
    set banned_until = null
    where id = p_user_id;

    if not found then
        raise exception 'User not found' using errcode = 'P0002';
    end if;
end;
$$;


-- -----------------------------------------------------
-- 5. PERMANENTLY DELETE a user and all of their data (admin only)
-- -----------------------------------------------------
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'Not allowed' using errcode = '42501';
    end if;
    if p_user_id = auth.uid() then
        raise exception 'You cannot delete your own account' using errcode = '42501';
    end if;
    if exists (select 1 from public.profiles where id = p_user_id and "Role" = 'admin') then
        raise exception 'You cannot delete an administrator' using errcode = '42501';
    end if;
    if not exists (select 1 from auth.users where id = p_user_id) then
        raise exception 'User not found' using errcode = 'P0002';
    end if;

    delete from public.subscriptions where user_id = p_user_id;
    delete from public.profiles where id = p_user_id;
    delete from auth.users where id = p_user_id;
end;
$$;


-- -----------------------------------------------------
-- 6. Only logged-in users may call these (the functions
--    then check is_admin() themselves)
-- -----------------------------------------------------
revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

revoke all on function public.admin_deactivate_user(uuid, integer) from public, anon;
grant execute on function public.admin_deactivate_user(uuid, integer) to authenticated;

revoke all on function public.admin_reactivate_user(uuid) from public, anon;
grant execute on function public.admin_reactivate_user(uuid) to authenticated;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

notify pgrst, 'reload schema';