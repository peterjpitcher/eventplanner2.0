import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CalendarIcon, UserIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export interface Activity {
  id: string;
  type: 'booking' | 'customer' | 'message';
  title: string;
  description: string;
  timestamp: string;
  link: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities?.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        No recent activity to display
      </div>
    );
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'booking':
        return <CalendarIcon className="h-5 w-5 text-blue-500" />;
      case 'customer':
        return <UserIcon className="h-5 w-5 text-green-500" />;
      case 'message':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Link
          key={activity.id}
          href={activity.link}
          className="block p-4 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-sm text-gray-500">
                {activity.description}
              </p>
            </div>
            <div className="flex-shrink-0 text-sm text-gray-500">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 