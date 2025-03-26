import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { eventService } from '@/services/event-service';
import { Event } from '@/services/event-service';
import { toast } from 'sonner';
import { AlertCircle, MessageCircle } from 'lucide-react';

interface EventCancellationDialogProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onCancelled: () => void;
}

export function EventCancellationDialog({ 
  event, 
  isOpen, 
  onClose, 
  onCancelled 
}: EventCancellationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendSMS, setSendSMS] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    sent: number;
    failed: number;
  } | null>(null);

  const handleCancel = async () => {
    setIsSubmitting(true);
    setShowResults(false);
    
    try {
      const response = await eventService.cancelEvent(event.id, sendSMS);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel event');
      }
      
      // If SMS was sent, show the results
      if (sendSMS && response.smsStats) {
        setResults(response.smsStats);
        setShowResults(true);
        
        if (response.smsStats.sent > 0) {
          toast.success(`Event cancelled and ${response.smsStats.sent} notification${response.smsStats.sent === 1 ? '' : 's'} sent`);
        } else {
          toast.success('Event cancelled successfully, no SMS notifications were sent');
        }
      } else {
        toast.success('Event cancelled successfully');
        // Close the dialog after a short delay
        setTimeout(() => {
          onClose();
          onCancelled();
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel event');
      setIsSubmitting(false);
    }
  };

  // Handle the "Done" button click after showing results
  const handleDone = () => {
    onClose();
    onCancelled();
  };

  return (
    <Dialog
      open={isOpen}
      title="Cancel Event"
      onClose={onClose}
    >
      <div className="p-6">
        {!showResults ? (
          <>
            <div className="mb-6">
              <div className="flex items-start mb-4">
                <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    Are you sure you want to cancel "{event.title}"?
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    This action cannot be undone. The event will be marked as cancelled and will no longer be available for bookings.
                  </p>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> This event has bookings. You can notify customers of the cancellation via SMS.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sendSMS}
                    onChange={(e) => setSendSMS(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1 text-gray-600" />
                    Send cancellation SMS to all customers who booked this event
                  </span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Event'
                )}
              </Button>
            </div>
          </>
        ) : (
          // Show results after successful cancellation with SMS
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Event Cancelled
              </h3>
              <p className="text-gray-600">
                "{event.title}" has been successfully cancelled.
              </p>
              
              <div className="mt-6 mb-4">
                <h4 className="font-medium text-gray-800 mb-3">SMS Notification Results</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xl font-semibold">{results?.total || 0}</div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-xl font-semibold text-green-600">{results?.sent || 0}</div>
                    <div className="text-sm text-green-700">Sent</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-xl font-semibold text-red-600">{results?.failed || 0}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                </div>
              </div>
              
              {(results?.failed || 0) > 0 && (
                <div className="text-sm text-gray-600 mt-2 mb-4">
                  Some notifications failed to send. You can try contacting those customers manually.
                </div>
              )}
            </div>
            
            <Button onClick={handleDone}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
} 