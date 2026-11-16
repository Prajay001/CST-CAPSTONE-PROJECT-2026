-- =====================================================
-- Subscription Sniper - SQL queries used by the app
-- Database: Supabase (PostgreSQL)
-- Table: subscriptions (id, user_id, service_name, cost,
--        billing_cycle, next_billing_date, is_trial,
--        category, created_at)
--
-- In the app, Row Level Security already limits every query
-- to the logged-in user. Here the filter is written out so
-- you can see it: "where user_id = auth.uid()".
-- To test in the Supabase SQL Editor (which has no logged-in
-- user), replace auth.uid() with a user id copied from
-- Authentication > Users, like '1234-...'::uuid
-- =====================================================


-- 1. CREATE: add a subscription (user_id is filled in automatically)
insert into subscriptions
    (service_name, cost, billing_cycle, next_billing_date, is_trial, category)
values
    ('Netflix', 15.99, 'Monthly', '2026-11-20', false, 'Entertainment');


-- 2. READ: all of one user's subscriptions
select *
from subscriptions
where user_id = auth.uid();


-- 3. UPDATE: change the cost of one subscription
update subscriptions
set cost = 17.99
where id = 1
  and user_id = auth.uid();


-- 4. DELETE: remove one subscription
delete from subscriptions
where id = 1
  and user_id = auth.uid();


-- 5. SEARCH: by service name (not case sensitive)
select *
from subscriptions
where user_id = auth.uid()
  and service_name ilike '%spotify%';


-- 6. FILTER: by trial status, category and billing cycle
select *
from subscriptions
where user_id = auth.uid()
  and is_trial = true;

select *
from subscriptions
where user_id = auth.uid()
  and category = 'Productivity';

select *
from subscriptions
where user_id = auth.uid()
  and billing_cycle = 'Annual';


-- 7. SORT: by next billing date (soonest first) or cost (highest first)
select *
from subscriptions
where user_id = auth.uid()
order by next_billing_date asc;

select *
from subscriptions
where user_id = auth.uid()
order by cost desc;


-- 8. MONTHLY BURN RATE: annual plans are divided by 12
select
    coalesce(
        round(sum(case when billing_cycle = 'Annual' then cost / 12 else cost end), 2),
        0
    ) as monthly_burn_rate
from subscriptions
where user_id = auth.uid();


-- 9. YEARLY PROJECTION: monthly plans x 12, annual plans counted once
select
    coalesce(
        round(sum(case when billing_cycle = 'Monthly' then cost * 12 else cost end), 2),
        0
    ) as yearly_projection
from subscriptions
where user_id = auth.uid();


-- 10. CATEGORY BREAKDOWN: monthly cost and percent per category
with by_category as (
    select
        coalesce(category, 'Uncategorized') as category,
        sum(case when billing_cycle = 'Annual' then cost / 12 else cost end) as monthly_cost
    from subscriptions
    where user_id = auth.uid()
    group by coalesce(category, 'Uncategorized')
)
select
    category,
    round(monthly_cost, 2) as monthly_cost,
    round(100 * monthly_cost / sum(monthly_cost) over (), 1) as percent
from by_category
order by monthly_cost desc;


-- 11. 48-HOUR ALERT: bills due today, tomorrow or the day after
select service_name, cost, next_billing_date
from subscriptions
where user_id = auth.uid()
  and next_billing_date between
      (now() at time zone 'America/Toronto')::date
      and (now() at time zone 'America/Toronto')::date + 2
order by next_billing_date asc;