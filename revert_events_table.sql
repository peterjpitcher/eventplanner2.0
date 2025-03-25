-- Drop the new events table and restore the old one
DROP TABLE IF EXISTS events;

-- Rename old events table back to events
ALTER TABLE events_old RENAME TO events;

-- Update any foreign keys that reference events
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_event_id_fkey,
ADD CONSTRAINT bookings_event_id_fkey 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Recreate the original index
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events (start_time);

-- Remove the trigger function if no longer needed
DROP FUNCTION IF EXISTS update_modified_column();

-- Add back the RLS policies for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read events" 
  ON events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert events" 
  ON events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update events" 
  ON events FOR UPDATE TO authenticated USING (true);

-- Let's create a view that maps the old schema to the expected interface
CREATE OR REPLACE VIEW events_view AS
SELECT 
  id,
  name AS title,
  NULL AS description,
  category_id,
  start_time::date AS date,
  start_time::time AS start_time,
  NULL AS end_time,
  NULL AS duration,
  NULL AS price,
  capacity,
  NULL AS location,
  TRUE AS is_published,  -- Default to published
  FALSE AS is_canceled,  -- Default to not canceled
  created_at,
  created_at AS updated_at
FROM events;

-- To make the view updatable, we can create rules or triggers
-- For simplicity, let's create a function that can be used to insert/update events
CREATE OR REPLACE FUNCTION update_event(
  p_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_category_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_duration INTEGER,
  p_price DECIMAL,
  p_capacity INTEGER,
  p_location TEXT,
  p_is_published BOOLEAN,
  p_is_canceled BOOLEAN
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_id IS NULL THEN
    -- Insert new event
    INSERT INTO events (
      name,
      category_id,
      capacity,
      start_time,
      notes
    ) VALUES (
      p_title,
      p_category_id,
      p_capacity,
      (p_date || ' ' || p_start_time)::TIMESTAMP WITH TIME ZONE,
      p_description
    ) RETURNING id INTO v_id;
    
    RETURN v_id;
  ELSE
    -- Update existing event
    UPDATE events SET
      name = p_title,
      category_id = p_category_id,
      capacity = p_capacity,
      start_time = (p_date || ' ' || p_start_time)::TIMESTAMP WITH TIME ZONE,
      notes = p_description
    WHERE id = p_id;
    
    RETURN p_id;
  END IF;
END;
$$ LANGUAGE plpgsql; 