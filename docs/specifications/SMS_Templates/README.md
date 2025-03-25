# SMS Templates

This directory contains the predefined SMS templates used by the Event Management System.

## Available Templates

- [Booking Confirmation](./booking_confirmation.md) - Sent when a new booking is created
- [Booking Reminder](./booking_reminder.md) - Sent as reminders before events (7 days and 24 hours)
- [Booking Cancellation](./booking_cancellation.md) - Sent when a specific booking is cancelled
- [Event Cancellation](./event_cancellation.md) - Sent to all customers when an event is cancelled

## Common Variables

These variables can be used in templates:

- `{{customer_name}}` - Customer's first name
- `{{event_name}}` - Name of the event
- `{{event_day_name}}` - Day of the week of the event (e.g., Monday, Tuesday) - used in 7-day reminder
- `{{event_date}}` - Date of the event (format: DD/MM/YYYY)
- `{{event_time}}` - Time of the event (format: HH:MM)
- `{{seats}}` - Number of seats booked (only in booking confirmation)
- `{{custom_message}}` - Optional custom message (only in event cancellation)

## Implementation Notes

- These templates are defined as system constants and are not editable through the UI
- Date and time formats should be consistent across all templates
- All messages include "The Anchor" signature
- All templates support reply functionality for customer responses 