'use client';

import React, { useState } from 'react';
import { EventForm } from '../forms/event-form';
import { EventCategory } from '@/services/event-category-service';
import { eventService, EventFormData, Event } from '@/services/event-service';

interface CreateEventFormProps {
  categories: EventCategory[];
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({ categories }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleSubmit = async (formData: EventFormData): Promise<{ data: Event | null; error: any }> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await eventService.createEvent(formData);
      
      if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err);
      return { data: null, error: err };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EventForm
      categories={categories}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      error={error}
    />
  );
};

export default CreateEventForm; 