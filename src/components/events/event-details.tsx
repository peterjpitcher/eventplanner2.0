import React, { useState } from 'react';
import { Event } from '@/services/event-service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate, formatDateWithYear, formatTime } from '@/lib/date-utils';
import { EventCancellationDialog } from './event-cancellation-dialog';
import { Ban } from 'lucide-react';

interface EventDetailsProps {
  event: Event;
  onEventUpdated?: () => void;
}

export function EventDetails({ event, onEventUpdated }: EventDetailsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const handleEventCancelled = () => {
    if (onEventUpdated) {
      onEventUpdated();
    }
  };
  
  return (
    <div className="space-y-6">
      {event.is_canceled && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700 font-medium flex items-center">
            <Ban className="h-5 w-5 mr-2" />
            This event has been cancelled
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <p className="mt-1 text-sm text-gray-900">{event.category_name}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Date</h3>
          <p className="mt-1 text-sm text-gray-900">
            {formatDateWithYear(event.date)}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Time</h3>
          <p className="mt-1 text-sm text-gray-900">
            {formatTime(event.start_time)}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
          <p className="mt-1 text-sm text-gray-900">{event.capacity} attendees</p>
        </div>
        
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
            {event.description || 'No description provided'}
          </p>
        </div>
        
        {event.notes && (
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{event.notes}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center space-x-4 pt-6 border-t">
        <div>
          {!event.is_canceled && (
            <Button 
              variant="danger" 
              onClick={() => setShowCancelDialog(true)}
            >
              <Ban className="h-4 w-4 mr-2" />
              Cancel Event
            </Button>
          )}
        </div>
        
        <div className="flex space-x-4">
          <Link href={`/events/${event.id}/edit`}>
            <Button variant="outline" disabled={event.is_canceled}>Edit Event</Button>
          </Link>
          <Link href="/events">
            <Button variant="secondary">Back to Events</Button>
          </Link>
        </div>
      </div>
      
      {showCancelDialog && (
        <EventCancellationDialog
          event={event}
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onCancelled={handleEventCancelled}
        />
      )}
    </div>
  );
} 