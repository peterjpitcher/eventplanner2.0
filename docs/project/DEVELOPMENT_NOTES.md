# Development Notes

This document contains important notes and decisions made during the development process that might be useful for future reference.

## Routing Structure Changes

### Migration from Route Groups to Flat Structure

The application initially used Next.js route groups with a `(dashboard)` group wrapping authenticated pages. This approach was causing 404 errors and routing conflicts. The implementation has been updated to use a flat route structure instead.

Key changes:
- Removed the `src/app/(dashboard)` route group (keeping only a README as a placeholder)
- Ensured all page components consistently use the `AppLayout` component
- Converted server components to client components (`'use client'`) for consistent data fetching patterns
- Updated documentation to reflect the new routing structure

This change simplifies the codebase by:
- Creating a more predictable routing pattern
- Eliminating potential conflicts between route groups and regular routes
- Ensuring all pages have consistent layouts and navigation
- Making it easier to add new routes in the future

The flat route structure means all routes are now directly under `src/app/`, such as `/dashboard`, `/customers`, `/events`, etc., and they all use the `AppLayout` component to maintain UI consistency.

## Database Schema Evolution

### Events Table Structure

The events table started with a simple structure as defined in the PRD:

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES event_categories(id),
  capacity INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

During development, additional fields were added to support more features:

```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES event_categories(id),
  capacity INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  is_published BOOLEAN DEFAULT true,
  is_canceled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

To maintain compatibility with the TypeScript interface in the application, a view was created:

```sql
CREATE OR REPLACE VIEW events_view AS
SELECT 
  id,
  name AS title,
  description,
  category_id,
  start_time::date AS date,
  start_time::time AS start_time,
  capacity,
  is_published,
  is_canceled,
  created_at,
  updated_at
FROM events;
```

### Trigger for Updated At

A trigger was added to automatically update the `updated_at` field whenever a record is modified:

```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
```

## Upcoming Improvements

- Phase 18 has been added to the implementation plan for UI improvements to align with the simplified database schema.
- This includes removing unused fields from event forms and cleaning up any code related to the unused fields.

## Known Issues

- The `events_view` approach introduces a layer of indirection that might make some operations more complex. 
- Direct table access should use the `events` table, while UI-related code should use the `events_view` view.

## Technical Debt

- The event form and detail components still include UI elements for fields that aren't actually stored in the database.
- This will be addressed in Phase 18 of the implementation plan.