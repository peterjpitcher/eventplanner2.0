'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EventCategory, EventCategoryFormData } from '@/services/event-category-service';
import { FormGroup } from '../ui/form-group';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';
import { Alert } from '../ui/alert';

interface CategoryFormProps {
  category?: EventCategory;
  onSubmit: (data: EventCategoryFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function CategoryForm({ category, onSubmit, isSubmitting, error }: CategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<EventCategoryFormData>({
    name: '',
    default_capacity: 10,
    default_start_time: '09:00',
    notes: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        default_capacity: category.default_capacity,
        default_start_time: category.default_start_time,
        notes: category.notes || '',
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'default_capacity' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <FormGroup label="Name" htmlFor="name">
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter category name"
        />
      </FormGroup>

      <FormGroup label="Default Capacity" htmlFor="default_capacity">
        <Input
          type="number"
          id="default_capacity"
          name="default_capacity"
          value={formData.default_capacity}
          onChange={handleChange}
          required
          min="1"
          placeholder="Enter default capacity"
        />
      </FormGroup>

      <FormGroup label="Default Start Time" htmlFor="default_start_time">
        <Input
          type="time"
          id="default_start_time"
          name="default_start_time"
          value={formData.default_start_time}
          onChange={handleChange}
          required
        />
      </FormGroup>

      <FormGroup label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter any additional notes"
        />
      </FormGroup>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            'Save Category'
          )}
        </Button>
      </div>
    </form>
  );
} 