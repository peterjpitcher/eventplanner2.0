# Deployment Guide & Troubleshooting

This document outlines the deployment process for the Event Planner application, common issues encountered, and their solutions.

## Deployment Information

- **Production URL**: [eventplanner.orangejelly.co.uk](https://eventplanner.orangejelly.co.uk)
- **Deployment Platform**: Vercel
- **Branch**: `phase-2-clean`

## Next.js 14 Client-Side Rendering Challenges

The Event Planner application faced several deployment challenges related to Next.js 14's handling of client components and server-side rendering. This document outlines the issues faced and their solutions.

### Issue 1: useSearchParams() CSR Bailout Error

Next.js 14 requires any component that uses `useSearchParams()` (or any browser-only API) to be properly wrapped in a Suspense boundary. This includes indirect usage through functions like `window.location.search`.

**Error Message:**
```
useSearchParams() should be wrapped in a suspense boundary at page "/auth/login". 
Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
```

**Solution:**
1. Convert the auth pages to client components with the `'use client'` directive
2. Implement proper Suspense boundaries around page content
3. Create a ClientOnly component to safely handle browser APIs

```jsx
// src/components/client-only.tsx
'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### Issue 2: Next.js Configuration Errors

Incorrect or unrecognized configuration options in `next.config.js` can cause build failures.

**Error Message:**
```
⚠ Invalid next.config.js options detected: 
⚠ Unrecognized key(s) in object: 'missingSuspenseWithCSRError' at "experimental"
```

**Solution:**
Simplified the Next.js configuration to only include recognized options:

```js
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Enable server actions (if needed in the app)
    serverActions: true
  }
};
```

### Issue 3: Metadata in Client Components

Next.js does not allow metadata exports from client components.

**Solution:**
1. Removed metadata exports from client component pages
2. Created separate metadata files for each route

## Authentication Implementation

The application uses Supabase for authentication:

1. **Login Flow**:
   - Client-side form with email/password fields
   - Handles redirects using URL search params
   - Uses ClientOnly component to ensure browser-only code runs safely

2. **Registration Flow**:
   - Collects user details and validates passwords client-side
   - Creates user accounts in Supabase
   - Redirects to login page after successful registration

## Client-Side Rendering Strategy

The application uses a hybrid rendering approach:

1. **Server Components**: 
   - Used for static parts of the UI
   - Handle SEO metadata
   - Provide data fetching

2. **Client Components**:
   - Used for interactive elements (forms, buttons)
   - Always properly wrapped in Suspense boundaries
   - Handle browser-only functionality

3. **ClientOnly Pattern**:
   - Ensures browser APIs are only accessed after mounting
   - Provides loading fallbacks for improved UX

## Deployment Best Practices

1. **Testing Deployments**:
   - Always verify deployment builds locally before pushing
   - Use `next build` to check for build errors

2. **Handling CSR in Next.js 14**:
   - Always wrap components using browser APIs in Suspense
   - Use the ClientOnly pattern for components that access window/navigator
   - Avoid mixing metadata with client components

3. **Handling Redirects**:
   - For client components, use `window.location` instead of Next.js Router
   - For server components, use Next.js redirect functions

## Production Considerations

1. **Performance**:
   - Authentication pages are client-rendered but include loading states
   - Dashboard and content pages use server components where possible

2. **SEO**:
   - Each route has appropriate metadata in separate files
   - Title and description are provided for key pages

3. **Security**:
   - Authentication handled through Supabase
   - Form validation implemented client-side
   - Password strength requirements enforced 