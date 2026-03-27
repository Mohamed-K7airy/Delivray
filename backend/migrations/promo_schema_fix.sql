-- Migration: Promo Schema Fix
-- Run this in your Supabase SQL Editor

-- 1. Add missing columns to promo_codes
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS min_subtotal NUMERIC DEFAULT 0;
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Rename existing columns for clarity (optional, but let's stick to what exists to avoid breaking other modules)
-- Actually, let's just make the code match these:
-- code (exists)
-- value (exists, we'll use for discount_amount)
-- expiry_date (exists, we'll use for expires_at)
-- type (exists, fixed or percentage)
