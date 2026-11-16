-- =====================================================
-- Subscription Sniper - SQL functions called by the app
-- (the React app calls these with supabase.rpc)
-- Run this whole file once in the Supabase SQL Editor.
-- Every function only returns the logged-in user's rows.
-- =====================================================


-- 1. Search, filter and sort the user's subscriptions
create or replace function public.list_subscriptions(
    p_search   text default '',
    p_trial    text default 'All',
    p_category text default 'All',
    p_cycle    text default 'All',
    p_sort     text default 'date'
)
returns setof public.subscriptions
language sql
stable
security invoker
set search_path = public
as $$
    select *
    from public.subscriptions
    where user_id = auth.uid()
      and (p_search = '' or service_name ilike '%' || p_search || '%')
      and (p_trial = 'All' or is_trial = (p_trial = 'Yes'))
      and (p_category = 'All' or category = p_category)
      and (p_cycle = 'All' or billing_cycle = p_cycle)
    order by
      case when p_sort = 'cost' then cost end desc nulls last,
      next_billing_date asc;
$$;


-- 2. Dashboard numbers in one call:
--    monthly burn rate, yearly projection, count,
--    category breakdown and the 48-hour alerts
create or replace function public.dashboard_summary()
returns json
language sql
stable
security invoker
set search_path = public
as $$
    with mine as (
        select *
        from public.subscriptions
        where user_id = auth.uid()
    ),
    by_category as (
        select
            coalesce(category, 'Uncategorized') as category,
            count(*) as sub_count,
            sum(case when billing_cycle = 'Annual' then cost / 12 else cost end) as monthly_cost
        from mine
        group by 1
    ),
    totals as (
        select
            coalesce(sum(case when billing_cycle = 'Annual' then cost / 12 else cost end), 0) as monthly_burn_rate,
            coalesce(sum(case when billing_cycle = 'Monthly' then cost * 12 else cost end), 0) as yearly_projection,
            count(*) as subscription_count
        from mine
    ),
    today as (
        select (now() at time zone 'America/Toronto')::date as d
    )
    select json_build_object(
        'monthly_burn_rate', round(t.monthly_burn_rate, 2),
        'yearly_projection', round(t.yearly_projection, 2),
        'subscription_count', t.subscription_count,
        'categories', coalesce((
            select json_agg(
                json_build_object(
                    'category', c.category,
                    'count', c.sub_count,
                    'monthly_cost', round(c.monthly_cost, 2),
                    'percent', case when t.monthly_burn_rate > 0
                        then round(100 * c.monthly_cost / t.monthly_burn_rate, 1)
                        else 0 end
                )
                order by c.monthly_cost desc
            )
            from by_category c
        ), '[]'::json),
        'alerts', coalesce((
            select json_agg(
                json_build_object(
                    'id', m.id,
                    'service_name', m.service_name,
                    'cost', m.cost,
                    'next_billing_date', m.next_billing_date
                )
                order by m.next_billing_date
            )
            from mine m, today
            where m.next_billing_date between today.d and today.d + 2
        ), '[]'::json)
    )
    from totals t;
$$;


-- 3. Only logged-in users may call these (not anonymous visitors)
revoke all on function public.list_subscriptions(text, text, text, text, text) from public, anon;
grant execute on function public.list_subscriptions(text, text, text, text, text) to authenticated;

revoke all on function public.dashboard_summary() from public, anon;
grant execute on function public.dashboard_summary() to authenticated;

notify pgrst, 'reload schema';