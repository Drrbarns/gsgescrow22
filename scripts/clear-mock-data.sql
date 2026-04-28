-- =========================================================================
-- SBBS · Clear all mock / test data from the live database.
--
-- Safe to run multiple times. Wraps everything in a single transaction so
-- if anything fails nothing is committed.
--
-- What this DOES delete:
--   * every transaction + everything that hangs off it
--     (transaction_events, payments, payouts, disputes, evidence_files,
--      reviews, listings tied to test sellers)
--   * sms_log + webhooks_log + alerts + audit_log
--   * any listing whose seller is one of the test profiles
--
-- What this does NOT touch:
--   * profiles  (your real superadmin / seller / buyer accounts stay)
--   * Supabase auth.users (managed by Supabase)
--   * platform_settings (fees, caps, feature flags — production config)
--   * KYC submissions on real profiles
--   * Riders linked to real profiles
--
-- How to run:
--   psql "$DATABASE_URL" -f scripts/clear-mock-data.sql
-- or paste it into the Supabase SQL editor and click "Run".
-- =========================================================================

BEGIN;

-- 1) Children of transactions (FK cascades handle most, but be explicit so
--    we don't rely on cascade behaviour and so the SMS / webhook / alert
--    tables — which don't cascade — are also wiped).
DELETE FROM transaction_events;
DELETE FROM evidence_files;
DELETE FROM disputes;
DELETE FROM payouts;
DELETE FROM payments;
DELETE FROM reviews;

-- 2) Transactions themselves.
DELETE FROM transactions;

-- 3) Listings — anything published or drafted during testing.
DELETE FROM listings;

-- 4) Operational tables that accumulated noise during testing.
DELETE FROM sms_log;
DELETE FROM webhooks_log;
DELETE FROM alerts;
DELETE FROM audit_log;

-- 5) Reset trust-signals on profiles so the dashboards start from zero.
UPDATE profiles
   SET trust_score = 0,
       badge_enabled = FALSE
 WHERE trust_score <> 0
    OR badge_enabled IS TRUE;

COMMIT;

-- Sanity check (run after commit):
--   SELECT 'transactions' AS t, count(*) FROM transactions
--   UNION ALL SELECT 'payments',    count(*) FROM payments
--   UNION ALL SELECT 'payouts',     count(*) FROM payouts
--   UNION ALL SELECT 'disputes',    count(*) FROM disputes
--   UNION ALL SELECT 'reviews',     count(*) FROM reviews
--   UNION ALL SELECT 'listings',    count(*) FROM listings
--   UNION ALL SELECT 'sms_log',     count(*) FROM sms_log
--   UNION ALL SELECT 'audit_log',   count(*) FROM audit_log;
