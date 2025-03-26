'use client';

import { useState, useEffect } from 'react';
import { BookingFormData, Booking, bookingService } from '@/services/booking-service';
import { Customer } from '@/types';
import { customerService } from '@/services/customer-service';
import { eventService } from '@/services/event-service';
import { FormGroup } from '../ui/form-group';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';
import { Alert } from '../ui/alert';
import { toast } from 'sonner';

interface BookingFormProps {
  booking?: Booking;
  eventId?: string;
  onSubmit: (data: BookingFormData) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

export function BookingForm({ booking, eventId, onSubmit, isSubmitting, error }: BookingFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(!eventId);
  const [formData, setFormData] = useState<BookingFormData>({
    customer_id: booking?.customer_id || '',
    event_id: eventId || booking?.event_id || '',
    seats_or_reminder: booking?.seats_or_reminder?.toString() || '1',
    send_notification: booking?.send_notification !== undefined ? booking.send_notification : true,
    notes: booking?.notes || ''
  });

  // Fetch customers for selection
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoadingCustomers(true);
        const { data, error } = await customerService.getCustomers();
        
        if (error) {
          toast.error(typeof error === 'string' ? error : 'Failed to load customers');
          console.error('Error fetching customers:', error);
          return;
        }
        
        setCustomers(data || []);
        setFilteredCustomers(data || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load customers');
        console.error('Error fetching customers:', err);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch events if no specific event is selected
  useEffect(() => {
    const fetchEvents = async () => {
      if (eventId) {
        setIsLoadingEvents(false);
        return;
      }

      try {
        setIsLoadingEvents(true);
        const { data, error } = await eventService.getEvents();
        
        if (error) {
          toast.error(typeof error === 'string' ? error : 'Failed to load events');
          console.error('Error fetching events:', error);
          return;
        }
        
        setEvents(data || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load events');
        console.error('Error fetching events:', err);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [eventId]);

  // Filter customers based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => 
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.mobile_number.includes(searchQuery)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    
    if (!formData.event_id) {
      toast.error('Please select an event');
      return;
    }
    
    if (!formData.seats_or_reminder || isNaN(Number(formData.seats_or_reminder)) || Number(formData.seats_or_reminder) <= 0) {
      toast.error('Please enter a valid number of seats');
      return;
    }

    // Convert seats_or_reminder to a number for submission
    const submissionData = {
      ...formData,
      seats_or_reminder: Number(formData.seats_or_reminder)
    };

    await onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <FormGroup label="Customer" htmlFor="customer_id" error={!formData.customer_id ? 'Please select a customer' : undefined}>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          
          {isLoadingCustomers ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <select
              id="customer_id"
              name="customer_id"
              value={formData.customer_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isSubmitting}
            >
              <option value="">-- Select a customer --</option>
              {filteredCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name} ({customer.mobile_number})
                </option>
              ))}
            </select>
          )}
        </div>
      </FormGroup>

      {!eventId && (
        <FormGroup label="Event" htmlFor="event_id" error={!formData.event_id ? 'Please select an event' : undefined}>
          {isLoadingEvents ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <select
              id="event_id"
              name="event_id"
              value={formData.event_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={isSubmitting}
            >
              <option value="">-- Select an event --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} ({new Date(event.start_time).toLocaleDateString()})
                </option>
              ))}
            </select>
          )}
        </FormGroup>
      )}

      <FormGroup label="Number of Seats" htmlFor="seats_or_reminder" error={!formData.seats_or_reminder || isNaN(Number(formData.seats_or_reminder)) || Number(formData.seats_or_reminder) <= 0 ? 'Please enter a valid number of seats' : undefined}>
        <Input
          type="number"
          id="seats_or_reminder"
          name="seats_or_reminder"
          value={formData.seats_or_reminder}
          onChange={handleInputChange}
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
          disabled={isSubmitting}
        />
        <p className="mt-1 text-sm text-gray-500">Enter the number of seats needed for this booking</p>
      </FormGroup>

      <FormGroup label="Notification" htmlFor="send_notification">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="send_notification"
            name="send_notification"
            checked={formData.send_notification}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="send_notification" className="ml-2 block text-sm text-gray-700">
            Send SMS notification to customer
          </label>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          When checked, the customer will receive an SMS confirmation of their booking
        </p>
      </FormGroup>

      <FormGroup label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter any additional notes"
          disabled={isSubmitting}
        />
      </FormGroup>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
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
            booking ? 'Update Booking' : 'Create Booking'
          )}
        </Button>
      </div>
    </form>
  );
} 