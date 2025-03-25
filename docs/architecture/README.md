# System Architecture

This document provides an overview of the architecture for the Event Management System for Pub Events.

## System Overview

The Event Management System is a web application built using a modern, serverless architecture that prioritizes simplicity, reliability, and maintainability.

## Architecture Diagram

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│                 │     │              │     │             │
│  React Frontend │────▶│   Supabase   │────▶│    Twilio   │
│  (Vercel)       │◀────│   Backend    │◀────│    SMS      │
│                 │     │              │     │             │
└─────────────────┘     └──────────────┘     └─────────────┘
```

## Key Components

### Frontend (React + Tailwind CSS)

- **Client-Side Application**: React-based SPA hosted on Vercel
- **UI Framework**: Tailwind CSS for responsive, mobile-optimized design
- **State Management**: React hooks and context for application state
- **Routing**: React Router for client-side navigation

### Backend (Supabase)

- **Database**: PostgreSQL database hosted by Supabase
- **Authentication**: Supabase Auth for user management and authentication
- **API**: RESTful and real-time APIs provided by Supabase
- **Security**: Row-level security policies for data access control

### SMS Service (Twilio)

- **SMS Notifications**: Twilio API for sending SMS messages
- **SMS Reply Handling**: Webhook integration for processing replies

## Data Flow

1. **User Interactions**: Users interact with the React frontend
2. **API Requests**: Frontend communicates with Supabase APIs
3. **Database Operations**: Supabase processes database operations
4. **SMS Integration**: System communicates with Twilio for SMS capabilities
5. **Real-time Updates**: Supabase real-time features provide live updates to the UI

## Database Design

The database schema is designed around four primary entities:

- **Customers**: Store customer information and contact details
- **Event Categories**: Define reusable templates for event types
- **Events**: Individual events scheduled at specific times
- **Bookings**: Connect customers to events with associated metadata

Refer to the [PRD](../specifications/PRD.md#5-database-schema-supabase) for detailed schema information.

## Security Considerations

- Authentication through Supabase Auth
- Row-level security policies to restrict data access
- Secure API endpoints with proper authorization
- Encrypted storage of sensitive information
- Input validation and sanitization

## Scalability Considerations

- Serverless architecture allows automatic scaling
- Database connection pooling for efficient resource utilization
- Optimized database queries for performance
- Caching strategies for frequently accessed data

## Technical Debt Monitoring

We will actively monitor and manage technical debt by:

- Regular code refactoring sessions
- Maintaining comprehensive test coverage
- Documenting known limitations and improvement opportunities
- Scheduling periodic architecture reviews 