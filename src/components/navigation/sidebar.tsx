'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { smsService } from '@/services/sms-service';

// Navigation item interface
interface NavItem {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  badge?: number;
}

// Navigation items
const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (props) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: (props) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    name: 'Event Categories',
    href: '/categories',
    icon: (props) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    name: 'Events',
    href: '/events',
    icon: (props) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    name: 'Bookings',
    href: '/bookings',
    icon: (props) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: (props) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { count } = await smsService.countUnreadReplies();
      setUnreadCount(count);
    };

    fetchUnreadCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Apply unread count to the Messages navigation item
  const navigationWithBadges = navigation.map(item => {
    if (item.name === 'Messages') {
      return { ...item, badge: unreadCount };
    }
    return item;
  });

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-blue-700 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-white">Event Planner</h1>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigationWithBadges.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActive 
                      ? 'bg-blue-800 text-white' 
                      : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-150 ${
                      isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge ? (
                    <span className="ml-3 inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-500 text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate">
                {user?.email || 'User'}
              </p>
              <button
                onClick={() => signOut()}
                className="text-xs font-medium text-blue-200 hover:text-white transition-colors duration-150"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 