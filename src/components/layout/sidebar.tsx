'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  TagIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Events', href: '/events', icon: CalendarIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Sidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={`bg-white h-full overflow-y-auto shadow ${className}`}>
      <div className="flex flex-col h-full">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">Event Planner</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 pb-4 pt-2">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium 
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`h-5 w-5 shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
} 