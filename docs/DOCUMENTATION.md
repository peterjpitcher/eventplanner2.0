# Event Planner 2.0 Documentation

## Project Overview

Event Planner 2.0 is a comprehensive event management application built with Next.js and Supabase. It allows event organizers to create, manage, and track events, customer bookings, and communications. The application features a responsive dashboard, real-time data updates, and SMS notification capabilities.

## Technical Stack

- **Frontend**: Next.js 14 with App Router, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Authentication**: Supabase Auth with email/password
- **SMS Integration**: Twilio API
- **Styling**: Tailwind CSS with custom components
- **Deployment**: Vercel (frontend), Supabase (backend)

## Key Features

1. **Event Management**
   - Create, edit, and delete events
   - Categorize events by type
   - Set event capacity and details
   - View events in list and calendar formats

2. **Customer Management**
   - Create and manage customer profiles
   - Track booking history per customer
   - Store contact information for communications
   - Import customers via Excel (planned)

3. **Booking System**
   - Create bookings for customers and events
   - Track number of seats booked or reminder preferences
   - View booking history and status
   - Associate bookings with specific users

4. **Category Management**
   - Create and manage event categories
   - Set default properties for events in each category
   - Filter events by category

5. **SMS Notifications**
   - Send automated SMS reminders
   - Track message delivery status
   - Receive and manage customer replies
   - Template system for common messages

6. **User Authentication**
   - Secure login with email/password
   - Protected routes and authorized actions
   - User profile management

7. **Dashboard & Analytics**
   - Overview of upcoming events
   - Recent bookings and activity
   - Category statistics
   - Monthly booking trends

## Application Architecture

The application follows a modern Next.js App Router architecture:

- **src/app**: Contains the main application routes and pages
  - **/(dashboard)**: Dashboard and authenticated routes
  - **/auth**: Authentication related pages
  - **/api**: Backend API routes

- **src/components**: Reusable UI components
  - **/ui**: Basic UI elements
  - **/forms**: Form components
  - **/navigation**: Navigation elements
  - **/events**: Event-specific components
  - **/customers**: Customer-specific components
  - **/bookings**: Booking-specific components

- **src/services**: Service modules for backend operations
  - **event-service.ts**: Event-related operations
  - **customer-service.ts**: Customer-related operations
  - **booking-service.ts**: Booking-related operations
  - **category-service.ts**: Category-related operations
  - **sms-service.ts**: SMS functionality
  - **dashboard-service.ts**: Dashboard data operations

## Database Schema

The application uses a PostgreSQL database hosted on Supabase with the following main tables:

- **events**: Stores event details with foreign keys to categories
- **customers**: Stores customer information
- **bookings**: Tracks bookings with foreign keys to events and customers
- **event_categories**: Stores category information
- **sms_messages**: Tracks SMS messages sent
- **sms_replies**: Stores customer replies

Detailed schema information can be found in [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

## Authentication & Authorization

The application uses Supabase Auth for authentication:
- Email and password-based login
- JWT tokens for session management
- Row-Level Security (RLS) policies in Supabase for authorization
- Protected routes requiring authentication

## Recent Updates

### Sprint 7: Dashboard Enhancement and Navigation Fix
- Fixed dashboard redirect issues to ensure proper navigation flow
- Created a standalone dashboard page at /dashboard path
- Updated all navigation links in sidebar and mobile navigation
- Improved loading states for authentication and data fetching
- Enhanced styling consistency throughout the application
- Configured the home page to properly redirect authenticated users to dashboard

### Sprint 6: Booking Management Implementation
- Created a complete booking management system
- Implemented booking creation, viewing, editing, and deletion
- Added foreign key relationships in database for bookings
- Created booking form with customer and event selection
- Set up Row-Level Security for user-specific booking access
- Fixed styling inconsistencies throughout the application
- Updated mobile navigation to include bookings

### Sprint 5: SMS Integration
- Implemented SMS sending capabilities via Twilio
- Created SMS history tracking
- Added customer reply management
- Implemented unread message counter

### Sprint 4: Event & Customer Management
- Built complete event CRUD operations
- Implemented customer management features
- Created category filtering for events
- Added dashboard with recent activity

## Development Workflow

1. **Local Development**
   - Clone the repository
   - Install dependencies with `npm install`
   - Start the development server with `npm run dev`
   - Run Supabase locally with `npx supabase start`

2. **Database Migrations**
   - Migrations are stored in `/supabase/migrations`
   - Apply migrations with Supabase dashboard or CLI

3. **Deployment**
   - Frontend deployed to Vercel
   - Database deployed to Supabase
   - Environment variables managed through respective platforms

## Known Issues and Future Enhancements

See [issues.md](../issues.md) for a list of current issues and planned enhancements.

## Contributing

1. Create a feature branch from `main`
2. Implement changes with appropriate tests
3. Submit a pull request with detailed description
4. Ensure CI checks pass before merging 