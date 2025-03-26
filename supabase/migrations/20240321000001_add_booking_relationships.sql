-- Add foreign key relationships for bookings table if they don't exist
DO $$ 
BEGIN
    -- Add event_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_event_id_fkey'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT bookings_event_id_fkey
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE;
    END IF;

    -- Add customer_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_customer_id_fkey'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT bookings_customer_id_fkey
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
    -- Create event_id index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'bookings_event_id_idx'
    ) THEN
        CREATE INDEX bookings_event_id_idx ON bookings(event_id);
    END IF;

    -- Create customer_id index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'bookings_customer_id_idx'
    ) THEN
        CREATE INDEX bookings_customer_id_idx ON bookings(customer_id);
    END IF;

    -- Create created_at index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'bookings_created_at_idx'
    ) THEN
        CREATE INDEX bookings_created_at_idx ON bookings(created_at);
    END IF;
END $$;

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE bookings
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index for user_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'bookings_user_id_idx'
    ) THEN
        CREATE INDEX bookings_user_id_idx ON bookings(user_id);
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;

-- Create RLS policies
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
ON bookings FOR DELETE
USING (auth.uid() = user_id); 