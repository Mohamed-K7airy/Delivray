-- Migration: Phase 1 Fixes
-- Run this in your Supabase SQL Editor

-- 1. Update Stores Table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true;

-- 2. Update Orders Table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) DEFAULT 3.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- 3. Update existing orders (optional, but good for data consistency)
UPDATE orders SET subtotal = total_price - 3.00, delivery_fee = 3.00 WHERE delivery_fee IS NULL;
