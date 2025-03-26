-- Add foreign key relationships for bookings table
ALTER TABLE bookings
ADD CONSTRAINT bookings_customer_id_fkey
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE CASCADE;

ALTER TABLE bookings
ADD CONSTRAINT bookings_event_id_fkey
FOREIGN KEY (event_id)
REFERENCES events(id)
ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX bookings_customer_id_idx ON bookings(customer_id);
CREATE INDEX bookings_event_id_idx ON bookings(event_id); 