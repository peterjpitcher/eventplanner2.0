'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryFormWrapper } from '@/components/forms/category-form-wrapper';
import { eventCategoryService } from '@/services/event-category-service';
import { AppLayout } from '@/components/layout/app-layout';

export default function CreateCategoryPage() {
  return (
    <AppLayout>
      <div className="container py-6">
        <PageHeader
          title="Create Category"
          description="Create a new event category to organize your events"
        />
        <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-8">
            <CategoryFormWrapper
              onSubmit={async (data) => {
                const result = await eventCategoryService.createCategory(data);
                return result;
              }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 