'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is authenticated, redirect to events page
        router.replace('/events');
      } else {
        // User is not authenticated, redirect to login page
        router.replace('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center space-y-4 p-6 max-w-md mx-auto text-center">
        <div className="h-8 w-8 text-blue-600 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
      </div>
    </div>
  );
} 