# API Documentation

This document outlines the API endpoints available in the Event Management System.

## Overview

The Event Management System uses Supabase for database access and authentication. This document provides information about:

1. Supabase API usage
2. Custom API endpoints for Twilio integration
3. Authentication and authorization

## Base URLs

- **Supabase API**: `https://[your-project-id].supabase.co`
- **Custom API**: `/api/` (relative to application base URL)

## Authentication

All API requests require authentication using a JWT token provided by Supabase Auth.

### Authentication Headers

```
Authorization: Bearer [JWT_TOKEN]
```

## Supabase API

Supabase provides RESTful endpoints for all tables. Below are the primary endpoints used by the application:

### Customer Endpoints

#### Get All Customers

```
GET /rest/v1/customers?select=*
```

#### Get Customer by ID

```
GET /rest/v1/customers?id=eq.[customer_id]&select=*
```

#### Search Customers

```
GET /rest/v1/customers?or=(first_name.ilike.*%[search_term]%*,last_name.ilike.*%[search_term]%*,mobile_number.ilike.*%[search_term]%*)&select=*
```

#### Create Customer

```
POST /rest/v1/customers
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "mobile_number": "07123456789",
  "notes": "Optional notes"
}
```

#### Update Customer

```
PATCH /rest/v1/customers?id=eq.[customer_id]
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "notes": "Updated notes"
}
```

### Event Category Endpoints

#### Get All Event Categories

```
GET /rest/v1/event_categories?select=*
```

#### Create Event Category

```
POST /rest/v1/event_categories
Content-Type: application/json

{
  "name": "Live Music",
  "default_capacity": 100,
  "default_start_time": "19:00:00",
  "notes": "Live music events"
}
```

### Event Endpoints

#### Get All Events

```
GET /rest/v1/events?select=*,event_categories(*)
```

#### Get Upcoming Events

```
GET /rest/v1/events?start_time=gte.[ISO_DATE]&select=*,event_categories(*)&order=start_time.asc
```

#### Create Event

```
POST /rest/v1/events
Content-Type: application/json

{
  "name": "Jazz Night",
  "category_id": "category_uuid",
  "capacity": 80,
  "start_time": "2023-06-15T19:00:00Z",
  "notes": "Monthly jazz night"
}
```

#### Update Event

```
PATCH /rest/v1/events?id=eq.[event_id]
Content-Type: application/json

{
  "name": "Jazz Night Special",
  "capacity": 90
}
```

### Booking Endpoints

#### Get All Bookings

```
GET /rest/v1/bookings?select=*,customers(*),events(*)
```

#### Get Bookings for Event

```
GET /rest/v1/bookings?event_id=eq.[event_id]&select=*,customers(*)
```

#### Get Bookings for Customer

```
GET /rest/v1/bookings?customer_id=eq.[customer_id]&select=*,events(*)
```

#### Create Booking

```
POST /rest/v1/bookings
Content-Type: application/json

{
  "customer_id": "customer_uuid",
  "event_id": "event_uuid",
  "seats_or_reminder": "2",
  "notes": "Window seat preferred"
}
```

#### Update Booking

```
PATCH /rest/v1/bookings?id=eq.[booking_id]
Content-Type: application/json

{
  "seats_or_reminder": "3",
  "notes": "Updated notes"
}
```

#### Delete Booking

```
DELETE /rest/v1/bookings?id=eq.[booking_id]
```

## Custom API Endpoints

The application provides custom API endpoints for functionality beyond what Supabase offers directly.

### SMS Notifications

#### Send Booking Confirmation SMS

```
POST /api/sms/booking-confirmation
Content-Type: application/json

{
  "booking_id": "booking_uuid"
}
```

#### Send Reminder SMS

```
POST /api/sms/reminder
Content-Type: application/json

{
  "booking_id": "booking_uuid"
}
```

#### Send Event Cancellation SMS

```
POST /api/sms/event-cancellation
Content-Type: application/json

{
  "event_id": "event_uuid",
  "message": "Optional custom message"
}
```

### SMS Webhooks

#### Twilio SMS Webhook

```
POST /api/sms/webhook
Content-Type: application/x-www-form-urlencoded

From=+447123456789&Body=SMS reply content&MessageSid=SM123456789
```

## Error Handling

All API endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created successfully
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

Error responses include a JSON object with an error message:

```json
{
  "error": "Error message description"
}
```

## Rate Limiting

API requests are subject to Supabase and Vercel rate limiting. Please implement appropriate caching and limit the frequency of requests to avoid issues. 