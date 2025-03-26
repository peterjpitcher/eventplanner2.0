-- Migration: Fix Events RLS Policies
-- Description: Updates the RLS policies for the events table to allow any authenticated user to create events
-- Rollback: Yes

-- Begin transaction
BEGIN;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Users can insert their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- Create new RLS policies
CREATE POLICY "Authenticated users can view events"
    ON events FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert events"
    ON events FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update events"
    ON events FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete events"
    ON events FOR DELETE
    USING (auth.role() = 'authenticated');

-- Commit transaction
COMMIT;

-- Rollback procedure (if needed)
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can view events" ON events;
-- DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
-- DROP POLICY IF EXISTS "Authenticated users can update events" ON events;
-- DROP POLICY IF EXISTS "Authenticated users can delete events" ON events;
-- 
-- CREATE POLICY "Users can view their own events"
--     ON events FOR SELECT
--     USING (auth.uid() = created_by);
-- 
-- CREATE POLICY "Users can insert their own events"
--     ON events FOR INSERT
--     WITH CHECK (auth.uid() = created_by);
-- 
-- CREATE POLICY "Users can update their own events"
--     ON events FOR UPDATE
--     USING (auth.uid() = created_by)
--     WITH CHECK (auth.uid() = created_by);
-- 
-- CREATE POLICY "Users can delete their own events"
--     ON events FOR DELETE
--     USING (auth.uid() = created_by);
-- COMMIT; 