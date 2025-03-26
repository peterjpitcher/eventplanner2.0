# Database Schema

This document outlines the database schema for the Event Planner application.

## Tables

### customers

- `id` (UUID, PK): Unique identifier for the customer
- `first_name` (TEXT): Customer's first name
- `last_name` (TEXT, nullable): Customer's last name
- `mobile_number` (TEXT): Customer's mobile number (standardized UK format)
- `notes` (TEXT, nullable): Additional notes about the customer
- `created_at` (TIMESTAMP): When the customer record was created

### event_categories

- `id` (UUID, PK): Unique identifier for the category
- `name` (TEXT): Name of the category
- `default_capacity` (INTEGER): Default capacity for events in this category
- `default_start_time` (TIME): Default start time for events in this category
- `notes` (TEXT, nullable): Additional notes about the category
- `created_at` (TIMESTAMP): When the category was created

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
- `status` (TEXT): Status of the booking (pending, confirmed, cancelled)
- `created_at` (TIMESTAMP): When the booking was created
- `updated_at` (TIMESTAMP): When the booking was last updated

### sms_messages

- `id` (UUID, PK): Unique identifier for the SMS message
- `customer_id` (UUID, FK): Reference to the customers table
- `booking_id` (UUID, FK, nullable): Reference to the bookings table
- `message_type` (TEXT): Type of message (booking_confirmation, reminder, cancellation, etc.)
- `message_content` (TEXT): Content of the SMS message
- `sent_at` (TIMESTAMP): When the message was sent
- `status` (TEXT): Status of the message (sent, delivered, failed, etc.)
- `message_sid` (TEXT): Twilio message SID for status tracking

### sms_replies

- `id` (UUID, PK): Unique identifier for the SMS reply
- `customer_id` (UUID, FK): Reference to the customers table
- `from_number` (TEXT): Phone number the reply came from
- `message_content` (TEXT): Content of the reply
- `received_at` (TIMESTAMP): When the reply was received
- `read` (BOOLEAN): Whether the reply has been read

## Views

### events_view

A view that provides a comprehensive view of events with related information:

- All fields from the events table
- `category_name` (TEXT): Name of the event category
- `creator_email` (TEXT): Email of the user who created the event

## Relationships

- Each event belongs to a category (events.category_id -> event_categories.id)
- Each event is created by a user (events.created_by -> auth.users.id)
- Each booking is for a specific event (bookings.event_id -> events.id)
- Each booking is for a specific customer (bookings.customer_id -> customers.id)
- Each SMS message is for a specific customer (sms_messages.customer_id -> customers.id)
- Each SMS message can be associated with a booking (sms_messages.booking_id -> bookings.id)
- Each SMS reply is from a specific customer (sms_replies.customer_id -> customers.id)

## Row Level Security (RLS)

All tables have Row Level Security (RLS) policies that restrict access based on user authentication:

### Events Table RLS Policies
- Users can only view their own events
- Users can only insert events they create
- Users can only update their own events
- Users can only delete their own events

### Other Tables
- Authenticated users can read all records
- Authenticated users can insert new records
- Authenticated users can update records
- Authenticated users can delete records

## Triggers

### update_modified_column
Automatically updates the `updated_at` timestamp whenever a record is modified in tables that have this column. 