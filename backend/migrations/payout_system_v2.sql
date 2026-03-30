-- Migration: Phase 1 Payouts & Database Additions
-- Please run this script in your Supabase SQL Editor.

-- 1. Create Payouts Table (if it's a completely new database)
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES auth.users(id), 
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely add the NEW required Phase 1 columns if the table already existed
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES drivers(id);
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS payout_type VARCHAR(50) DEFAULT 'merchant_withdrawal';

-- 2. Create User Addresses Table
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    label VARCHAR(50) DEFAULT 'Home', -- e.g. Home, Work
    address_line_1 TEXT NOT NULL,
    city VARCHAR(100),
    location_lat NUMERIC,
    location_lng NUMERIC,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Favourites Table (Wishlist)
CREATE TABLE IF NOT EXISTS favourites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    store_id UUID REFERENCES stores(id),
    product_id UUID REFERENCES products(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, store_id), -- Ensure a user can only favorite a store once
    UNIQUE(user_id, product_id) -- Ensure a user can only favorite a product once
);

-- 4. Create Notifications Table (Push / System alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS Policies
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payouts" ON payouts FOR SELECT USING (
  auth.uid() = merchant_id OR 
  auth.uid() IN (SELECT user_id FROM drivers WHERE id = driver_id)
);
CREATE POLICY "Admins can manage payouts" ON payouts FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own addresses" ON user_addresses FOR ALL USING (auth.uid() = user_id);

ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favs" ON favourites FOR ALL USING (auth.uid() = user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
