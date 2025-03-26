'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryFormWrapper } from '@/components/forms/category-form-wrapper';
import { eventCategoryService, EventCategory } from '@/services/event-category-service';
import { AppLayout } from '@/components/layout/app-layout';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = params;
  const router = useRouter();
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCategory() {
      try {
        setIsLoading(true);
        const { data, error } = await eventCategoryService.getCategoryById(id);
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Category not found');
        }
        
        setCategory(data);
      } catch (err) {
        console.error('Error loading category:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategory();
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-6">
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading category details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !category) {
    return (
      <AppLayout>
        <div className="container py-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error?.message || 'Category not found'}</span>
            <div className="mt-4">
              <button 
                onClick={() => router.push('/categories')}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Back to Categories
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6">
        <PageHeader
          title={`Edit ${category.name}`}
          description="Update the category details below"
        />
        <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-8">
            <CategoryFormWrapper
              category={category}
              onSubmit={async (data) => {
                const result = await eventCategoryService.updateCategory(id, data);
                return result;
              }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 