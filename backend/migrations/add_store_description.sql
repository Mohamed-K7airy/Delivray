-- Add description field to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS description TEXT;
