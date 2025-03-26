# SMS Integration Documentation

## Overview

This document provides comprehensive details on implementing and using the SMS functionality in the Event Planner application. The SMS service allows sending messages to customers for appointment notifications, reminders, and other communications.

## Configuration

### Environment Variables

The following environment variables must be set in your `.env.local` file:

```
# Twilio SMS Settings
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
SMS_ENABLED=true
```

The `SMS_ENABLED` flag allows enabling/disabling SMS functionality without removing credentials.

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

## Implementation Details

### Database Schema

The SMS functionality relies on the following database tables:

#### `sms_messages`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| customer_id | uuid | Foreign key to customers (optional) |
| booking_id | uuid | Foreign key to bookings (optional) |
| message_type | text | Type of message (e.g., 'CONFIRMATION', 'REMINDER', 'CUSTOM') |
| content | text | The message content |
| phone_number | text | Recipient phone number in E.164 format |
| sent_at | timestamp | When the message was sent |
| status | text | Twilio status (e.g., 'queued', 'sent', 'delivered', 'failed') |
| message_sid | text | Twilio message SID |
| error | json | Error details if sending failed |

#### `app_config`

Contains application configuration including SMS settings.

| Column | Type | Description |
|--------|------|-------------|
| key | text | Primary key, e.g., 'sms_enabled' |
| value | text | Setting value, e.g., 'true' or 'false' |
| description | text | Human-readable description |

### SMS Service Methods

The `SMSService` class provides these key methods:

- `sendMessage`: Sends an SMS message with support for tracking in the database
- `sendTestMessage`: Sends a test message without booking association
- `countUnreadReplies`: Counts unread SMS replies for notifications
- `markReplyAsRead`: Marks an SMS reply as read
- `getMessageLogs`: Retrieves SMS message logs with filtering options

## Best Practices

1. **Phone Number Validation**: Always format phone numbers using `formatUKMobileNumber` before sending SMS.
2. **Message Length**: Keep messages under 160 characters to avoid splitting.
3. **Error Handling**: Always implement robust error handling around SMS operations.
4. **User Consent**: Ensure you have consent before sending marketing SMS messages.
5. **Fallback Communication**: Have alternative communication methods when SMS is disabled or fails.
6. **Message Templates**: Use predefined templates for consistent messaging.
7. **Rate Limiting**: Implement rate limiting to prevent accidental message flooding.
8. **Monitoring**: Regularly monitor the SMS delivery success rates.

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Check that your Twilio credentials are correct
   - Verify the account is active and has a positive balance

2. **Invalid Phone Numbers**:
   - Ensure phone numbers are in E.164 format (+447XXXXXXXXX for UK)
   - Verify the phone number is capable of receiving SMS

3. **Missing Messages**:
   - Check the `sms_messages` table for delivery status
   - Verify Twilio logs for any delivery issues

4. **API Errors**:
   - 400-level errors typically indicate invalid requests
   - 500-level errors suggest server or Twilio service issues

### Debugging Tips

1. Enable detailed logging by setting `DEBUG=true` in your environment
2. Use the test functions to validate connection without affecting real data
3. Check server logs for detailed Twilio API responses
4. Verify network connectivity to Twilio's API endpoints

---

*This documentation was last updated: 26 March 2025* 