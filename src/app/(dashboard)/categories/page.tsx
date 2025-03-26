import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryList } from '@/components/categories/category-list';
import { eventCategoryService } from '@/services/event-category-service';

export const metadata = {
  title: 'Event Categories | Event Planner',
  description: 'Manage your event categories',
};

export default async function CategoriesPage() {
  const { data: categories, error } = await eventCategoryService.getCategories();

  if (error) {
    console.error('Error loading categories:', error);
  }

  return (
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
        <CategoryList categories={categories || []} />
      </div>
    </div>
  );
} 