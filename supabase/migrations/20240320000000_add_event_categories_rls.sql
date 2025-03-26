-- Enable RLS on event_categories table
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for event_categories
CREATE POLICY "Enable read access for all authenticated users" ON event_categories
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users" ON event_categories
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON event_categories
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON event_categories
    FOR DELETE
    TO authenticated
    USING (true); 