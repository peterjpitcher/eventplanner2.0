-- First ensure we have the update_modified_column function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rename existing events table to events_old if it exists
ALTER TABLE IF EXISTS events RENAME TO events_old;

-- Create new events table with the revised structure
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES event_categories(id),
  capacity INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  is_published BOOLEAN DEFAULT true,
  is_canceled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Migrate data from old table to new table if old table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'events_old') THEN
    INSERT INTO events (
      id, 
      name, 
      description,
      category_id, 
      capacity, 
      start_time, 
      notes,
      is_published,
      is_canceled,
      created_at,
      updated_at
    )
    SELECT 
      id, 
      name,
      notes,
      category_id, 
      capacity, 
      start_time, 
      notes,
      true, -- Default all existing events to published
      false, -- Default all existing events to not canceled
      created_at,
      created_at
    FROM events_old;
  END IF;
END
$$;

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
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_event_id_fkey,
ADD CONSTRAINT bookings_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Create an index for faster querying
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events (start_time);

-- Create a view for compatibility with the TypeScript interface
CREATE OR REPLACE VIEW events_view AS
SELECT 
  id,
  name AS title,
  description,
  category_id,
  start_time::date AS date,
  start_time::time AS start_time,
  capacity,
  is_published,
  is_canceled,
  created_at,
  updated_at
FROM events;

-- Drop the old table if it exists (uncomment after verifying the migration)
-- DROP TABLE IF EXISTS events_old; 