# Database Schema

## Overview
The Event Planner 2.0 application uses Supabase (PostgreSQL) as its database. This document outlines the database schema, including tables, relationships, and constraints.

## Tables

### customers

- `id` (UUID, PK): Unique identifier for the customer
- `first_name` (TEXT): Customer's first name
- `last_name` (TEXT): Customer's last name
- `email` (TEXT, UNIQUE): Customer's email address
- `mobile_number` (TEXT): Customer's mobile number (standardized UK format)
- `notes` (TEXT, nullable): Additional notes about the customer
- `created_at` (TIMESTAMP): When the customer record was created
- `updated_at` (TIMESTAMP): When the customer record was last updated

### event_categories

- `id` (UUID, PK): Unique identifier for the category
- `name` (TEXT): Name of the category
- `description` (TEXT, nullable): Description of the category
- `default_capacity` (INTEGER): Default capacity for events in this category
- `default_start_time` (TIME): Default start time for events in this category
- `notes` (TEXT, nullable): Additional notes about the category
- `created_at` (TIMESTAMP): When the category was created
- `updated_at` (TIMESTAMP): When the category was last updated

### events

- `id` (UUID, PK): Unique identifier for the event
- `title` (TEXT): Title of the event
- `description` (TEXT, nullable): Description of the event
- `category_id` (UUID, FK): Reference to the event_categories table
- `date` (DATE): Date of the event
- `start_time` (TIME): When the event starts
- `capacity` (INTEGER): Maximum number of attendees
- `notes` (TEXT, nullable): Additional notes about the event
- `is_published` (BOOLEAN): Whether the event is published
- `is_canceled` (BOOLEAN): Whether the event has been canceled
- `created_at` (TIMESTAMP): When the event was created
- `updated_at` (TIMESTAMP): When the event was last updated
- `created_by` (UUID, FK): Reference to auth.users table

### bookings

- `id` (UUID, PK): Unique identifier for the booking
- `event_id` (UUID, FK): Reference to the events table
- `customer_id` (UUID, FK): Reference to the customers table
- `user_id` (UUID, FK): Reference to auth.users table
- `seats_or_reminder` (INTEGER): Number of seats booked or reminder preference
- `notes` (TEXT, nullable): Additional notes about the booking
- `status` (TEXT): Status of the booking (pending, confirmed, cancelled)
- `created_at` (TIMESTAMP): When the booking was created
- `updated_at` (TIMESTAMP): When the booking was last updated

### sms_messages

- `id` (UUID, PK): Unique identifier for the SMS message
- `customer_id` (UUID, FK): Reference to the customers table
- `booking_id` (UUID, FK, nullable): Reference to the bookings table
- `message_type` (TEXT): Type of message (booking_confirmation, reminder, cancellation, etc.)
- `content` (TEXT): Content of the SMS message
- `sent_at` (TIMESTAMP): When the message was sent
- `status` (TEXT): Status of the message (sent, delivered, failed, etc.)
- `message_sid` (TEXT): Twilio message SID for status tracking
- `created_at` (TIMESTAMP): When the record was created

### sms_replies

- `id` (UUID, PK): Unique identifier for the SMS reply
- `customer_id` (UUID, FK): Reference to the customers table
- `from_number` (TEXT): Phone number the reply came from
- `message_content` (TEXT): Content of the reply
- `received_at` (TIMESTAMP): When the reply was received
- `read` (BOOLEAN): Whether the reply has been read
- `created_at` (TIMESTAMP): When the record was created

## Views

### events_view

A view that provides a comprehensive view of events with related information:

- All fields from the events table
- `category_name` (TEXT): Name of the event category
- `creator_email` (TEXT): Email of the user who created the event

## Indexes

- `bookings_event_id_idx`: On bookings(event_id)
- `bookings_customer_id_idx`: On bookings(customer_id)
- `bookings_created_at_idx`: On bookings(created_at)
- `bookings_user_id_idx`: On bookings(user_id)
- `idx_events_category_id`: On events(category_id)
- `idx_events_created_by`: On events(created_by)
- `idx_messages_customer_id`: On messages(customer_id)
- `idx_sms_messages_customer_id`: On sms_messages(customer_id)
- `idx_sms_messages_booking_id`: On sms_messages(booking_id)

## Relationships

- Each event belongs to a category (events.category_id -> event_categories.id)
- Each event is created by a user (events.created_by -> auth.users.id)
- Each booking is for a specific event (bookings.event_id -> events.id) with ON DELETE CASCADE
- Each booking is for a specific customer (bookings.customer_id -> customers.id) with ON DELETE CASCADE
- Each booking belongs to a user (bookings.user_id -> auth.users.id) with ON DELETE CASCADE
- Each SMS message is for a specific customer (sms_messages.customer_id -> customers.id)
- Each SMS message can be associated with a booking (sms_messages.booking_id -> bookings.id)
- Each SMS reply is from a specific customer (sms_replies.customer_id -> customers.id)

## Row Level Security (RLS)

### Events Table RLS Policies
- Users can only view their own events
- Users can only insert events they create
- Users can only update their own events
- Users can only delete their own events

### Bookings Table RLS Policies
- Users can view their own bookings
- Users can create bookings
- Users can update their own bookings
- Users can delete their own bookings

### Other Tables
- Authenticated users can read all records
- Authenticated users can insert new records
- Authenticated users can update records
- Authenticated users can delete records

## Recent Changes

### Booking Table Updates
- Added foreign key relationships with ON DELETE CASCADE for both event_id and customer_id
- Added user_id column to track which user created the booking
- Created indexes on event_id, customer_id, and created_at for improved performance
- Implemented RLS policies to ensure users can only access their own bookings

## Triggers

### update_modified_column
Automatically updates the `updated_at` timestamp whenever a record is modified in tables that have this column.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
``` 