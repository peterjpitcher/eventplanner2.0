# Deployment Guide for Event Planner 2.0

This document provides instructions for deploying the Event Planner 2.0 application to production environments.

## Prerequisites

Before deploying, ensure you have:

1. A GitHub account with access to the repository
2. A Vercel account for frontend deployment
3. A Supabase account for backend services
4. A Twilio account for SMS functionality (optional)

## Environment Variables

The following environment variables must be set in your production environment:

### Essential Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### SMS Functionality Variables (Optional)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
NEXT_PUBLIC_SMS_ENABLED=true
```

## Deployment Steps

### 1. Database Setup with Supabase

1. Create a new project in Supabase
2. Run the database migrations:
   - Navigate to the SQL Editor in Supabase
   - Copy the content from `supabase/migrations` files
   - Execute the SQL scripts in order

3. Configure authentication:
   - Enable Email/Password sign-up in Authentication settings
   - Set up password policies as needed

4. Set up Row-Level Security (RLS) policies for tables

### 2. Frontend Deployment with Vercel

1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. Set environment variables:
   - Add all required environment variables in the Vercel project settings

4. Deploy the application:
   - Trigger a deployment manually or let Vercel deploy automatically from your main branch

5. Configure custom domains if needed

### 3. Post-Deployment Verification

1. Test authentication:
   - Create a test account
   - Verify login functionality

2. Test CRUD operations:
   - Create, read, update, and delete resources
   - Verify permissions are working correctly

3. Test SMS functionality (if enabled):
   - Send a test message
   - Verify delivery status tracking

## Handling Client-Side Rendering Issues

The application uses Next.js with both server and client components. Some components that use authentication or browser APIs need to be rendered on the client side only. To avoid hydration errors:

1. Use the `ClientOnly` component for pages and components that:
   - Access browser APIs
   - Require authentication
   - Use React context providers

2. For pages that use authentication context:
   ```jsx
   import ClientOnly from '@/components/client-only';
   
   export default function ProtectedPage() {
     return (
       <ClientOnly>
         <YourAuthProtectedComponent />
       </ClientOnly>
     );
   }
   ```

## Troubleshooting Common Deployment Issues

### Authentication Issues
- Verify Supabase URL and anon key are correct
- Check browser console for authentication errors
- Ensure RLS policies are set correctly

### API Errors
- Verify environment variables are set correctly
- Check if Supabase is accessible from the deployment environment
- Look for CORS issues in browser console

### SMS Functionality Issues
- Confirm Twilio credentials are correct
- Check if `NEXT_PUBLIC_SMS_ENABLED` is set to `true`
- Verify the phone number format in Twilio

### Build Errors
- Check for type errors in TypeScript files
- Make sure all dependencies are properly installed
- Review build logs for specific errors

## Monitoring and Maintenance

1. Set up logging and monitoring:
   - Configure Vercel Analytics
   - Set up error tracking with Sentry or similar service

2. Regular maintenance:
   - Update dependencies periodically
   - Apply security patches
   - Back up Supabase database regularly

3. Performance monitoring:
   - Monitor page load times
   - Check database query performance
   - Optimize as necessary

## Rolling Back Deployments

If issues are found in a production deployment:

1. On Vercel:
   - Go to the Deployments tab
   - Find the last working deployment
   - Click on the three dots and select "Promote to Production"

2. For database issues:
   - Restore from the latest backup in Supabase
   - Or run corrective SQL scripts to fix specific issues

## Continuous Integration/Continuous Deployment (CI/CD)

For automated deployments:

1. Set up GitHub Actions or Vercel GitHub integration
2. Configure preview deployments for pull requests
3. Add tests to the CI pipeline to catch issues before deployment

---

**Note**: Always test in a staging environment before deploying to production. This reduces the risk of introducing breaking changes to the live application. 