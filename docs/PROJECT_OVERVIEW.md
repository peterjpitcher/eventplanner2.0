# Event Planner 2.0 - Project Overview

## Introduction

Event Planner 2.0 is a comprehensive web application designed to help event organizers manage events, bookings, customers, and communications. The application provides tools for creating and managing events, tracking bookings, maintaining customer information, and sending automated SMS notifications for event-related communications.

## Purpose and Goals

The primary goals of Event Planner 2.0 are:

1. **Streamline Event Management**: Provide tools to easily create, edit, and manage event details.
2. **Simplify Booking Process**: Make it easy to create, track, and manage bookings.
3. **Enhance Customer Communication**: Use automated SMS notifications to keep customers informed about their bookings.
4. **Mobile-First Design**: Ensure the application works well on mobile devices for on-the-go management.
5. **Intuitive Interface**: Provide a clean, modern interface that's easy to navigate and use.

## Architecture

### Technology Stack

Event Planner 2.0 is built with modern technologies:

- **Frontend**: Next.js 14 (React framework) with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **SMS Integration**: Twilio
- **Forms**: React Hook Form for form validation and handling
- **State Management**: React Context + Hooks

### System Architecture

The application follows a client-server architecture with the following components:

1. **Client-Side Application**:
   - Next.js App Router for page routing
   - React components for UI elements
   - TypeScript for type safety
   - Tailwind CSS for styling

2. **Server-Side**:
   - Supabase for database and authentication
   - Server-side rendering for improved SEO and performance
   - API routes for server-side functionality

3. **External Services**:
   - Twilio for SMS messaging

### Data Model

The application uses the following primary data entities:

1. **Events**: Details about an event (title, date, time, capacity, etc.)
2. **Categories**: Event categories with default settings
3. **Customers**: Customer information including contact details
4. **Bookings**: Records linking customers to events
5. **SMS Messages**: History of sent SMS messages
6. **SMS Templates**: Customizable templates for different message types

## Key Features

### Event Management

- Create and edit events with detailed information
- Categorize events and apply default settings
- View events in list and detail views
- Mobile-friendly event cards for easy browsing

### Booking Management

- Create bookings linking customers to events
- Track booking details including number of seats
- Send SMS confirmations and reminders
- View booking history and details

### Customer Management

- Maintain a customer database with contact information
- Search and filter customer records
- Track customer booking history
- Mobile-friendly customer cards

### SMS Notifications

- Automated booking confirmations
- Event reminders (24-hour and 7-day)
- Cancellation notices
- Template-based message generation
- Message history tracking

### User Interface

- Responsive design for desktop and mobile
- Modern, clean interface
- Intuitive navigation
- Loading states and error handling
- Mobile-specific card views for optimal small-screen experience

## Current State

### Completed Features

- Event, category, customer, and booking CRUD operations
- Basic dashboard with statistics
- SMS integration with Twilio
- Template management for SMS messages
- Mobile-responsive design with card views
- Authentication and authorization

### Known Issues

1. **Customer Deletion**: Customers cannot be deleted despite the database operation succeeding.
2. **Dashboard Upcoming Events**: Events are not displaying on the dashboard.
3. **Category Deletion**: Categories cannot be deleted.
4. **Navigation Issues**: Categories and Messages appearing in navigation when they shouldn't.
5. **SMS Functionality**: Booking creation isn't triggering SMS notifications.

### Planned Improvements

Please refer to `docs/IMPLEMENTATION_PLAN_V1.4.md` for a detailed implementation plan addressing these issues.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Twilio account (for SMS functionality)

### Environment Setup

Copy the `.env.example` file to `.env.local` and fill in the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
SMS_ENABLED=true
```

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Deployment

The application is deployed on Vercel. To deploy:

1. Push changes to the main branch
2. Vercel will automatically build and deploy the application
3. Ensure environment variables are set in the Vercel project settings

## Documentation

Additional documentation is available in the `/docs` directory:

- `README.md`: Project overview and setup instructions
- `ARCHITECTURE.md`: System architecture overview
- `DATABASE_SCHEMA.md`: Database schema details
- `NAVIGATION.md`: Navigation structure and routing
- `BOOKING_MANAGEMENT.md`: Booking system documentation
- `CUSTOMER_MANAGEMENT.md`: Customer management features
- `sms-integration.md`: Comprehensive SMS integration guide
- `DEPLOYMENT.md`: Deployment instructions

## Conclusion

Event Planner 2.0 is a feature-rich application for event management with a focus on mobile usability and customer communication. While there are some known issues that need to be addressed, the application provides a solid foundation for event management needs. The implementation plan outlines clear steps to resolve these issues and further enhance the application's functionality. 