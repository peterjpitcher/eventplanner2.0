'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { EventChart } from '@/components/dashboard/event-chart';
import { getDashboardStats, getCategoryBookingData, getMonthlyBookingData, getRecentActivity } from '@/utils/dashboard-service';
import { generateChartColors } from '@/components/dashboard/event-chart';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="container py-6">
        <PageHeader
          title="Dashboard"
          description="Overview of your event planning"
        />
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your event planning"
      />

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
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

        <div className="bg-white shadow rounded-lg p-6">
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
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <RecentActivity activities={activities} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/events/new" passHref>
          <Button fullWidth>Create Event</Button>
        </Link>
        <Link href="/customers/new" passHref>
          <Button variant="outline" fullWidth>Add Customer</Button>
        </Link>
        <Link href="/customers/import" passHref>
          <Button variant="outline" fullWidth>Import Customers</Button>
        </Link>
        <Link href="/reports" passHref>
          <Button variant="secondary" fullWidth>View Reports</Button>
        </Link>
      </div>
    </div>
  );
} 