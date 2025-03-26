-- Create sms_templates table
CREATE TABLE IF NOT EXISTS sms_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    placeholders TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_sms_templates_updated_at
BEFORE UPDATE ON sms_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default templates if they don't exist
INSERT INTO sms_templates (id, name, description, content, placeholders)
VALUES 
('booking_confirmation', 'Booking Confirmation', 'Sent when a booking is created', 
'Hi {customer_name}, your booking for {event_name} on {event_date} at {event_time} is confirmed. You have reserved {seats} seat(s). We look forward to seeing you!',
'{"{customer_name}","{event_name}","{event_date}","{event_time}","{seats}"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sms_templates (id, name, description, content, placeholders)
VALUES 
('reminder_7day', '7-Day Reminder', 'Sent 7 days before an event', 
'Hi {customer_name}, this is a reminder about {event_name} on {event_date} at {event_time}. You have {seats} seat(s) reserved. See you then!',
'{"{customer_name}","{event_name}","{event_date}","{event_time}","{seats}"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sms_templates (id, name, description, content, placeholders)
VALUES 
('reminder_24hr', '24-Hour Reminder', 'Sent 24 hours before an event', 
'Hi {customer_name}, just a reminder that {event_name} is tomorrow at {event_time}. You have {seats} seat(s) reserved. Looking forward to seeing you!',
'{"{customer_name}","{event_name}","{event_time}","{seats}"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sms_templates (id, name, description, content, placeholders)
VALUES 
('booking_cancellation', 'Booking Cancellation', 'Sent when a booking is cancelled', 
'Hi {customer_name}, your booking for {event_name} on {event_date} at {event_time} has been cancelled. Please contact us if you have any questions.',
'{"{customer_name}","{event_name}","{event_date}","{event_time}"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sms_templates (id, name, description, content, placeholders)
VALUES 
('event_cancellation', 'Event Cancellation', 'Sent when an event is cancelled', 
'Hi {customer_name}, we regret to inform you that {event_name} on {event_date} at {event_time} has been cancelled. We apologize for any inconvenience.',
'{"{customer_name}","{event_name}","{event_date}","{event_time}"}')
ON CONFLICT (id) DO NOTHING; 