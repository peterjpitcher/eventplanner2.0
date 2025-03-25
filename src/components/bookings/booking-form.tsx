'use client';

import { useState, useEffect } from 'react';
import { BookingFormData, Booking, bookingService } from '@/services/booking-service';
import { Customer } from '@/types';
import { customerService } from '@/services/customer-service';

interface BookingFormProps {
  booking?: Booking;
  eventId: string;
  onSubmit: (data: BookingFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function BookingForm({ booking, eventId, onSubmit, isSubmitting }: BookingFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [formData, setFormData] = useState<BookingFormData>({
    customer_id: booking?.customer_id || '',
    event_id: eventId,
    seats_or_reminder: booking?.seats_or_reminder || '1 seat',
    notes: booking?.notes || ''
  });

  // Fetch customers for selection
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      const { data, error } = await customerService.getCustomers();
      
      if (error) {
        console.error('Error fetching customers:', error);
      } else {
        setCustomers(data || []);
        setFilteredCustomers(data || []);
      }
      
      setIsLoadingCustomers(false);
    };

    fetchCustomers();
  }, []);

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
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="customer_search" className="block text-sm font-medium text-gray-700">
          Search Customer
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="customer_search"
            name="customer_search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or mobile number"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
          Select Customer
        </label>
        <div className="mt-1">
          <select
            id="customer_id"
            name="customer_id"
            value={formData.customer_id}
            onChange={handleInputChange}
            required
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">-- Select a customer --</option>
            {filteredCustomers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name} - {customer.mobile_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="seats_or_reminder" className="block text-sm font-medium text-gray-700">
          Seats or Reminder Preference
        </label>
        <div className="mt-1">
          <select
            id="seats_or_reminder"
            name="seats_or_reminder"
            value={formData.seats_or_reminder}
            onChange={handleInputChange}
            required
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="1 seat">1 seat</option>
            <option value="2 seats">2 seats</option>
            <option value="3 seats">3 seats</option>
            <option value="4 seats">4 seats</option>
            <option value="5+ seats">5+ seats</option>
            <option value="reminder only">Reminder Only (No Reservation)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes (Optional)
        </label>
        <div className="mt-1">
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            rows={3}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Any special requests or notes"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
        </button>
      </div>
    </form>
  );
} 