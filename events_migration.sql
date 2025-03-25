-- First create the update_modified_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rename existing events table to events_old
ALTER TABLE IF EXISTS events RENAME TO events_old;

-- Create new events table with updated structure
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES event_categories(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  duration INTEGER, -- in minutes
  price DECIMAL(10, 2),
  capacity INTEGER,
  location TEXT,
  is_published BOOLEAN DEFAULT false,
  is_canceled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Migrate data from old table to new table
INSERT INTO events (
  id, 
  title, 
  category_id, 
  date, 
  start_time, 
  capacity, 
  created_at,
  updated_at
)
SELECT 
  id, 
  name as title, 
  category_id, 
  start_time::date as date, 
  start_time::time as start_time, 
  capacity, 
  created_at,
  created_at as updated_at
FROM events_old;

-- Add RLS policies for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy for selecting events (any authenticated user can read)
CREATE POLICY select_events ON events 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for inserting events (any authenticated user can create)
CREATE POLICY insert_events ON events 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating events (any authenticated user can update)
CREATE POLICY update_events ON events 
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy for deleting events (any authenticated user can delete)
CREATE POLICY delete_events ON events 
  FOR DELETE USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Update any foreign keys that reference events
-- This will update the bookings table
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_event_id_fkey,
ADD CONSTRAINT bookings_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Recreate the index on the new table
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events (date, start_time);

-- Optionally drop the old table once everything is working
-- You can uncomment this after verifying the migration worked
-- DROP TABLE events_old; 