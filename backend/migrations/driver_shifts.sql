-- 9. Driver Shifts Table
CREATE TABLE IF NOT EXISTS driver_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE driver_shifts ENABLE ROW LEVEL SECURITY;

-- Policy: Drivers can view and manage their own shifts
CREATE POLICY "Drivers can view their own shifts" ON driver_shifts FOR SELECT USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = driver_shifts.driver_id AND drivers.user_id = auth.uid())
);
CREATE POLICY "Drivers can create their own shifts" ON driver_shifts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = driver_shifts.driver_id AND drivers.user_id = auth.uid())
);
CREATE POLICY "Drivers can update their own shifts" ON driver_shifts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = driver_shifts.driver_id AND drivers.user_id = auth.uid())
);

-- Policy: Admins can see all shifts
CREATE POLICY "Admins can view all shifts" ON driver_shifts FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);
