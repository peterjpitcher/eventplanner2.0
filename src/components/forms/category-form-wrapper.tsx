'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryForm } from './category-form';
import { EventCategory, EventCategoryFormData } from '@/services/event-category-service';

interface CategoryFormWrapperProps {
  category?: EventCategory;
  onSubmit: (data: EventCategoryFormData) => Promise<{ data: EventCategory | null; error: any }>;
}

export function CategoryFormWrapper({ category, onSubmit }: CategoryFormWrapperProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EventCategoryFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const result = await onSubmit(data);
      
      if (result.error) {
        setError(result.error.message || 'Failed to save category');
      } else if (result.data) {
        router.push('/categories');
        router.refresh();
      } else {
        setError('Failed to save category');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CategoryForm
      category={category}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      error={error}
    />
  );
} 