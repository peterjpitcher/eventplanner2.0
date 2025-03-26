'use client';

import React, { useState } from 'react';
import { Booking, BookingFormData, bookingService } from '@/services/booking-service';
import { Customer } from '@/types';
import { Event } from '@/services/event-service';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { SMSMessage, smsService } from '@/services/sms-service';
import { BookingForm } from './booking-form';
import { Dialog } from '@/components/ui/dialog';
import { Spinner } from '../ui/spinner';

interface BookingDetailProps {
  booking: Booking;
  eventName?: string;
  customerName?: string;
  onRefresh?: () => void;
  smsMessages?: SMSMessage[];
}

export const BookingDetail: React.FC<BookingDetailProps> = ({ 
  booking, 
  eventName, 
  customerName,
  onRefresh,
  smsMessages
}) => {
  const [loading, setLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if 7-day and 24-hour reminders have been sent
  const has7DayReminder = smsMessages?.some(msg => msg.message_type === 'reminder_7day');
  const has24HrReminder = smsMessages?.some(msg => msg.message_type === 'reminder_24hr');

  const handleSendReminder = async (reminderType: '7day' | '24hr') => {
    setReminderLoading(reminderType);
    try {
      const response = await smsService.sendReminder(booking.id, reminderType);
      
      if (response.success) {
        toast.success(`${reminderType === '7day' ? '7-day' : '24-hour'} reminder sent`);
        if (onRefresh) onRefresh();
      } else {
        toast.error(`Failed to send reminder: ${response.error}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while sending the reminder');
      console.error('Error sending reminder:', error);
    } finally {
      setReminderLoading(null);
    }
  };

  const handleUpdateBooking = async (formData: BookingFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error, smsSent } = await bookingService.updateBooking(booking.id, formData);
      
      if (error) {
        throw error;
      }
      
      toast.success(
        smsSent 
          ? 'Booking updated successfully. SMS notification sent.' 
          : 'Booking updated successfully'
      );
      setIsEditing(false);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      setError(error.message || 'Failed to update booking');
      toast.error(error.message || 'Failed to update booking');
      console.error('Error updating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium">{customerName}</h3>
          <p className="text-gray-600">{eventName}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {booking.created_at && (
              <p>Booked on {format(new Date(booking.created_at), 'dd MMM yyyy')}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit Booking
          </Button>
        </div>
      </div>
      
      <div className="grid gap-2 mb-4">
        <div className="text-sm">
          <span className="font-medium">Seats/Reminder:</span> {booking.seats_or_reminder}
        </div>
        {booking.notes && (
          <div className="text-sm">
            <span className="font-medium">Notes:</span> {booking.notes}
          </div>
        )}
      </div>
      
      {/* SMS Status */}
      <div className="border-t pt-3 mt-3">
        <h4 className="text-sm font-semibold mb-2">SMS Status</h4>
        <div className="grid gap-2">
          {/* 7-day reminder status */}
          <div className="flex justify-between items-center text-sm">
            <span>7-day Reminder:</span>
            <div className="flex items-center gap-2">
              {has7DayReminder ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Sent</span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Not sent</span>
              )}
              {!has7DayReminder && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSendReminder('7day')}
                  disabled={reminderLoading !== null}
                >
                  {reminderLoading === '7day' ? (
                    <>
                      <Spinner size="sm" />
                      <span className="ml-1">Sending...</span>
                    </>
                  ) : 'Send'}
                </Button>
              )}
            </div>
          </div>
          
          {/* 24-hour reminder status */}
          <div className="flex justify-between items-center text-sm">
            <span>24-hour Reminder:</span>
            <div className="flex items-center gap-2">
              {has24HrReminder ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Sent</span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Not sent</span>
              )}
              {!has24HrReminder && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSendReminder('24hr')}
                  disabled={reminderLoading !== null}
                >
                  {reminderLoading === '24hr' ? (
                    <>
                      <Spinner size="sm" />
                      <span className="ml-1">Sending...</span>
                    </>
                  ) : 'Send'}
                </Button>
              )}
            </div>
          </div>
          
          {/* SMS Message Count */}
          {smsMessages && (
            <div className="text-xs text-gray-500 mt-1">
              {smsMessages.length} message{smsMessages.length !== 1 ? 's' : ''} sent for this booking
            </div>
          )}
        </div>
      </div>

      {/* Edit Booking Dialog */}
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Booking"
      >
        <BookingForm
          booking={booking}
          eventId={booking.event_id}
          onSubmit={handleUpdateBooking}
          isSubmitting={loading}
          error={error}
        />
      </Dialog>
    </div>
  );
}; 