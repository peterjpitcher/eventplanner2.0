'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { CreateEventForm } from '@/components/events/create-event-form';
import { eventCategoryService } from '@/services/event-category-service';
import { AppLayout } from '@/components/layout/app-layout';

// Metadata can't be exported from client components
// Title is set in the PageHeader component instead

export default function CreateEventPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await eventCategoryService.getCategories();
        
        if (error) {
          throw error;
        }
        
        setCategories(data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <AppLayout>
      <div className="container py-6">
        <PageHeader
          title="Create Event"
          description="Fill in the form below to create a new event"
        />

        <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-8">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading categories...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error.message}</span>
              </div>
            ) : (
              <CreateEventForm categories={categories} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 