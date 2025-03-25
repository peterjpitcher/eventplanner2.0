# Booking Reminder SMS Template

This template is used for sending reminder messages for upcoming events.

## Template Content

### 7-Day Reminder
```
Hi {{customer_name}}, this is a reminder about your booking for {{event_name}} next {{event_day_name}} at {{event_time}}. We look forward to seeing you here! Reply to this message if you need to make any changes. The Anchor.
```

### 24-Hour Reminder
```
Hi {{customer_name}}, just a reminder that you're booked for {{event_name}} tomorrow at {{event_time}}. We look forward to seeing you! Reply to this message if you need to make any changes. The Anchor.
```

## Variables

- `{{customer_name}}` - Customer's first name
- `{{event_name}}` - Name of the event
- `{{event_day_name}}` - Day of the week of the event (e.g., Monday, Tuesday)
- `{{event_date}}` - Date of the event (format: DD/MM/YYYY)
- `{{event_time}}` - Time of the event (format: HH:MM)

## Usage Notes

- The 7-day reminder is sent exactly 7 days before the event
- The 24-hour reminder is sent exactly 24 hours before the event
- If either time point has already passed when booking is created, that reminder is not sent 