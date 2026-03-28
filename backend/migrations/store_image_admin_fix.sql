-- Add image_url and admin_disabled to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS admin_disabled BOOLEAN DEFAULT false;

-- Update existing stores with fallback logic if needed
-- (Not strictly necessary if frontend handles it)
