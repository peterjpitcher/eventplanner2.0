'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Sidebar } from '@/components/navigation/sidebar';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { useAuth } from '@/contexts/auth-context';

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  // Show loading spinner while auth state is determined
  if (isLoading) {
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
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-64">
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <PageHeader
              title="Dashboard"
              description="Overview of your event planning"
            />
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-gray-600 mt-2">Use the navigation to access your events, bookings, and more.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Link href="/events" className="block p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                  <h3 className="font-medium text-blue-700">Manage Events</h3>
                  <p className="text-sm text-blue-600 mt-1">View, create, and edit your events</p>
                </Link>
                
                <Link href="/customers" className="block p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                  <h3 className="font-medium text-green-700">Customer Directory</h3>
                  <p className="text-sm text-green-600 mt-1">Browse and manage your customers</p>
                </Link>
                
                <Link href="/bookings" className="block p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                  <h3 className="font-medium text-purple-700">Booking Management</h3>
                  <p className="text-sm text-purple-600 mt-1">Handle event bookings and reservations</p>
                </Link>
                
                <Link href="/messages" className="block p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors">
                  <h3 className="font-medium text-yellow-700">Messages</h3>
                  <p className="text-sm text-yellow-600 mt-1">View customer messages and responses</p>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
