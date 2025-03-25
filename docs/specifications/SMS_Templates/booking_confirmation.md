# Booking Confirmation SMS Template

This template is used when a new booking is created.

## Template Content

```
Hi {{customer_name}}, your booking for {{event_name}} on {{event_date}} at {{event_time}} is confirmed. We've reserved {{seats}} seat(s) for you. Reply to this message if you need to make any changes. The Anchor.
```

## Variables

- `{{customer_name}}` - Customer's first name
- `{{event_name}}` - Name of the event
- `{{event_date}}` - Date of the event (format: DD/MM/YYYY)
- `{{event_time}}` - Time of the event (format: HH:MM)
- `{{seats}}` - Number of seats booked

## Usage Notes

- This message is automatically sent when a booking is created
- For "reminder only" bookings, this message is not sent 