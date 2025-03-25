# Project Handover Documentation

## Event Planner 2.0

A web application to efficiently manage pub events, customer registrations, bookings, and automated SMS notifications.

**Production URL**: [eventplanner.orangejelly.co.uk](https://eventplanner.orangejelly.co.uk)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Key Features](#key-features)
5. [Authentication](#authentication)
6. [Deployment](#deployment)
7. [Known Issues and Solutions](#known-issues-and-solutions)
8. [Future Improvements](#future-improvements)

## Project Overview

Event Planner 2.0 is a comprehensive web application designed for pub owners and event managers to efficiently handle:

- Customer registration and management
- Event creation and scheduling
- Booking management
- SMS notifications

The application provides an intuitive interface for managing these tasks with role-based access control, allowing different staff members to have appropriate access levels.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Deployment**: Vercel
- **Version Control**: Git, GitHub

## Project Structure

The project follows a modern Next.js 14 App Router structure:

```
├── src/
│   ├── app/                    # Next.js pages and layouts
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── auth/               # Authentication pages
│   │   └── ...
│   ├── components/             # React components
│   │   ├── auth/               # Authentication components
│   │   ├── navigation/         # Navigation components
│   │   ├── ui/                 # Reusable UI components
│   │   └── ...
│   ├── contexts/               # React context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions and libraries
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── docs/                       # Project documentation
└── next.config.js              # Next.js configuration
```

## Key Features

### 1. Authentication System

- Email/password authentication via Supabase
- Protected routes with role-based access
- Redirect handling from protected routes

### 2. Customer Management

- Add, edit, and delete customer records
- Search and filter functionality
- Customer details with contact information

### 3. Navigation

- Responsive design with mobile and desktop layouts
- Sidebar navigation for desktop
- Mobile bottom navigation

## Authentication

The authentication system is built using Supabase Auth.

- **Login Page**: `/auth/login`
- **Register Page**: `/auth/register`
- **Auth Context**: `src/contexts/auth-context.tsx` - React context for auth state management
- **Protected Routes**: `src/hooks/use-require-auth.ts` - Hook to protect dashboard routes

The auth flow includes:
1. User signs up/logs in via the auth pages
2. Auth state is managed through React context
3. Protected routes redirect unauthenticated users

## Deployment

The application is deployed on Vercel from the `phase-2-clean` branch.

- **Production URL**: [eventplanner.orangejelly.co.uk](https://eventplanner.orangejelly.co.uk)
- **Deployment Branch**: `phase-2-clean`
- **Build Command**: `next build`

For detailed deployment information and troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Client-Side Rendering Solutions

Recent deployment fixes focused on addressing Next.js 14's client-side rendering requirements:

1. **Proper Client Components**:
   - Client components using browser APIs are properly marked with `'use client'`
   - Components using browser APIs are wrapped in Suspense boundaries
   - ClientOnly pattern implemented for safe client-side rendering

2. **Next.js Configuration**:
   - Simplified configuration in `next.config.js`
   - Proper experimental flags set for production

## Known Issues and Solutions

### 1. useSearchParams() CSR Bailout

**Issue**: Next.js 14 requires components using `useSearchParams()` to be wrapped in Suspense boundaries.

**Solution**: 
- Use the ClientOnly pattern for components accessing browser APIs
- Implement proper Suspense boundaries
- Separate client and server concerns

### 2. Metadata in Client Components

**Issue**: Client components cannot export metadata.

**Solution**:
- Use separate metadata files for routes
- Keep pages as server components where possible
- Create separate client components for interactive elements

## Future Improvements

1. **Event Management**:
   - Create events with details, capacity, and pricing
   - Calendar view for scheduling

2. **Booking System**:
   - Allow customers to book events
   - Manage event capacity and waitlists

3. **SMS Notifications**:
   - Integration with SMS service
   - Automated reminders and notifications

4. **Analytics Dashboard**:
   - Event attendance insights
   - Customer engagement metrics

5. **Performance Optimizations**:
   - Implement more efficient data fetching patterns
   - Optimize component rendering 