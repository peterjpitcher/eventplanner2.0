# Authentication Flow

This document outlines the authentication system implemented in the Event Planner application.

## Overview

The Event Planner application uses Supabase for authentication, providing a secure and straightforward email/password authentication flow. The authentication state is managed through a React context to ensure it's accessible throughout the application.

## Authentication Components

### AuthContext

The `AuthContext` is a React context that provides authentication state and methods to all components in the application. It includes:

- User state (current authenticated user)
- Session state (Supabase session)
- Loading state to handle authentication status checks
- Sign in, sign up, and sign out methods

Location: `src/contexts/auth-context.tsx`

```typescript
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null; data: any | null }>;
  signOut: () => Promise<void>;
};
```

### Authentication Forms

The application provides two main authentication forms:

1. **Login Form** (`src/components/auth/login-form.tsx`)
   - Email and password fields
   - Form validation
   - Error handling
   - Redirect to the originally requested page after successful login

2. **Register Form** (`src/components/auth/register-form.tsx`)
   - Email, password, and password confirmation fields
   - Password strength validation
   - Error handling
   - Success feedback
   - Redirect to login after successful registration

## Authentication Flow

### Initial Load

1. The `AuthProvider` initializes with loading state `true`
2. It fetches the current session from Supabase
3. If a session exists, it sets the user and session state
4. It sets up a listener for authentication state changes
5. Loading state is set to `false`

### Sign In Process

1. User enters email and password in the login form
2. Form validates input
3. Application calls `signIn(email, password)` from AuthContext
4. Supabase attempts to authenticate the credentials
5. If successful, the auth state changes, and the user is redirected to the dashboard
6. If unsuccessful, an error message is displayed

### Sign Up Process

1. User enters email, password, and confirms password in the registration form
2. Form validates input and ensures passwords match
3. Application calls `signUp(email, password)` from AuthContext
4. Supabase creates a new user account
5. Depending on Supabase configuration, email confirmation may be required
6. User is shown a success message and prompted to check email or log in

### Sign Out Process

1. User clicks the sign out button
2. Application calls `signOut()` from AuthContext
3. Supabase terminates the session
4. User is redirected to the login page

## Route Protection

The application implements route protection to ensure only authenticated users can access certain routes:

### Dashboard Layout Protection

The dashboard layout (`src/app/(dashboard)/layout.tsx`) checks for authentication:

1. It uses the `useAuth()` hook to access authentication state
2. If the user is loading, it displays a loading indicator
3. If no user is authenticated, it redirects to the login page
4. If a user is authenticated, it renders the dashboard layout with navigation

### RequireAuth Hook

A custom hook (`src/hooks/use-require-auth.ts`) provides reusable route protection logic:

```typescript
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`${redirectTo}?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, redirectTo, router, pathname]);

  return { user, isLoading };
}
```

This hook can be used in any page that requires authentication to automatically redirect unauthenticated users.

## Home Page Redirection

The home page (`src/app/page.tsx`) implements automatic redirection for authenticated users:

1. It checks the authentication state
2. If a user is authenticated, it redirects to the dashboard
3. If no user is authenticated, it displays the landing page with login options

## Security Considerations

- Authentication tokens are handled securely by Supabase
- Passwords are never stored in application state
- Authentication redirects preserve the original URL for a better user experience
- Passwords are validated for minimum security requirements

## Future Enhancements

Planned future enhancements to the authentication system include:

1. Social login options (Google, Facebook)
2. Two-factor authentication
3. Password reset functionality
4. User role-based permissions
5. Enhanced account settings management 