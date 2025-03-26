import React from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { EditEventForm } from '@/components/events/edit-event-form';
import { eventService } from '@/services/event-service';
import { eventCategoryService } from '@/services/event-category-service';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: event } = await eventService.getEventById(params.id);
  
  if (!event) {
    return {
      title: 'Event Not Found | Event Planner',
      description: 'The requested event could not be found',
    };
  }
  
  return {
    title: `Edit ${event.title} | Event Planner`,
    description: `Edit details for ${event.title}`,
  };
}

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const { data: event, error: eventError } = await eventService.getEventById(params.id);
  const { data: categories, error: categoriesError } = await eventCategoryService.getCategories();
  
  if (eventError || !event) {
    console.error('Error loading event:', eventError);
    notFound();
  }
  
  if (categoriesError) {
    console.error('Error loading categories:', categoriesError);
  }
  
  return (
    <div className="container py-6">
      <PageHeader
        title={`Edit ${event.title}`}
        description="Update the event details below"
      />

      <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-8">
          <EditEventForm event={event} categories={categories || []} />
        </div>
      </div>
    </div>
  );
} 