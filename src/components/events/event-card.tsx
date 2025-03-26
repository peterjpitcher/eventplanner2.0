'use client';

import React from 'react';
import { Event } from '@/services/event-service';
import Link from 'next/link';
import { formatDate, formatTime } from '@/lib/date-utils';
import { CalendarIcon, ClockIcon, Users as UserGroupIcon, TagIcon } from 'lucide-react';
import { Badge } from '../ui/badge';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      {/* Event header */}
      <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {event.title}
        </h3>
        <div>
          {event.is_canceled ? (
            <Badge variant="error">Cancelled</Badge>
          ) : event.is_published ? (
            <Badge variant="success">Published</Badge>
          ) : (
            <Badge variant="warning">Draft</Badge>
          )}
        </div>
      </div>
      
      {/* Event details */}
      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <CalendarIcon size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-700">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <ClockIcon size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-700">{formatTime(event.start_time)}</span>
          </div>
          
          {event.category_name && (
            <div className="flex items-center text-sm">
              <TagIcon size={16} className="text-gray-400 mr-2" />
              <span className="text-gray-700">{event.category_name}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <UserGroupIcon size={16} className="text-gray-400 mr-2" />
            <span className="text-gray-700">Capacity: {event.capacity}</span>
          </div>
        </div>
        
        {event.description && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          View
        </Link>
        
        <Link
          href={`/events/${event.id}/edit`}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded border border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
        >
          Edit
        </Link>
      </div>
    </div>
  );
} 