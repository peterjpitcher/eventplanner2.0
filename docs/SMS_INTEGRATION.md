# SMS Integration

This document outlines the SMS integration implemented in Phase 7 of the Event Planner 2.0 project. It provides information about the setup, configuration, and usage of SMS functionality.

## Overview

The SMS integration allows the application to:
- Send booking confirmation messages
- Send reminders before events (7-day and 24-hour)
- Send cancellation notifications
- Receive and process SMS replies from customers

## Required Services

The SMS functionality requires a Twilio account:
- [Twilio](https://www.twilio.com/) - For sending and receiving SMS messages

## Setup Instructions

### 1. Create a Twilio Account

1. Sign up for a Twilio account at [https://www.twilio.com/](https://www.twilio.com/)
2. Navigate to the Twilio Console
3. Purchase a phone number with SMS capabilities
   - Make sure the number supports both sending and receiving SMS
   - For UK operations, a UK number is recommended

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Twilio Configuration for SMS
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# SMS Configuration
SMS_SIMULATION=true  # Set to 'true' in development to simulate SMS without actual sending
SMS_ENABLED=true     # Enable/disable SMS functionality
```

- `TWILIO_ACCOUNT_SID`: Found in your Twilio Console dashboard
- `TWILIO_AUTH_TOKEN`: Found in your Twilio Console dashboard
- `TWILIO_PHONE_NUMBER`: The Twilio phone number you purchased (in E.164 format, e.g., +447123456789)
- `SMS_SIMULATION`: Set to 'true' during development to avoid sending actual messages
- `SMS_ENABLED`: Master switch to enable/disable all SMS functionality

### 3. Configure Webhook for Incoming SMS

To receive SMS replies, you need to configure a webhook in your Twilio account:

1. Go to the Twilio Console
2. Navigate to Phone Numbers > Manage > Active Numbers
3. Click on your phone number
4. In the "Messaging" section, set the "A MESSAGE COMES IN" webhook to:
   - `https://your-app-domain.com/api/webhooks/twilio`
   - Method: HTTP POST

For local development, you can use a service like [ngrok](https://ngrok.com/) to create a public URL for your local server.

### 4. Install Dependencies

The SMS integration requires the Twilio Node.js SDK:

```bash
npm install twilio
```

## How SMS Works in the Application

### Sending Confirmation Messages

When a booking is created, the system automatically:
1. Formats the customer's phone number to E.164 format
2. Processes the booking confirmation template with event details
3. Sends the SMS via Twilio
4. Records the message in the database for tracking

### Receiving SMS Replies

When a customer replies to an SMS:
1. Twilio forwards the message to the webhook endpoint
2. The application processes the incoming message
3. The system identifies the customer by their phone number
4. The reply is stored in the database as an unread message
5. Staff can view and respond to messages in the application

### Managing SMS Replies

The application provides a dedicated interface for managing SMS replies:

1. **Messages Page**: A centralized page shows all incoming messages with read/unread status indicators
2. **Unread Badges**: Navigation badges show the count of unread messages
3. **Customer Context**: Customer profile pages include a section showing that customer's message history
4. **Message Actions**: Staff can mark individual messages or all messages as read

To access SMS replies:
1. Click on the "Messages" item in the main navigation
2. View all messages or filter by customer
3. Click "Mark as Read" to update message status
4. Click "View Customer" to see the customer profile with additional context

## SMS Templates

The system uses the following templates for various message types:

### Booking Confirmation
```
Hi {{customer_name}}, your booking for {{event_name}} on {{event_date}} at {{event_time}} is confirmed. We've reserved {{seats}} for you. Reply to this message if you need to make any changes. The Anchor.
```

### 7-Day Reminder
```
Hi {{customer_name}}, this is a reminder about your booking for {{event_name}} next {{event_day_name}} at {{event_time}}. We look forward to seeing you here! Reply to this message if you need to make any changes. The Anchor.
```

### 24-Hour Reminder
```
Hi {{customer_name}}, just a reminder that you're booked for {{event_name}} tomorrow at {{event_time}}. We look forward to seeing you! Reply to this message if you need to make any changes. The Anchor.
```

### Booking Cancellation
```
Hi {{customer_name}}, your booking for {{event_name}} on {{event_date}} at {{event_time}} has been cancelled. If this was not requested by you or if you have any questions, please contact us. The Anchor.
```

### Event Cancellation
```
Hi {{customer_name}}, we regret to inform you that {{event_name}} scheduled for {{event_date}} at {{event_time}} has been cancelled. We apologize for any inconvenience. Please contact us if you have any questions. The Anchor.
```

## Development Testing

For testing SMS functionality during development:

1. Set `SMS_SIMULATION=true` in your `.env.local` file to prevent actual SMS sending
2. When in simulation mode, SMS details will be logged to the console
3. Use the test endpoint at `/api/test/sms?to=PHONE_NUMBER&body=TEST_MESSAGE` to test sending SMS
4. Check SMS records in the database to verify SMS records are being created

## SMS Service API

The SMS service provides the following methods:

- `getMessages()` - Retrieve all SMS messages
- `getMessagesByCustomer(customerId)` - Get messages for a specific customer
- `getMessagesByBooking(bookingId)` - Get messages for a specific booking
- `getReplies()` - Get all SMS replies
- `getRepliesByCustomer(customerId)` - Get replies for a specific customer
- `markReplyAsRead(replyId)` - Mark a reply as read
- `sendSMSToCustomer()` - Send an SMS to a customer
- `sendBookingConfirmation()` - Send a booking confirmation SMS
- `receiveReply()` - Process an incoming SMS reply

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

**Webhook not receiving messages**
- Verify the webhook URL is correctly set in Twilio
- Ensure your server is accessible from the internet
- Check server logs for any errors processing incoming messages

## Future Enhancements

The current implementation will be extended in future phases to include:
- Automated reminder scheduling (Phase 9)
- Booking cancellation notifications (Phase 10)
- Event cancellation mass-notifications (Phase 11)
- UI for viewing and managing SMS replies (Phase 12)

## Phases of Implementation

### Phase 7: SMS Integration Setup ✅

This phase focused on setting up the core SMS infrastructure:

- Twilio integration and secure credentials storage
- Base SMS utility functions for message sending
- Phone number formatting and validation
- SMS templates system with variable replacement
- Database schema for tracking SMS messages
- Testing endpoints for development

### Phase 8: Booking Confirmations ✅

This phase expanded on the SMS infrastructure to implement booking confirmations:

- Enhanced booking service to send confirmation SMS when a booking is created
- Added SMS status tracking in booking responses with an `smsSent` flag
- Improved error handling for SMS failures during booking creation
- Updated the QuickBook component to show SMS confirmation status
- Added user feedback for successful/failed SMS sending
- Created more robust error handling throughout the SMS flow
- Enhanced booking flow with better status messages and user experience

### Phase 9: SMS Reminders ✅

This phase focused on implementing automated SMS reminders:

- Created a reminder service to process reminders automatically
- Implemented both 7-day and 24-hour reminder templates with day name and time information
- Added logic to check if reminders have already been sent to avoid duplicates 
- Created an API endpoint for scheduled processing of reminders
- Built reminder API endpoint for manually sending reminders for a specific booking
- Updated booking details UI to show reminder status
- Enhanced error handling and validation for customer data in reminders
- Added documentation for the reminder system configuration
- Improved booking detail view to show SMS status

### Phase 10: Booking Cancellations ✅

This phase focused on implementing booking cancellation with optional SMS notifications:

- Added a booking cancellation template with appropriate message format
- Implemented a sendBookingCancellation method in the SMS service
- Enhanced the booking service to support optional SMS notifications on deletion
- Created a confirmation dialog with an SMS option toggle in the UI
- Improved error handling and user feedback with toast notifications
- Added standardized date formatting helpers for consistent SMS messages
- Implemented UX improvements with loading states during cancellation

## Booking Cancellation Workflow

The booking cancellation workflow provides staff with flexibility in how they handle cancellations:

1. Staff clicks the "Delete" button for a booking
2. A confirmation dialog appears with an SMS notification checkbox (checked by default)
3. Staff can choose whether to send a cancellation SMS
4. If SMS is enabled, the system:
   a. Deletes the booking from the database
   b. Retrieves customer and event details
   c. Sends a cancellation SMS using the booking_cancellation template
   d. Records the SMS in the database
   e. Provides feedback on whether the SMS was successfully sent
5. If SMS is disabled, the system simply deletes the booking
6. The UI updates to reflect the deleted booking
7. A toast notification confirms the action's result

## Cancellation SMS Template

The cancellation SMS uses the following template:
```
Hi {{customer_name}}, your booking for {{event_name}} on {{event_date}} at {{event_time}} has been cancelled. If this was not requested by you or if you have any questions, please contact us. The Anchor.
```

## Reminder System Configuration

The reminder system is designed to send two types of SMS reminders:

1. **7-Day Reminder**: Sent exactly 7 days before the event, mentioning the day name (e.g., "next Monday")
2. **24-Hour Reminder**: Sent exactly 24 hours before the event (the day before)

### Reminder Processing Logic

- The system checks if a reminder timepoint has already passed at the time of booking creation
- If the timepoint has passed, that specific reminder is not sent
- Reminders are only sent for bookings with valid customer contact information
- The system tracks which reminders have been sent to avoid duplicates

### Manual Reminder Triggering

Staff can manually trigger reminders for a booking through the booking details page. This feature is useful for:
- Testing reminder functionality
- Sending an additional reminder when needed
- Resending a reminder that failed to send

### Reminder Status Tracking

The system tracks the status of each reminder:
- **Not Sent**: The reminder is scheduled but has not been sent yet
- **Sent**: The reminder has been successfully delivered
- **Error**: The reminder failed to send (with error details)

### Technical Implementation

The reminder system uses:
- The date-fns library for accurate date calculations and formatting
- A background job that can be triggered on a schedule
- Error handling to gracefully manage failures
- Status tracking in the database for each reminder attempt 