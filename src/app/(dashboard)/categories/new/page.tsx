import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryFormWrapper } from '@/components/forms/category-form-wrapper';
import { eventCategoryService } from '@/services/event-category-service';

export const metadata = {
  title: 'Create Category',
  description: 'Create a new event category',
};

export default function CreateCategoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Create Category"
        description="Create a new event category to organize your events"
      />
      <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-8">
          <CategoryFormWrapper
            onSubmit={async (data) => {
              'use server';
              const result = await eventCategoryService.createCategory(data);
              return result;
            }}
          />
        </div>
      </div>
    </div>
  );
} 