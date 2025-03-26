-- Create SMS Templates Table
CREATE TABLE IF NOT EXISTS sms_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  placeholders TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Trigger for updated_at (drop first if exists)
DROP TRIGGER IF EXISTS update_sms_templates_updated_at ON sms_templates;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sms_templates_updated_at
  BEFORE UPDATE ON sms_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Truncate existing data to replace with new templates
TRUNCATE TABLE sms_templates;

-- Insert default templates
INSERT INTO "public"."sms_templates" ("id", "name", "description", "content", "placeholders", "created_at", "updated_at") 
VALUES 
('booking_cancellation', 'Booking Cancellation', 'Sent when a booking is cancelled', 'Hi {customer_name}, your booking for {event_name} on {event_date} at {event_time} has been cancelled. Please contact us if you have any questions.', ARRAY['customer_name', 'event_name', 'event_date', 'event_time'], NOW(), NOW()),
('booking_confirmation', 'Booking Confirmation', 'Sent when a booking is created', 'Hi {customer_name}, your booking for {event_name} on {event_date} at {event_time} is confirmed. You have reserved {seats} seat(s). We look forward to seeing you!', ARRAY['customer_name', 'event_name', 'event_date', 'event_time', 'seats'], NOW(), NOW()),
('event_cancellation', 'Event Cancellation', 'Sent when an event is cancelled', 'Hi {customer_name}, we regret to inform you that {event_name} on {event_date} at {event_time} has been cancelled. We apologize for any inconvenience.', ARRAY['customer_name', 'event_name', 'event_date', 'event_time'], NOW(), NOW()),
('reminder_24hr', '24-Hour Reminder', 'Sent 24 hours before an event', 'Hi {customer_name}, just a reminder that {event_name} is tomorrow at {event_time}. You have {seats} seat(s) reserved. Looking forward to seeing you!', ARRAY['customer_name', 'event_name', 'event_time', 'seats'], NOW(), NOW()),
('reminder_7day', '7-Day Reminder', 'Sent 7 days before an event', 'Hi {customer_name}, this is a reminder about {event_name} on {event_date} at {event_time}. You have {seats} seat(s) reserved. See you then!', ARRAY['customer_name', 'event_name', 'event_date', 'event_time', 'seats'], NOW(), NOW());

-- Add columns to bookings table for reminder tracking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_7day_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_24hr_sent BOOLEAN DEFAULT FALSE; 