# Navigation Components

This document outlines the navigation system implemented in the Event Planner application.

## Overview

The Event Planner application implements a responsive navigation system with different components optimized for desktop and mobile devices. The navigation provides access to the main features of the application and adapts to different screen sizes.

## Navigation Components

### Desktop Sidebar

The desktop sidebar (`src/components/navigation/sidebar.tsx`) is a vertical navigation component that appears on the left side of the screen on desktop devices. It provides:

- App logo/title
- Main navigation links with icons
- User profile information
- Sign out button

Key features:
- Fixed position for easy access
- Visual indication of the active route
- Comprehensive access to all application features
- User information display

Implementation details:
- Visible only on medium and larger screens (`md:` Tailwind breakpoint and above)
- Uses SVG icons for navigation items
- Highlights the active route based on the current URL

### Mobile Navigation

The mobile navigation (`src/components/navigation/mobile-nav.tsx`) is a horizontal bar that appears at the bottom of the screen on mobile devices. It provides:

- Core navigation links with icons
- Visual indication of the active route
- Quick access to frequently used features

Key features:
- Fixed to the bottom of the viewport for thumb accessibility
- Simplified navigation with icons and labels
- Optimized for small screens

Implementation details:
- Visible only on small screens (below the `md:` Tailwind breakpoint)
- Uses a subset of the full navigation items to avoid overcrowding
- Provides access to the most important features (Dashboard, Customers, Events, Profile)

## Navigation Structure

The application's navigation is organized around these main sections:

1. **Dashboard** - Overview of the system with key metrics and quicklinks
2. **Customers** - Customer management features
3. **Event Categories** - Management of event categories (desktop only)
4. **Events** - Event creation and management
5. **Bookings** - Booking management features
6. **Messages** - SMS reply management
7. **Profile** - User profile and account settings (mobile only)

## Route Structure and Layouts

The navigation is implemented using a consistent layout pattern:

### AppLayout Component

The `AppLayout` component (`src/components/layout/app-layout.tsx`) wraps all authenticated pages and includes:

1. Authentication check with loading state
2. Desktop sidebar navigation
3. Mobile bottom navigation
4. Content area with appropriate padding and layout

This layout ensures consistent navigation across all authenticated pages while handling authentication status. All route pages use this component as their wrapper to maintain a consistent UI.

### Route Structure

The application uses a flat route structure with the following main routes:

- `/dashboard` - Main dashboard
- `/customers` - Customer listing
- `/customers/new` - New customer form
- `/customers/[id]` - Customer details
- `/customers/[id]/edit` - Edit customer
- `/events` - Event listing
- `/events/new` - New event form
- `/events/[id]` - Event details
- `/events/[id]/edit` - Edit event
- `/categories` - Category listing
- `/categories/new` - New category form
- `/categories/[id]` - Category details
- `/categories/[id]/edit` - Edit category
- `/bookings` - Booking listing
- `/bookings/new` - New booking form
- `/bookings/[id]` - Booking details
- `/bookings/[id]/edit` - Edit booking
- `/messages` - Message listing
- `/profile` - User profile

## Navigation Item Definition

Navigation items are defined as TypeScript interfaces:

```typescript
interface NavItem {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  badge?: number; // For notification counts (e.g., unread messages)
}
```

This structured approach allows for:
- Consistent rendering of navigation items
- Type-safe definitions
- Easy addition or modification of navigation items
- Support for notification badges

## Active State Detection

Both navigation components detect the active route using the Next.js `usePathname()` hook:

```typescript
const pathname = usePathname();
const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
```

This approach ensures that:
- The current route is highlighted in the navigation
- Parent routes are highlighted when viewing child routes (e.g., customer details page highlights the Customers nav item)

## Responsive Design

The navigation system uses Tailwind CSS for responsive behavior:

1. **Desktop Sidebar**:
   - Hidden on mobile: `hidden md:flex`
   - Fixed width on desktop: `md:w-64`
   - Fixed position: `md:fixed md:inset-y-0`

2. **Mobile Navigation**:
   - Hidden on desktop: `md:hidden`
   - Fixed to bottom: `fixed bottom-0 left-0 right-0`
   - Horizontal layout: `flex justify-around`

This approach ensures optimal navigation experience across all device sizes without duplicating content or creating complex conditional rendering logic.

## Future Enhancements

Planned enhancements to the navigation system include:

1. Collapsible sidebar for desktop to maximize content area
2. Customizable navigation based on user roles and permissions
3. Search integration in the navigation header
4. Recent items or favorites in the navigation
5. Context-sensitive navigation for deeper nested routes 