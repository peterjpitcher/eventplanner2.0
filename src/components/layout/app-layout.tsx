'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from '@/components/navigation/sidebar';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { useAuth } from '@/contexts/auth-context';

interface AppLayoutProps {
  children: ReactNode;
  withContainer?: boolean;
  skipAuth?: boolean;
}

export function AppLayout({ children, withContainer = true, skipAuth = false }: AppLayoutProps) {
  const { user, isLoading } = useAuth();

  // Show loading spinner while auth state is determined
  if (isLoading && !skipAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center space-y-4 p-6 max-w-md mx-auto text-center">
          <div className="h-8 w-8 text-blue-600 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
        </div>
      </div>
    );
  }

  // If no user is logged in, the auth hook will redirect
  if (!user && !skipAuth) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {!skipAuth && <Sidebar />}
      <div className={`flex flex-col flex-1 ${!skipAuth ? 'md:ml-64' : ''}`}>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className={`max-w-7xl mx-auto ${withContainer ? 'bg-white shadow rounded-lg p-6' : ''}`}>
            {children}
          </div>
        </main>
        {!skipAuth && <MobileNav />}
      </div>
    </div>
  );
} 