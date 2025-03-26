'use client';

import React, { useState, useEffect } from 'react';
import { Booking, BookingFormData, bookingService } from '@/services/booking-service';
import { Customer } from '@/types';
import { Event } from '@/services/event-service';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { SMSStatus } from './sms-status';
import { smsService } from '@/services/sms-service';
import { BookingForm } from './booking-form';
import { Dialog } from '@/components/ui/dialog';
import { Spinner } from '../ui/spinner';
import { MessageCircle, Bell, AlertTriangle } from 'lucide-react';
import { reminderService } from '@/services/reminder-service';

interface SMSMessage {
  id: string;
  booking_id: string;
  message_type: string;
  message: string;
  status: string;
  sent_at: string;
}

interface BookingDetailProps {
  booking: Booking;
  eventName?: string;
  customerName?: string;
  onRefresh?: () => void;
  smsMessages?: SMSMessage[];
}

export function BookingDetail({ booking, eventName, customerName, onRefresh, smsMessages = [] }: BookingDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendSMSOnDelete, setSendSMSOnDelete] = useState(true);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [smsSent, setSmsSent] = useState<boolean>(false);
  const [reminderStatus, setReminderStatus] = useState<{
    reminder_7day: { sent: boolean; sentAt?: string };
    reminder_24hr: { sent: boolean; sentAt?: string };
  }>({
    reminder_7day: { sent: false },
    reminder_24hr: { sent: false }
  });
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [selectedReminderType, setSelectedReminderType] = useState<string>('reminder_24hr');
  
  // Get the most recent confirmation SMS, if any
  const lastConfirmationSMS = smsMessages
    .filter(msg => msg.message_type === 'booking_confirmation')
    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())[0];
  
  const smsStatus = lastConfirmationSMS 
    ? lastConfirmationSMS.status === 'sent' ? 'sent' : 'failed'
    : null;
    
  // Check if the event has already occurred
  const isEventInPast = booking.event?.date ? 
    isBefore(parseISO(booking.event.date), new Date()) : false;
    
  useEffect(() => {
    // Fetch reminder status when the component loads
    async function fetchReminderStatus() {
      if (booking.id) {
        const status = await reminderService.getReminderStatus(booking.id);
        setReminderStatus(status);
      }
    }
    
    fetchReminderStatus();
  }, [booking.id]);

  const handleUpdate = async (formData: BookingFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await bookingService.updateBooking(booking.id, formData);
      
      if (response.error) {
        throw response.error;
      }
      
      toast.success('Booking updated successfully');
      setIsEditing(false);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update booking');
      toast.error(err.message || 'Failed to update booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await bookingService.deleteBooking(booking.id, sendSMSOnDelete);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete booking');
      }
      
      if (response.smsSent) {
        toast.success('Booking deleted and cancellation SMS sent');
      } else if (sendSMSOnDelete) {
        toast.success('Booking deleted, but cancellation SMS could not be sent');
      } else {
        toast.success('Booking deleted successfully');
      }
      
      setIsDeleting(false);
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete booking');
      toast.error(err.message || 'Failed to delete booking');
      setIsSubmitting(false);
      setIsDeleting(false);
    }
  };
  
  const handleResendSMS = async () => {
    if (!booking.customer || !booking.event) {
      toast.error('Customer or event data missing');
      return;
    }
    
    setIsSendingSMS(true);
    setSmsSent(false);
    
    try {
      const result = await bookingService.sendConfirmationSMS(
        booking,
        booking.customer,
        booking.event
      );
      
      if (result.success) {
        toast.success('SMS confirmation sent successfully');
        setSmsSent(true);
        if (onRefresh) onRefresh();
      } else {
        toast.error('Failed to send SMS confirmation');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Failed to send SMS confirmation');
    } finally {
      setIsSendingSMS(false);
    }
  };

  const handleSendReminder = async () => {
    if (!booking.id) {
      toast.error('Booking ID is missing');
      return;
    }
    
    if (isEventInPast) {
      toast.error('Cannot send reminders for past events');
      setShowReminderDialog(false);
      return;
    }
    
    setSendingReminder(true);
    
    try {
      const result = await reminderService.sendManualReminder(
        booking.id,
        selectedReminderType
      );
      
      if (result.success) {
        toast.success('Reminder sent successfully');
        setShowReminderDialog(false);
        
        // Update reminder status
        const newStatus = await reminderService.getReminderStatus(booking.id);
        setReminderStatus(newStatus);
        
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(`Failed to send reminder: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      toast.error(`Failed to send reminder: ${error.message || 'Unknown error'}`);
    } finally {
      setSendingReminder(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Edit Booking</h2>
          <Button
            onClick={() => setIsEditing(false)}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
        
        <BookingForm
          booking={booking}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
            <Button
              onClick={() => setIsDeleting(true)}
              variant="danger"
              size="sm"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-5">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Customer</dt>
            <dd className="mt-1 text-sm text-gray-900">{customerName || 'Unknown Customer'}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Event</dt>
            <dd className="mt-1 text-sm text-gray-900">{eventName || 'Unknown Event'}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Seats Reserved</dt>
            <dd className="mt-1 text-sm text-gray-900">{booking.seats_or_reminder}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Date Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {format(new Date(booking.created_at), 'PPP')}
            </dd>
          </div>
          
          {booking.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{booking.notes}</dd>
            </div>
          )}
          
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">SMS Confirmation</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <SMSStatus status={smsStatus} />
                  {lastConfirmationSMS && (
                    <span className="ml-2 text-gray-500 text-xs">
                      {format(new Date(lastConfirmationSMS.sent_at), 'PPp')}
                    </span>
                  )}
                </div>
                
                <Button
                  onClick={handleResendSMS}
                  disabled={isSendingSMS}
                  size="sm"
                  className="ml-2"
                >
                  {isSendingSMS ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Resend SMS
                    </>
                  )}
                </Button>
              </div>
            </dd>
          </div>
          
          {/* Add reminder information */}
          <div className="sm:col-span-2 border-t pt-4">
            <dt className="text-sm font-medium text-gray-500">Reminders</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <span className="font-medium">7-day Reminder</span>
                    <div className="flex items-center mt-1">
                      <SMSStatus 
                        status={reminderStatus.reminder_7day.sent ? 'sent' : null} 
                        showLabel={true}
                      />
                      {reminderStatus.reminder_7day.sentAt && (
                        <span className="ml-2 text-gray-500 text-xs">
                          {format(new Date(reminderStatus.reminder_7day.sentAt), 'PPp')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <span className="font-medium">24-hour Reminder</span>
                    <div className="flex items-center mt-1">
                      <SMSStatus 
                        status={reminderStatus.reminder_24hr.sent ? 'sent' : null} 
                        showLabel={true}
                      />
                      {reminderStatus.reminder_24hr.sentAt && (
                        <span className="ml-2 text-gray-500 text-xs">
                          {format(new Date(reminderStatus.reminder_24hr.sentAt), 'PPp')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={() => setShowReminderDialog(true)}
                  disabled={isEventInPast}
                  size="sm"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
              
              {isEventInPast && (
                <div className="mt-2 flex items-start space-x-2 text-amber-600 text-xs">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>This event has already passed. Reminders cannot be sent.</span>
                </div>
              )}
            </dd>
          </div>
        </dl>
      </div>
      
      {isDeleting && (
        <Dialog
          open={isDeleting}
          title="Delete Booking"
          onClose={() => setIsDeleting(false)}
        >
          <div className="p-6">
            <p className="mb-4">Are you sure you want to delete this booking?</p>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sendSMSOnDelete}
                  onChange={(e) => setSendSMSOnDelete(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Send cancellation SMS to customer
                </span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleting(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Booking'
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
      
      {/* Send reminder dialog */}
      {showReminderDialog && (
        <Dialog
          open={showReminderDialog}
          title="Send Reminder"
          onClose={() => setShowReminderDialog(false)}
        >
          <div className="p-6">
            <p className="mb-4">Send a reminder SMS to the customer about their booking.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Type
              </label>
              <select
                value={selectedReminderType}
                onChange={(e) => setSelectedReminderType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="reminder_24hr">24-hour Reminder</option>
                <option value="reminder_7day">7-day Reminder</option>
              </select>
              
              {reminderStatus[selectedReminderType as keyof typeof reminderStatus]?.sent && (
                <div className="mt-2 flex items-start space-x-2 text-amber-600 text-xs">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>This reminder has already been sent. Sending again will deliver another message to the customer.</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowReminderDialog(false)}
                disabled={sendingReminder}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendReminder}
                disabled={sendingReminder}
              >
                {sendingReminder ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reminder'
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
} 