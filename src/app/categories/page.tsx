'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryList } from '@/components/categories/category-list';
import { eventCategoryService } from '@/services/event-category-service';
import { AppLayout } from '@/components/layout/app-layout';

export default function CategoriesPage() {
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
          title="Event Categories"
          description="Manage your event categories and their default settings"
          action={{
            label: 'Add Category',
            href: '/categories/new'
          }}
        />

        <div className="mt-6">
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
            <CategoryList categories={categories} />
          )}
        </div>
      </div>
    </AppLayout>
  );
} 