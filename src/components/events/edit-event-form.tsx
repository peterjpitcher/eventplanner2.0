'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EventForm } from '../forms/event-form';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { EventCategory } from '@/services/event-category-service';
import { eventService, Event, EventFormData } from '@/services/event-service';
import { toast } from 'sonner';

interface EditEventFormProps {
  event: Event;
  categories: EventCategory[];
}

export const EditEventForm: React.FC<EditEventFormProps> = ({ event, categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [error, setError] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [sendSMS, setSendSMS] = useState(true);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    // Check if we should automatically open the cancel dialog
    if (searchParams?.get('action') === 'cancel') {
      setShowCancelConfirm(true);
    }
  }, [searchParams]);

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
      const { error, smsResults } = await eventService.cancelEvent(event.id, sendSMS, customMessage);
      
      if (error) {
        setError(error);
        toast.error('Failed to cancel event');
        setIsCanceling(false);
        return;
      }
      
      if (sendSMS && smsResults) {
        if (smsResults.messagesSent > 0) {
          toast.success(`Event cancelled successfully. ${smsResults.messagesSent} notification${smsResults.messagesSent !== 1 ? 's' : ''} sent.`);
        } else if (smsResults.totalBookings > 0) {
          toast.warning(`Event cancelled but no SMS notifications were sent. Please check the logs.`);
        } else {
          toast.success('Event cancelled successfully. No bookings to notify.');
        }
      } else {
        toast.success('Event cancelled successfully');
      }
      
      router.refresh();
      setShowCancelConfirm(false);
      setIsCanceling(false);
    } catch (err) {
      setError(err);
      toast.error('An unexpected error occurred');
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
          
          <div className="mb-4">
            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                checked={sendSMS}
                onChange={(e) => setSendSMS(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span>Send cancellation SMS to all booked customers</span>
            </label>
            
            {sendSMS && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom message (optional)
                </label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g., We hope to reschedule soon."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be added to the standard cancellation message.
                </p>
              </div>
            )}
          </div>
          
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