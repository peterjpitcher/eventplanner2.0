# Event Planner 2.0 Architecture

## Overview
Event Planner 2.0 is a modern web application built with Next.js 14, TypeScript, and Supabase. The application follows a modular architecture with clear separation of concerns and type safety throughout.

## Core Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Date Handling**: date-fns
- **Icons**: Heroicons
- **Notifications**: Sonner (toast notifications)
- **SMS Integration**: Twilio (for booking notifications)

## Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── forms/            # Form components
│   ├── events/           # Event-specific components
│   ├── bookings/         # Booking-specific components
│   └── categories/       # Category-specific components
├── lib/                   # Core utilities and configurations
├── services/             # Business logic and API services
├── utils/                 # Helper functions and services
└── types/                 # TypeScript type definitions
```

## Key Features

### Dashboard
The dashboard provides a comprehensive overview of the event planning business with:
- Real-time statistics (customers, events, bookings, messages)
- Customer growth metrics
- Interactive charts (bookings by category, monthly trends)
- Recent activity feed
- Quick action buttons

### Data Management
- Type-safe database operations with Supabase
- Efficient data fetching with parallel requests
- Proper error handling and loading states
- Real-time updates where applicable
- Optimistic updates for better UX

### User Interface
- Responsive design with Tailwind CSS
- Loading states and animations
- Consistent styling across components
- Accessible UI elements
- Form validation and error handling
- Toast notifications for user feedback

### Booking Management
- Comprehensive booking creation and management
- Customer search and selection
- Event selection and validation
- Seats/reminder preferences
- SMS notifications for bookings
- Booking history and tracking

## Database Schema
The application uses the following main tables:
- `customers`: Customer information
- `events`: Event details and configurations
- `bookings`: Event bookings and reservations
- `messages`: Customer communications
- `categories`: Event categories
- `sms_messages`: SMS notification history

## Security
- Authentication handled by Supabase Auth
- Row Level Security (RLS) policies in Supabase
- Type-safe database operations
- Secure API routes
- Environment variable protection

## Performance Optimizations
- Client-side data fetching with loading states
- Parallel data fetching where possible
- Dynamic imports for heavy components
- Efficient chart rendering with Chart.js
- Optimistic updates for better UX
- Proper error boundaries

## Development Guidelines
1. Use TypeScript for all new code
2. Follow the established project structure
3. Implement proper error handling
4. Add loading states for async operations
5. Keep components modular and reusable
6. Document complex logic and decisions
7. Use proper form validation
8. Implement proper error messages
9. Follow accessibility guidelines

## Deployment
The application is deployed to Vercel with the following considerations:
- Environment variables properly configured
- Database migrations handled through Supabase
- Build optimizations enabled
- Error monitoring and logging in place
- SMS service integration
- Proper error handling and recovery

## Future Enhancements
1. Enhanced reporting capabilities
2. Advanced analytics dashboard
3. Customer communication features
4. Event management improvements
5. Integration with external services
6. Manual seat number input for bookings
7. Enhanced SMS notification system
8. Advanced booking analytics 