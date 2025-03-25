'use client';

import React from 'react';
import Link from 'next/link';
import { Event } from '@/services/event-service';
import { EventCategory } from '@/services/event-category-service';
import { formatDateTime } from '@/lib/date-utils';
import { Badge } from '../ui/badge';

interface EventListProps {
  events: Event[];
  categories: EventCategory[];
}

export const EventList: React.FC<EventListProps> = ({ events, categories }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date & Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Location
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    <Link href={`/events/${event.id}`}>
                      {event.title}
                    </Link>
                  </div>
                  <div className="text-sm text-gray-500 max-w-md truncate">
                    {event.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.category ? (
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: event.category.color }}
                      />
                      <span className="text-sm text-gray-900">
                        {event.category.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      No category
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(event.date, event.start_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {event.is_canceled ? (
                    <Badge variant="error">Canceled</Badge>
                  ) : event.is_published ? (
                    <Badge variant="success">Published</Badge>
                  ) : (
                    <Badge variant="warning">Draft</Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.location || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventList; 