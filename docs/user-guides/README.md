# User Guides

This directory contains end-user documentation for the Event Management System.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Customer Management](#customer-management)
3. [Event Management](#event-management)
4. [Booking Management](#booking-management)
5. [SMS Notifications](#sms-notifications)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### System Access

To access the Event Management System, navigate to the application URL provided by your administrator. You will need to log in with your credentials.

### Dashboard Overview

The dashboard provides a snapshot of:
- Upcoming events
- Recent bookings
- Recent customer activity
- SMS message alerts

Navigation is available through the bottom menu on mobile devices or the sidebar on desktop.

## Customer Management

### Adding a New Customer

1. Navigate to the Customers section
2. Click "Add Customer" button
3. Fill in the required fields (First Name, Mobile Number)
4. Add optional information (Last Name, Notes)
5. Click "Save"

### Importing Customer Data (Desktop Only)

1. Navigate to the Customers section
2. Click "Import Customers" button (only visible on desktop)
3. Follow the instructions to upload your customer data file
4. Review the preview of imported data
5. Click "Confirm Import" to add the customers

### Searching for Customers

1. Navigate to the Customers section
2. Use the search bar at the top
3. Enter a name or mobile number
4. Results will appear as you type

### Viewing Customer Details

1. Find the customer in the directory
2. Click on the customer's name
3. View their profile, booking history, and SMS history

### Editing Customer Information

1. Navigate to the customer's profile
2. Click the "Edit" button
3. Update the necessary fields
4. Click "Save"

## Event Management

### Creating Event Categories

1. Navigate to the Events section
2. Click "Manage Categories"
3. Click "Add Category"
4. Define the name, default capacity, and default start time
5. Add optional notes
6. Click "Save"

### Creating a New Event

1. Navigate to the Events section
2. Click "Add Event" button
3. Select an event category (this will pre-fill defaults)
4. Adjust the event details as needed
5. Set the date and time
6. Click "Save"

### Viewing Events

Events are displayed in a chronological list of upcoming events, with the ability to view past events as well.

### Managing Event Bookings

1. Navigate to the Events section
2. Select an event
3. View the list of bookings
4. Click "Quick Book" to add a customer to this event

## Booking Management

### Creating a Booking

1. Navigate to the Events section
2. Select an event
3. Click "Quick Book"
4. Search for a customer
5. Enter number of seats or select "Reminder Only"
6. Add optional notes
7. Click "Save"

### Booking Reminders

When a booking is created, the system automatically schedules:
- A 7-day reminder (sent exactly 7 days before the event, using the day name like "Monday" or "Tuesday")
- A 24-hour reminder (sent exactly 24 hours before the event)

If either of these time points has already passed when the booking is created, that reminder is not sent.

### Cancelling a Booking

1. Navigate to the customer's profile or event details
2. Find the booking to cancel
3. Click the "Cancel" button
4. A confirmation dialog will appear asking if you want to send a cancellation SMS
5. Select "Yes" to send the SMS or "No" to cancel without notification
6. The booking will be removed from the system

## SMS Notifications

### Automatic SMS Notifications

The system automatically sends SMS notifications for:
- Booking confirmations (when a booking is created)
- Booking reminders (7 days and 24 hours before events)
- Booking cancellations (with confirmation prompt)
- Event cancellations (with confirmation prompt)

### SMS Templates

The system uses predefined SMS templates with the following variables:
- `{{customer_name}}` - Customer's first name
- `{{event_name}}` - Name of the event
- `{{event_day_name}}` - Day of the week for the event (e.g., "Monday") - used in 7-day reminders
- `{{event_date}}` - Date of the event
- `{{event_time}}` - Time of the event
- `{{seats}}` - Number of seats booked

All messages include "The Anchor" signature and support replies from customers.

### Handling SMS Replies

1. Navigate to the Message Alerts section
2. View incoming messages
3. Click on a message to view details
4. Mark as read once processed

## Troubleshooting

### Common Issues

**Issue**: SMS not sending to a customer
**Solution**: Check the mobile number format and ensure it's a valid UK mobile number (07XXX XXX XXX)

**Issue**: Can't find a customer
**Solution**: Try searching by different terms or check for typos in the name/number

**Issue**: Event not showing in list
**Solution**: Check if you're viewing past or upcoming events

### Getting Help

For additional assistance, contact your system administrator. 