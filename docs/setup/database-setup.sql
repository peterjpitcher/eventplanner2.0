-- Event Management System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  mobile_number TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for searching by name and mobile number
CREATE INDEX IF NOT EXISTS idx_customers_first_name ON customers (first_name);
CREATE INDEX IF NOT EXISTS idx_customers_last_name ON customers (last_name);
CREATE INDEX IF NOT EXISTS idx_customers_mobile_number ON customers (mobile_number);

-- Event Categories table
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  default_capacity INTEGER NOT NULL,
  default_start_time TIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES event_categories(id),
  capacity INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for finding upcoming events
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events (start_time);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  seats_or_reminder TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for finding bookings by customer or event
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings (customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings (event_id);

-- SMS Messages table for tracking sent messages
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL, -- 'booking_confirmation', 'reminder', 'cancellation', etc.
  message_content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL, -- 'sent', 'delivered', 'failed', etc.
  message_sid TEXT -- Twilio message SID for status tracking
);

-- SMS Replies table for tracking customer replies
CREATE TABLE IF NOT EXISTS sms_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read customers" 
  ON customers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert customers" 
  ON customers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers" 
  ON customers FOR UPDATE TO authenticated USING (true);

-- Similar policies for other tables
CREATE POLICY "Authenticated users can read event_categories" 
  ON event_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert event_categories" 
  ON event_categories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update event_categories" 
  ON event_categories FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read events" 
  ON events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert events" 
  ON events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update events" 
  ON events FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read bookings" 
  ON bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert bookings" 
  ON bookings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update bookings" 
  ON bookings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read sms_messages" 
  ON sms_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert sms_messages" 
  ON sms_messages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read sms_replies" 
  ON sms_replies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update sms_replies" 
  ON sms_replies FOR UPDATE TO authenticated USING (true);

-- Create a function to standardize mobile numbers
CREATE OR REPLACE FUNCTION standardize_uk_mobile_number(mobile_number TEXT)
RETURNS TEXT AS $$
DECLARE
  standardized_number TEXT;
BEGIN
  -- Remove any non-numeric characters
  standardized_number := regexp_replace(mobile_number, '[^0-9]', '', 'g');
  
  -- UK mobile numbers are 11 digits and start with '07'
  IF length(standardized_number) = 11 AND substring(standardized_number, 1, 2) = '07' THEN
    RETURN standardized_number;
  -- Convert +44 format to local format
  ELSIF length(standardized_number) >= 12 AND substring(standardized_number, 1, 3) = '440' THEN
    RETURN '0' || substring(standardized_number, 4);
  ELSIF length(standardized_number) >= 12 AND substring(standardized_number, 1, 4) = '4407' THEN
    RETURN '0' || substring(standardized_number, 3);
  ELSE
    RETURN mobile_number; -- Return original if not matching patterns
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to standardize mobile numbers on insert or update
CREATE OR REPLACE FUNCTION trigger_standardize_mobile_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.mobile_number := standardize_uk_mobile_number(NEW.mobile_number);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER standardize_mobile_number
BEFORE INSERT OR UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION trigger_standardize_mobile_number(); 