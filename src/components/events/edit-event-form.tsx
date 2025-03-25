'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EventForm } from '../forms/event-form';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { EventCategory } from '@/services/event-category-service';
import { eventService, Event, EventFormData } from '@/services/event-service';

interface EditEventFormProps {
  event: Event;
  categories: EventCategory[];
}

export const EditEventForm: React.FC<EditEventFormProps> = ({ event, categories }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSubmit = async (formData: EventFormData): Promise<{ data: Event | null; error: any }> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await eventService.updateEvent(event.id, formData);
      
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

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const { error } = await eventService.deleteEvent(event.id);
      
      if (error) {
        setError(error);
        setIsDeleting(false);
        return;
      }
      
      router.push('/events');
    } catch (err) {
      setError(err);
      setIsDeleting(false);
    }
  };

  const handleCancel = async () => {
    setIsCanceling(true);
    setError(null);

    try {
      const { error } = await eventService.cancelEvent(event.id);
      
      if (error) {
        setError(error);
        setIsCanceling(false);
        return;
      }
      
      router.refresh();
      setShowCancelConfirm(false);
      setIsCanceling(false);
    } catch (err) {
      setError(err);
      setIsCanceling(false);
    }
  };

  return (
    <div>
      {showDeleteConfirm ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">Delete Event</h3>
          <p className="text-red-700 mb-4">
            Are you sure you want to delete this event? This action cannot be undone.
          </p>
          <div className="flex space-x-2">
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Event'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : showCancelConfirm ? (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Cancel Event</h3>
          <p className="text-yellow-700 mb-4">
            Are you sure you want to mark this event as canceled? This will be visible to users.
          </p>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isCanceling}
            >
              {isCanceling ? 'Canceling...' : 'Yes, Cancel Event'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isCanceling}
            >
              No, Keep Event Active
            </Button>
          </div>
        </div>
      ) : null}

      {event.is_canceled && (
        <div className="mb-6">
          <Alert variant="error">
            This event has been canceled. You can still edit the details, but the event will remain marked as canceled.
          </Alert>
        </div>
      )}

      <EventForm
        event={event}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />

      {!showDeleteConfirm && !showCancelConfirm && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Event Actions</h3>
          <div className="flex flex-wrap gap-2">
            {!event.is_canceled && (
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Event
              </Button>
            )}
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Event
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEventForm; 