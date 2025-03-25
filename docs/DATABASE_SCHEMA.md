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
- `name` (TEXT): Name of the event
- `description` (TEXT, nullable): Description of the event
- `category_id` (UUID, FK): Reference to the event_categories table
- `capacity` (INTEGER): Maximum number of attendees
- `start_time` (TIMESTAMP): When the event starts
- `notes` (TEXT, nullable): Additional notes about the event
- `is_published` (BOOLEAN): Whether the event is published
- `is_canceled` (BOOLEAN): Whether the event has been canceled
- `created_at` (TIMESTAMP): When the event was created
- `updated_at` (TIMESTAMP): When the event was last updated

### bookings

- `id` (UUID, PK): Unique identifier for the booking
- `customer_id` (UUID, FK): Reference to the customers table
- `event_id` (UUID, FK): Reference to the events table
- `seats_or_reminder` (TEXT): Number of seats booked or reminder flag
- `notes` (TEXT, nullable): Additional notes about the booking
- `created_at` (TIMESTAMP): When the booking was created

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

A view that maps the events table to the expected interface in the application:

- `id` -> `id`
- `name` -> `title`
- `description` -> `description`
- `category_id` -> `category_id`
- `start_time::date` -> `date`
- `start_time::time` -> `start_time`
- `capacity` -> `capacity`
- `is_published` -> `is_published`
- `is_canceled` -> `is_canceled`
- `created_at` -> `created_at`
- `updated_at` -> `updated_at`

## Relationships

- Each event belongs to a category (events.category_id -> event_categories.id)
- Each booking is for a specific event (bookings.event_id -> events.id)
- Each booking is for a specific customer (bookings.customer_id -> customers.id)
- Each SMS message is for a specific customer (sms_messages.customer_id -> customers.id)
- Each SMS message can be associated with a booking (sms_messages.booking_id -> bookings.id)
- Each SMS reply is from a specific customer (sms_replies.customer_id -> customers.id)

## Row Level Security (RLS)

All tables have Row Level Security (RLS) policies that allow authenticated users to select, insert, and update rows. 