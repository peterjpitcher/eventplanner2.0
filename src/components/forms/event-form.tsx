'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Event, EventFormData } from '@/services/event-service';
import { EventCategory } from '@/services/event-category-service';
import { FormGroup } from '../ui/form-group';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { Alert } from '../ui/alert';
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
    end_time: null,
    duration: null,
    price: null,
    capacity: null,
    location: '',
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
        end_time: event.end_time,
        duration: event.duration,
        price: event.price,
        capacity: event.capacity,
        location: event.location || '',
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
          price: prevData.price ?? selectedCategory.default_price,
          capacity: prevData.capacity ?? selectedCategory.default_capacity,
          duration: prevData.duration ?? selectedCategory.default_duration,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FormGroup
            label="Title"
            htmlFor="title"
            required
            error={error?.title}
          >
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="input"
              placeholder="Event title"
            />
          </FormGroup>

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
              className="input"
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
              className="input"
              placeholder="Event description"
            />
          </FormGroup>

          <FormGroup
            label="Location"
            htmlFor="location"
            error={error?.location}
          >
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location || ''}
              onChange={handleChange}
              className="input"
              placeholder="Event location"
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
              className="input w-full"
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              required
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup
              label="Start Time"
              htmlFor="start_time"
              required
              error={error?.start_time}
            >
              <input
                id="start_time"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="input"
              />
            </FormGroup>

            <FormGroup
              label="End Time (optional)"
              htmlFor="end_time"
              error={error?.end_time}
            >
              <input
                id="end_time"
                name="end_time"
                type="time"
                value={formData.end_time || ''}
                onChange={handleChange}
                className="input"
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormGroup
              label="Duration (minutes)"
              htmlFor="duration"
              error={error?.duration}
            >
              <input
                id="duration"
                name="duration"
                type="number"
                min="0"
                value={formData.duration || ''}
                onChange={handleChange}
                className="input"
                placeholder="Duration"
              />
            </FormGroup>

            <FormGroup
              label="Price"
              htmlFor="price"
              error={error?.price}
            >
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price || ''}
                onChange={handleChange}
                className="input"
                placeholder="Price"
              />
            </FormGroup>

            <FormGroup
              label="Capacity"
              htmlFor="capacity"
              error={error?.capacity}
            >
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="0"
                value={formData.capacity || ''}
                onChange={handleChange}
                className="input"
                placeholder="Capacity"
              />
            </FormGroup>
          </div>

          <div className="pt-4">
            <label className="flex items-center">
              <input
                id="is_published"
                name="is_published"
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="mr-2"
              />
              <span>Publish event (visible to all users)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
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