# Booking Management

This document outlines the booking management functionality implemented in Phase 6 of the Event Planner 2.0 project.

## Overview

The booking management system allows users to:
- Create bookings for events with customer associations
- View all bookings for a specific event
- Edit existing bookings
- Delete bookings

## Database Structure

Bookings are stored in the `bookings` table with the following schema:

```sql
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
```

### Relationships
- Each booking is associated with exactly one customer and one event
- The `ON DELETE CASCADE` ensures that when a customer or event is deleted, all associated bookings are automatically removed
- Indexes are created for both customer_id and event_id to optimize query performance

## Service Layer

The booking service (`booking-service.ts`) provides the following functionality:

- **getBookings()**: Retrieve all bookings with customer and event information
- **getBookingsByEvent(eventId)**: Retrieve all bookings for a specific event
- **getBookingsByCustomer(customerId)**: Retrieve all bookings for a specific customer
- **getBookingById(id)**: Retrieve a specific booking by ID
- **createBooking(booking)**: Create a new booking
- **updateBooking(id, booking)**: Update an existing booking
- **deleteBooking(id)**: Delete a booking

## UI Components

### BookingList

This component displays all bookings for a specific event. Features include:
- Customer name and contact details
- Seats/reminder preference display
- Booking notes display
- Edit and delete options for each booking

### BookingForm

A reusable form component for both creating and editing bookings. Features include:
- Customer search functionality
- Customer dropdown selection
- Seats/reminder preference selection
- Notes field for additional booking information

### QuickBook

A component that provides a streamlined interface for creating bookings from the event details page. Features include:
- Collapsible form that only appears when needed
- Success notification and automatic refresh on completion

## User Flow

### Creating a Booking
1. Navigate to an event's details page
2. Click "Add Booking" in the Quick Book section
3. Search for a customer or select from the dropdown
4. Choose the seats/reminder preference
5. Add optional notes
6. Click "Create Booking"

### Editing a Booking
1. Navigate to an event's details page
2. Find the booking in the list
3. Click "Edit"
4. Modify customer, seats/reminder, or notes
5. Click "Update Booking"

### Deleting a Booking
1. Navigate to an event's details page
2. Find the booking in the list
3. Click "Delete"
4. Confirm deletion in the confirmation dialog

## Future Enhancements (Phase 7+)

The current booking system provides basic functionality without SMS notifications. Future phases will add:

1. SMS notifications for booking confirmations
2. SMS reminders (7-day and 24-hour)
3. SMS notifications for booking cancellations
4. Handling of customer SMS replies
5. Batch operations for bookings

## Known Limitations

- No automatic capacity tracking (bookings can exceed event capacity)
- No SMS notifications (planned for Phase 7)
- No waitlist functionality

## User Guide

See the [User Guide](/docs/user-guides/README.md#booking-management) for detailed instructions on using the booking management functionality. 