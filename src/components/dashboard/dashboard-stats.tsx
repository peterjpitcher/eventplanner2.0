import React from 'react';
import Link from 'next/link';
import { UsersIcon, CalendarIcon, TicketIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  stats: {
    customerCount: number;
    eventCount: number;
    bookingCount: number;
    messageCount: number;
    customerGrowth: {
      last30Days: number;
      last60Days: number;
    };
  } | null;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.customerCount,
      change: stats.customerGrowth.last30Days,
      icon: <UsersIcon className="h-6 w-6 text-blue-500" />,
      href: '/customers',
      color: 'blue'
    },
    {
      title: 'Active Events',
      value: stats.eventCount,
      icon: <CalendarIcon className="h-6 w-6 text-green-500" />,
      href: '/events',
      color: 'green'
    },
    {
      title: 'Total Bookings',
      value: stats.bookingCount,
      icon: <TicketIcon className="h-6 w-6 text-purple-500" />,
      href: '/bookings',
      color: 'purple'
    },
    {
      title: 'Unread Messages',
      value: stats.messageCount,
      icon: <ChatBubbleLeftIcon className="h-6 w-6 text-orange-500" />,
      href: '/messages',
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((card) => (
        <div key={card.title} className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-${card.color}-50 rounded-full`}>
              {card.icon}
            </div>
            <Link href={card.href} className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">{card.title}</h3>
          <p className="text-2xl font-bold mb-2">{card.value}</p>
          {card.change !== undefined && (
            <p className={`text-sm ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {card.change >= 0 ? '+' : ''}{card.change}% from last 30 days
            </p>
          )}
        </div>
      ))}
    </div>
  );
} 