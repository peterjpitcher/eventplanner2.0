# Booking Cancellation SMS Template

This template is used when a booking is cancelled.

## Template Content

```
Hi {{customer_name}}, your booking for {{event_name}} on {{event_date}} at {{event_time}} has been cancelled. If this was not requested by you or if you have any questions, please contact us. The Anchor.
```

## Variables

- `{{customer_name}}` - Customer's first name
- `{{event_name}}` - Name of the event
- `{{event_date}}` - Date of the event (format: DD/MM/YYYY)
- `{{event_time}}` - Time of the event (format: HH:MM)

## Usage Notes

- This message is sent when a specific booking is cancelled
- A confirmation dialog with Yes/No options will be shown before sending this message 