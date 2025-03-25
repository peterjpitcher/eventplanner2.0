# Event Cancellation SMS Template

This template is used when an entire event is cancelled.

## Template Content

```
Important notice: {{event_name}} on {{event_date}} at {{event_time}} has been cancelled. We apologise for any inconvenience caused. {{custom_message}} The Anchor.
```

## Variables

- `{{event_name}}` - Name of the event
- `{{event_date}}` - Date of the event (format: DD/MM/YYYY)
- `{{event_time}}` - Time of the event (format: HH:MM)
- `{{custom_message}}` - Optional custom message explaining the cancellation reason

## Usage Notes

- This message is sent to all customers booked for an event when the event is cancelled
- A confirmation dialog with Yes/No options will be shown before sending this message to all affected customers
- The custom message is optional and can be left blank 