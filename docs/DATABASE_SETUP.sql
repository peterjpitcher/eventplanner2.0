-- Table for events (Phase 5)
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES event_categories(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  capacity INTEGER,
  notes TEXT,
  is_published BOOLEAN DEFAULT false,
  is_canceled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

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