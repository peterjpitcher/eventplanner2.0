# Dashboard Route Group

This directory was previously a Next.js route group containing dashboard-related pages.
It has been replaced by using the `AppLayout` component directly in individual page files.

This directory is kept empty intentionally as a placeholder to prevent the repository from
losing its structure during git operations.

All routes previously in this group have been moved to regular routes at the root level
and wrapped with the `AppLayout` component from `src/components/layout/app-layout.tsx`. 