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
    seats_or_reminder: booking?.seats_or_reminder || '1 seat',
    notes: booking?.notes || ''
  });

  // Fetch customers for selection
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoadingCustomers(true);
        const { data, error } = await customerService.getCustomers();
        
        if (error) {
          toast.error('Failed to load customers');
          console.error('Error fetching customers:', error);
        } else {
          setCustomers(data || []);
          setFilteredCustomers(data || []);
        }
      } catch (err) {
        toast.error('An unexpected error occurred');
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
          toast.error('Failed to load events');
          console.error('Error fetching events:', error);
        } else {
          setEvents(data || []);
        }
      } catch (err) {
        toast.error('An unexpected error occurred');
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
    const { name, value } = e.target;
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
    
    if (!formData.seats_or_reminder) {
      toast.error('Please select seats or reminder preference');
      return;
    }

    await onSubmit(formData);
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

      <FormGroup label="Seats/Reminder" htmlFor="seats_or_reminder" error={!formData.seats_or_reminder ? 'Please select seats or reminder preference' : undefined}>
        <select
          id="seats_or_reminder"
          name="seats_or_reminder"
          value={formData.seats_or_reminder}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        >
          <option value="1 seat">1 seat</option>
          <option value="2 seats">2 seats</option>
          <option value="3 seats">3 seats</option>
          <option value="4 seats">4 seats</option>
          <option value="5+ seats">5+ seats</option>
          <option value="Reminder only">Reminder only</option>
        </select>
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