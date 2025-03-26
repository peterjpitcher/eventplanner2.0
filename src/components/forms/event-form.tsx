'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Event, EventFormData } from '@/services/event-service';
import { EventCategory } from '@/services/event-category-service';
import { FormGroup } from '../ui/form-group';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { Alert } from '../ui/alert';
import { Input } from '../ui/input';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface EventFormProps {
  event?: Event;
  categories: EventCategory[];
  onSubmit: (data: EventFormData) => Promise<{ data: Event | null; error: any }>;
  isSubmitting: boolean;
  error: any;
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  categories,
  onSubmit,
  isSubmitting,
  error,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category_id: null,
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    capacity: null,
    notes: '',
    is_published: false,
  });
  const [eventDate, setEventDate] = useState<Date | null>(new Date());

  // Load existing event data if editing
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        category_id: event.category_id,
        date: event.date,
        start_time: event.start_time,
        capacity: event.capacity,
        notes: event.notes || '',
        is_published: event.is_published,
      });

      if (event.date) {
        setEventDate(new Date(event.date));
      }
    }
  }, [event]);

  // Apply defaults from selected category
  useEffect(() => {
    if (formData.category_id) {
      const selectedCategory = categories.find(
        (category) => category.id === formData.category_id
      );
      
      if (selectedCategory) {
        setFormData((prevData) => ({
          ...prevData,
          capacity: prevData.capacity ?? selectedCategory.default_capacity,
        }));
      }
    }
  }, [formData.category_id, categories]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value ? Number(value) : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDateChange = (date: Date | null) => {
    setEventDate(date);
    if (date) {
      setFormData({
        ...formData,
        date: date.toISOString().split('T')[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit(formData);
    if (result.data && !result.error) {
      router.push('/events');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          {error.message || 'An error occurred while saving the event.'}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Input
            label="Title"
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Event title"
            error={error?.title}
          />

          <FormGroup
            label="Category"
            htmlFor="category_id"
            error={error?.category_id}
          >
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- Select a category --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormGroup>

          <FormGroup
            label="Description"
            htmlFor="description"
            error={error?.description}
          >
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Event description"
            />
          </FormGroup>

          <FormGroup
            label="Notes"
            htmlFor="notes"
            error={error?.notes}
          >
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Additional notes"
            />
          </FormGroup>
        </div>

        <div className="space-y-6">
          <FormGroup
            label="Date"
            htmlFor="date"
            required
            error={error?.date}
          >
            <DatePicker
              selected={eventDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              required
            />
          </FormGroup>

          <Input
            label="Start Time"
            id="start_time"
            name="start_time"
            type="time"
            value={formData.start_time}
            onChange={handleChange}
            required
            error={error?.start_time}
          />

          <Input
            label="Capacity"
            id="capacity"
            name="capacity"
            type="number"
            min="0"
            value={formData.capacity || ''}
            onChange={handleChange}
            placeholder="Capacity"
            error={error?.capacity}
          />

          <div className="pt-4">
            <label className="flex items-center space-x-2">
              <input
                id="is_published"
                name="is_published"
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Publish event (visible to all users)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm; 