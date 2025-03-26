import React from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { EventDetails } from '@/components/events/event-details';
import { eventService } from '@/services/event-service';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: event } = await eventService.getEventById(params.id);
  
  if (!event) {
    return {
      title: 'Event Not Found | Event Planner',
      description: 'The requested event could not be found',
    };
  }
  
  return {
    title: `${event.title} | Event Planner`,
    description: event.description || `Details for ${event.title}`,
  };
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const { data: event, error } = await eventService.getEventById(params.id);
  
  if (error || !event) {
    console.error('Error loading event:', error);
    notFound();
  }
  
  return (
    <div className="container py-6">
      <PageHeader
        title={event.title}
        description={event.description || 'View event details below'}
      />

      <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-8">
          <EventDetails event={event} />
        </div>
      </div>
    </div>
  );
} 