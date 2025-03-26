-- Migration: Update Events Schema
-- Description: Updates the events table to match PRD specifications
-- Rollback: Yes

-- Create function for updating modified column if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Begin transaction
BEGIN;

-- Drop existing events table and all dependent objects
DROP TABLE IF EXISTS events CASCADE;

-- Create new events table with updated schema
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES event_categories(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    capacity INTEGER NOT NULL,
    notes TEXT,
    is_published BOOLEAN DEFAULT false,
    is_canceled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id)
);

-- Recreate the events_view
CREATE OR REPLACE VIEW events_view AS
SELECT 
    e.*,
    ec.name as category_name,
    u.email as creator_email
FROM events e
LEFT JOIN event_categories ec ON e.category_id = ec.id
LEFT JOIN auth.users u ON e.created_by = u.id;

-- Recreate the bookings table with foreign key
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own events"
    ON events FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events"
    ON events FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events"
    ON events FOR DELETE
    USING (auth.uid() = created_by);

-- Create trigger for updating modified column
CREATE TRIGGER update_events_modified_column
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Commit transaction
COMMIT;

-- Rollback procedure (if needed)
-- BEGIN;
-- DROP TABLE IF EXISTS events CASCADE;
-- COMMIT; 