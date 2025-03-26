# SMS Integration Guide

This document provides comprehensive information about the SMS integration in the Event Planner 2.0 application. It covers setup, configuration, and usage of the SMS functionality.

## Overview

The SMS integration allows the application to:
- Send booking confirmations
- Send automated reminders (7-day and 24-hour)
- Send cancellation notifications
- Process customer replies

## Prerequisites

The SMS functionality requires a Twilio account:
- [Twilio](https://www.twilio.com/) - For sending and receiving SMS messages

## Environment Configuration

Add the following environment variables to your `.env.local` file:

```
# Twilio Configuration for SMS
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# SMS Configuration
SMS_SIMULATION=true  # Set to 'true' in development to simulate SMS without actual sending
SMS_ENABLED=true     # Master switch to enable/disable SMS functionality
```

- `TWILIO_ACCOUNT_SID`: Found in your Twilio Console dashboard
- `TWILIO_AUTH_TOKEN`: Found in your Twilio Console dashboard
- `TWILIO_PHONE_NUMBER`: The Twilio phone number you purchased (in E.164 format, e.g., +447123456789)
- `SMS_SIMULATION`: Set to 'true' during development to avoid sending actual messages
- `SMS_ENABLED`: Master switch to enable/disable all SMS functionality

## SMS Templates

The system uses templates for different types of messages. Templates are stored in the database and can be managed through the admin interface.

### Template Placeholders

Templates use placeholders in the format `{placeholder_name}` that get replaced with actual values when a message is sent.

Available placeholders include:
- `{customer_name}` - Customer's full name
- `{event_name}` - Name of the event
- `{event_date}` - Date of the event (formatted)
- `{event_time}` - Time of the event
- `{seats}` - Number of seats booked

### Default Templates

The system comes with the following default templates:

#### Booking Confirmation
```
Hi {customer_name}, your booking for {event_name} on {event_date} at {event_time} is confirmed. You have reserved {seats} seat(s). We look forward to seeing you!
```

#### Booking Cancellation
```
Hi {customer_name}, your booking for {event_name} on {event_date} at {event_time} has been cancelled. Please contact us if you have any questions.
```

#### Event Cancellation
```
Hi {customer_name}, we regret to inform you that {event_name} on {event_date} at {event_time} has been cancelled. We apologize for any inconvenience.
```

#### 7-Day Reminder
```
Hi {customer_name}, this is a reminder about {event_name} on {event_date} at {event_time}. You have {seats} seat(s) reserved. See you then!
```

#### 24-Hour Reminder
```
Hi {customer_name}, just a reminder that {event_name} is tomorrow at {event_time}. You have {seats} seat(s) reserved. Looking forward to seeing you!
```

## Template Management

You can manage SMS templates through the admin interface at `/sms-templates`. This interface provides:

1. **Template Editing** - Modify the content and description of templates
2. **Template Preview** - See how a template will appear with sample data
3. **Test Sending** - Send a test message using the template to verify it works correctly

## Implementation Details

### SMS Template System

The SMS template system consists of:

1. **Database Storage** - Templates are stored in the `sms_templates` table
2. **Template Loading** - Templates are loaded from the database when needed
3. **Placeholder Replacement** - Placeholders are replaced with actual values

### SMS Sending Process

When sending an SMS:

1. The system loads the appropriate template
2. Placeholders are replaced with actual data
3. The SMS is sent via Twilio
4. The message is logged in the database

### Reminder System

The reminder system consists of:

1. **Scheduled Processing** - A daily CRON job checks for upcoming events
2. **7-Day Reminders** - Sent exactly 7 days before an event
3. **24-Hour Reminders** - Sent exactly 24 hours before an event
4. **Duplicate Prevention** - Flags in the database prevent duplicate reminders

## Development Testing

For testing SMS functionality during development:

1. Set `SMS_SIMULATION=true` in your `.env.local` file to prevent actual SMS sending
2. When in simulation mode, SMS details will be logged to the console
3. Use the test functionality in the SMS Templates admin page
4. Check the database to verify SMS records are being created

## Troubleshooting

### Common Issues

**SMS not being sent**
- Check that `SMS_ENABLED` is set to 'true'
- Verify Twilio credentials are correct
- Check that the phone number is in a valid format

**Invalid phone number errors**
- Ensure the phone number is in a valid UK format
- The system accepts formats like:
  - 07123456789
  - +447123456789
  - 447123456789

**Template processing issues**
- Verify that all required placeholders are provided
- Check template formatting and syntax

## Database Schema

### SMS Templates Table

The `sms_templates` table has the following structure:

| Column       | Type                    | Description                          |
|--------------|-------------------------|--------------------------------------|
| id           | TEXT                    | Primary key (template identifier)    |
| name         | TEXT                    | Display name of the template         |
| content      | TEXT                    | Template content with placeholders   |
| description  | TEXT                    | Description of when template is used |
| placeholders | TEXT[]                  | Array of placeholder names           |
| created_at   | TIMESTAMP WITH TIME ZONE| Creation timestamp                   |
| updated_at   | TIMESTAMP WITH TIME ZONE| Last update timestamp                |

### Reminder Tracking

The `bookings` table has additional columns for reminder tracking:

| Column            | Type                    | Description                                |
|-------------------|-------------------------|--------------------------------------------|
| last_reminder_sent| TIMESTAMP WITH TIME ZONE| When the last reminder was sent            |
| reminder_7day_sent| BOOLEAN                 | Whether the 7-day reminder has been sent   |
| reminder_24hr_sent| BOOLEAN                 | Whether the 24-hour reminder has been sent |

## Core SMS Utilities

### Phone Number Formatting

The `formatUKMobileNumber` function in `src/lib/phone-utils.ts` converts various UK phone number formats to the E.164 format required by Twilio:

```typescript
// Input formats supported:
// - 07123456789 (UK standard)
// - 7123456789 (UK without leading 0)
// - +447123456789 (International E.164)
// - 447123456789 (International without +)

// Output format: +447123456789
```

Usage:
```typescript
import { formatUKMobileNumber } from '@/lib/phone-utils';

const formattedNumber = formatUKMobileNumber('07123456789');
// Returns: +447123456789
```

### Sending SMS Messages

For sending SMS messages, use the server-side API endpoint:

```typescript
// Example sending a message
const response = await fetch('/api/sms/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phoneNumber: '+447123456789', // Must be in E.164 format
    messageContent: 'Your message here'
  })
});

const result = await response.json();
if (result.success) {
  console.log(`Message sent with SID: ${result.message.sid}`);
} else {
  console.error(`Error sending message: ${result.error}`);
}
```

## SMS Service Integration

### Core Service Implementation

The `SMSService` class in `src/services/sms-service.ts` handles SMS messaging throughout the application:

```typescript
import { SMSService } from '@/services/sms-service';

// Create a new instance
const smsService = new SMSService();

// Send an SMS related to a booking
await smsService.sendMessage({
  to: customer.phoneNumber,
  messageContent: 'Your appointment has been confirmed',
  bookingId: booking.id,
  customerId: customer.id,
  messageType: 'CONFIRMATION'
});
```

### Checking SMS Configuration

To check if SMS is enabled and properly configured:

```typescript
import { checkAndEnsureSmsConfig } from '@/lib/sms-utils';

const { smsEnabled, message } = await checkAndEnsureSmsConfig();
if (smsEnabled) {
  // SMS is available
} else {
  // SMS is not available, handle appropriately
  console.log(`SMS is disabled: ${message}`);
}
```

## API Routes

### `/api/sms/send`

Sends an SMS message via Twilio.

**Request:**
- Method: POST
- Content-Type: application/json
- Body:
  ```json
  {
    "phoneNumber": "+447123456789",
    "messageContent": "Message text here"
  }
  ```

**Response Success:**
```json
{
  "success": true,
  "message": {
    "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "status": "queued",
    "from": "+447700106752",
    "to": "+447123456789"
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### `/api/sms/config`

Returns the current SMS configuration status.

**Request:**
- Method: GET

**Response:**
```json
{
  "success": true,
  "smsEnabled": true,
  "message": "SMS is enabled",
  "twilioAccountSid": "ACae3fe...",
  "twilioAuthToken": true,
  "twilioPhoneNumber": "+447700106752"
}
```

## Integrating SMS into Booking Service

The `BookingService` can leverage SMS functionality for notifications:

```typescript
import { BookingService } from '@/services/booking-service';

const bookingService = new BookingService();

// Create a booking (will automatically send confirmation SMS if enabled)
const booking = await bookingService.createBooking({
  customerId: '123',
  serviceId: '456',
  date: new Date(),
  startTime: '14:00',
  endTime: '15:00',
  status: 'confirmed'
});

// Send a reminder manually
await bookingService.sendReminderSms(booking.id);
```

## Error Handling

SMS operations should always include proper error handling:

```typescript
try {
  await smsService.sendMessage({
    to: phoneNumber,
    messageContent: 'Your message',
    messageType: 'CUSTOM'
  });
} catch (error) {
  console.error('Failed to send SMS:', error);
  // Handle the error appropriately in your UI
}
```

## Logging and Monitoring

All SMS operations are logged to the database in the `sms_messages` table, including:
- Message content
- Phone number
- Twilio SID
- Status
- Associated booking/customer (if applicable)
- Error details (if any)

To retrieve SMS logs for a specific booking:

```typescript
const logs = await supabase
  .from('sms_messages')
  .select('*')
  .eq('booking_id', bookingId)
  .order('sent_at', { ascending: false });
```

## Testing in Production

For testing in production without using the testing page:

1. Use the BookingService directly:
```typescript
const bookingService = new BookingService();
await bookingService.testSmsConnection(); // Check connection
await bookingService.sendTestSms('+447123456789', 'Test message'); // Send test
```

2. Use the SMSService directly:
```typescript
const smsService = new SMSService();
await smsService.sendTestMessage('+447123456789', 'Test message');
```

## Best Practices

1. **Phone Number Validation**: Always format phone numbers using `formatUKMobileNumber` before sending SMS.
2. **Message Length**: Keep messages under 160 characters to avoid splitting.
3. **Error Handling**: Always implement robust error handling around SMS operations.
4. **User Consent**: Ensure you have consent before sending marketing SMS messages.
5. **Fallback Communication**: Have alternative communication methods when SMS is disabled or fails.
6. **Message Templates**: Use predefined templates for consistent messaging.
7. **Rate Limiting**: Implement rate limiting to prevent accidental message flooding.
8. **Monitoring**: Regularly monitor the SMS delivery success rates.

---

*This documentation was last updated: 26 March 2025* 