import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { CreateEventForm } from '@/components/events/create-event-form';
import { eventCategoryService } from '@/services/event-category-service';

export const metadata = {
  title: 'Create Event | Event Planner',
  description: 'Create a new event',
};

export default async function CreateEventPage() {
  const { data: categories, error } = await eventCategoryService.getCategories();

  if (error) {
    console.error('Error loading categories:', error);
  }

  return (
    <div className="container py-6">
      <PageHeader
        title="Create Event"
        description="Fill in the form below to create a new event"
      />

      <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-8">
          <CreateEventForm categories={categories || []} />
        </div>
      </div>
    </div>
  );
} 