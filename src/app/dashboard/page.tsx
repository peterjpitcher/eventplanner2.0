'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EventChart } from '@/components/dashboard/event-chart';
import { getDashboardStats, getCategoryBookingData, getMonthlyBookingData, getRecentActivity } from '@/utils/dashboard-service';
import { generateChartColors } from '@/components/dashboard/event-chart';
import { Sidebar } from '@/components/navigation/sidebar';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { useAuth } from '@/contexts/auth-context';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [authLoading, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [statsData, activitiesData, categoryData, monthlyData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(),
        getCategoryBookingData(),
        getMonthlyBookingData()
      ]);

      setStats(statsData);
      setActivities(activitiesData);
      setCategoryData(categoryData);
      setMonthlyData(monthlyData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner for auth
  if (authLoading) {
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

  // Render dashboard with layout
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-64">
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="animate-pulse">
                <div className="mb-4">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white shadow-md rounded-lg p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white shadow-md rounded-lg p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="h-80 bg-gray-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <PageHeader
                  title="Dashboard"
                  description="Overview of your event planning"
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Customers</p>
                        <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats?.customerCount || 0}</h2>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href="/customers" className="text-blue-600 text-sm font-medium hover:underline">
                        View all
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active Events</p>
                        <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats?.eventCount || 0}</h2>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href="/events" className="text-blue-600 text-sm font-medium hover:underline">
                        View all
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                        <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats?.bookingCount || 0}</h2>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full">
                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href="/bookings" className="text-blue-600 text-sm font-medium hover:underline">
                        View all
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-orange-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Unread Messages</p>
                        <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats?.messageCount || 0}</h2>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-full">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href="/messages" className="text-blue-600 text-sm font-medium hover:underline">
                        View all
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Bookings by Category</h2>
                    <div className="h-80">
                      <EventChart
                        type="pie"
                        data={{
                          labels: categoryData?.labels || [],
                          datasets: [{
                            data: categoryData?.data || [],
                            backgroundColor: generateChartColors(categoryData?.labels?.length || 0),
                            borderColor: generateChartColors(categoryData?.labels?.length || 0),
                            borderWidth: 1
                          }]
                        }}
                      />
                    </div>
                  </div>

                  <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Bookings</h2>
                    <div className="h-80">
                      <EventChart
                        type="line"
                        data={{
                          labels: monthlyData?.labels || [],
                          datasets: [{
                            label: 'Bookings',
                            data: monthlyData?.data || [],
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            fill: true
                          }]
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
                  {activities.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {activities.map((activity, index) => (
                        <li key={index} className="py-4">
                          <div className="flex space-x-3">
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center 
                              ${activity.type === 'booking' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                              {activity.type === 'booking' ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.content}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No recent activity to display</div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/events/new" passHref>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm transition-colors"
                      fullWidth
                    >
                      Create Event
                    </Button>
                  </Link>
                  <Link href="/customers/new" passHref>
                    <Button 
                      variant="outline" 
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                      fullWidth
                    >
                      Add Customer
                    </Button>
                  </Link>
                  <Link href="/bookings/new" passHref>
                    <Button 
                      variant="outline"
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                      fullWidth
                    >
                      Add Booking
                    </Button>
                  </Link>
                  <Link href="/reports" passHref>
                    <Button 
                      variant="secondary"
                      className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md shadow-sm hover:bg-gray-200 transition-colors"
                      fullWidth
                    >
                      View Reports
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
} 