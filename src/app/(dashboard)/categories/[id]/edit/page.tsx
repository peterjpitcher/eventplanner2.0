import React from 'react';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { CategoryFormWrapper } from '@/components/forms/category-form-wrapper';
import { eventCategoryService } from '@/services/event-category-service';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: EditCategoryPageProps) {
  const { data: category } = await eventCategoryService.getCategoryById(params.id);
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `Edit ${category.name}`,
    description: `Edit the ${category.name} category`,
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { data: category } = await eventCategoryService.getCategoryById(params.id);
  
  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={`Edit ${category.name}`}
        description="Update the category details below"
      />
      <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-8">
          <CategoryFormWrapper
            category={category}
            onSubmit={async (data) => {
              'use server';
              const result = await eventCategoryService.updateCategory(params.id, data);
              return result;
            }}
          />
        </div>
      </div>
    </div>
  );
} 