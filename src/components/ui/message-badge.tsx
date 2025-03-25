'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { smsService } from '@/services/sms-service';

interface MessageBadgeProps {
  className?: string;
}

export function MessageBadge({ className = '' }: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count } = await smsService.countUnreadReplies();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || unreadCount === 0) {
    return null;
  }

  return (
    <Link href="/messages" className={`inline-block ${className}`}>
      <div className="relative">
        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 text-xs font-bold rounded-full bg-red-500 text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      </div>
    </Link>
  );
} 