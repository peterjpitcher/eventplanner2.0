import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EventList } from '@/components/events/event-list';
import { eventService } from '@/services/event-service';
import { eventCategoryService } from '@/services/event-category-service';

export const metadata = {
  title: 'Events | Event Planner',
  description: 'Manage your events',
};

export default async function EventsPage() {
  const { data: events, error } = await eventService.getEvents();
  const { data: categories } = await eventCategoryService.getCategories();

  if (error) {
    console.error('Error loading events:', error);
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Events"
          description="Manage and organize your events"
        />
        <div className="flex space-x-2">
          <Link href="/events/new" passHref>
            <Button>Create Event</Button>
          </Link>
        </div>
      </div>

      {events && events.length > 0 ? (
        <EventList events={events} categories={categories || []} />
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">
            You haven&apos;t created any events yet. Get started by creating your first event.
          </p>
          <Link href="/events/new" passHref>
            <Button>Create Your First Event</Button>
          </Link>
        </div>
      )}
    </div>
  );
} 