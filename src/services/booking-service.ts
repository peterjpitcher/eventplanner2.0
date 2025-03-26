import { supabase } from '@/lib/supabase';
import { Customer } from '@/types';
import { Event } from './event-service';
import { smsService } from './sms-service';
import { customerService } from './customer-service';
import { eventService } from './event-service';
import { format } from 'date-fns';
import { ApiResponse } from '@/types';

export interface Booking {
  id: string;
  customer_id: string;
  event_id: string;
  seats_or_reminder: string;
  notes: string | null;
  created_at: string;
  send_notification?: boolean;
  // Join data
  customer?: Customer;
  event?: Event;
}

export interface BookingFormData {
  customer_id: string;
  event_id: string;
  seats_or_reminder: string | number;
  send_notification?: boolean;
  notes?: string | null;
}

export const bookingService = {
  /**
   * Get all bookings with customer and event information
   */
  async getBookings(): Promise<ApiResponse<Booking[]>> {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch related data separately
      const bookingsWithRelations = await Promise.all(
        bookings.map(async (booking) => {
          const [customerResult, eventResult] = await Promise.all([
            customerService.getCustomerById(booking.customer_id),
            eventService.getEventById(booking.event_id)
          ]);

          return {
            ...booking,
            customer: customerResult.data,
            event: eventResult.data
          };
        })
      );

      return { data: bookingsWithRelations, error: null };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get bookings for a specific event
   */
  async getBookingsByEvent(eventId: string): Promise<ApiResponse<Booking[]>> {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch customer data separately
      const bookingsWithCustomers = await Promise.all(
        bookings.map(async (booking) => {
          const customerResult = await customerService.getCustomerById(booking.customer_id);
          return {
            ...booking,
            customer: customerResult.data
          };
        })
      );

      return { data: bookingsWithCustomers, error: null };
    } catch (error) {
      console.error(`Error fetching bookings for event ${eventId}:`, error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get bookings for a specific customer
   */
  async getBookingsByCustomer(customerId: string): Promise<ApiResponse<Booking[]>> {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch event data separately
      const bookingsWithEvents = await Promise.all(
        bookings.map(async (booking) => {
          const eventResult = await eventService.getEventById(booking.event_id);
          return {
            ...booking,
            event: eventResult.data
          };
        })
      );

      return { data: bookingsWithEvents, error: null };
    } catch (error) {
      console.error(`Error fetching bookings for customer ${customerId}:`, error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;

      // Fetch related data separately
      const [customerResult, eventResult] = await Promise.all([
        customerService.getCustomerById(booking.customer_id),
        eventService.getEventById(booking.event_id)
      ]);

      return {
        data: {
          ...booking,
          customer: customerResult.data,
          event: eventResult.data
        },
        error: null
      };
    } catch (error) {
      console.error(`Error fetching booking with ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Format a date object for SMS messages
   */
  formatSMSDateTime(startTime: string) {
    const eventDate = new Date(startTime);
    return {
      formattedDate: format(eventDate, 'dd/MM/yyyy'),
      formattedTime: format(eventDate, 'HH:mm')
    };
  },

  /**
   * Send booking confirmation SMS
   */
  async sendConfirmationSMS(booking: Booking, customer: Customer, event: Event): Promise<{ success: boolean; error?: any }> {
    try {
      const { formattedDate, formattedTime } = this.formatSMSDateTime(event.start_time);
      
      const smsResult = await smsService.sendBookingConfirmation({
        customerId: customer.id,
        bookingId: booking.id,
        eventName: event.title,
        eventDate: formattedDate,
        eventTime: formattedTime,
        seats: booking.seats_or_reminder,
        customerName: customer.first_name
      });
      
      return { success: smsResult.success, error: smsResult.error };
    } catch (error) {
      console.error('Error sending booking confirmation SMS:', error);
      return { success: false, error };
    }
  },

  /**
   * Create a new booking
   */
  async createBooking(booking: BookingFormData): Promise<ApiResponse<Booking> & { smsSent?: boolean }> {
    try {
      console.log('Creating booking with data:', booking);
      
      // Validate booking data
      if (!booking.customer_id) {
        return { 
          data: null, 
          error: new Error('Customer ID is required'), 
          smsSent: false 
        };
      }
      
      if (!booking.event_id) {
        return { 
          data: null, 
          error: new Error('Event ID is required'), 
          smsSent: false 
        };
      }
      
      // Validate seats - ensure it's a valid number
      if (!booking.seats_or_reminder) {
        return { 
          data: null, 
          error: new Error('Number of seats is required'), 
          smsSent: false 
        };
      }
      
      // Process seating value
      let seatsValue = booking.seats_or_reminder;
      if (typeof seatsValue === 'string') {
        const parsedValue = parseInt(seatsValue, 10);
        if (isNaN(parsedValue)) {
          return { 
            data: null, 
            error: new Error('Invalid number of seats'), 
            smsSent: false 
          };
        }
        seatsValue = parsedValue;
      }
      
      // Store whether to send SMS, then remove from database object
      const shouldSendNotification = booking.send_notification !== false;
      
      // Create database object without send_notification field
      const { send_notification, ...bookingData } = booking;
      
      console.log('Sanitized booking data for database:', bookingData);

      // Insert into database
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select('*')
        .single();
      
      if (error) {
        console.error('Database error creating booking:', error);
        throw error;
      }

      // Fetch related data
      const [customerResult, eventResult] = await Promise.all([
        customerService.getCustomerById(data.customer_id),
        eventService.getEventById(data.event_id)
      ]);

      const bookingWithRelations = {
        ...data,
        customer: customerResult.data,
        event: eventResult.data
      };

      // Initialize SMS sent flag
      let smsSent = false;

      // If SMS is enabled and we should send notification, send a booking confirmation
      if (process.env.SMS_ENABLED === 'true' && shouldSendNotification && bookingWithRelations) {
        try {
          if (bookingWithRelations.customer && bookingWithRelations.event) {
            // Send SMS and wait for the result
            const smsResult = await this.sendConfirmationSMS(
              bookingWithRelations,
              bookingWithRelations.customer,
              bookingWithRelations.event
            );
            smsSent = smsResult.success;
            
            if (!smsResult.success) {
              console.error('Error sending booking confirmation SMS:', smsResult.error);
            }
          }
        } catch (smsError) {
          console.error('Error processing SMS for booking:', smsError);
          // Continue with booking creation even if SMS fails
        }
      }

      return { data: bookingWithRelations, error: null, smsSent };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { data: null, error: error as Error, smsSent: false };
    }
  },

  /**
   * Update an existing booking
   */
  async updateBooking(id: string, bookingData: BookingFormData): Promise<ApiResponse<Booking> & { smsSent?: boolean }> {
    try {
      // Validate the booking data
      if (!bookingData.customer_id) {
        return { 
          data: null, 
          error: new Error('Customer ID is required'), 
          smsSent: false 
        };
      }
      
      if (!bookingData.event_id) {
        return { 
          data: null, 
          error: new Error('Event ID is required'), 
          smsSent: false 
        };
      }
      
      // Validate seats - ensure it's a valid number
      if (!bookingData.seats_or_reminder) {
        return { 
          data: null, 
          error: new Error('Number of seats is required'), 
          smsSent: false 
        };
      }
      
      // Process seating value
      let seatsValue = bookingData.seats_or_reminder;
      if (typeof seatsValue === 'string') {
        const parsedValue = parseInt(seatsValue, 10);
        if (isNaN(parsedValue)) {
          return { 
            data: null, 
            error: new Error('Invalid number of seats'), 
            smsSent: false 
          };
        }
        seatsValue = parsedValue;
      }
      
      // Make sure seats is a positive number
      if (seatsValue <= 0) {
        return { 
          data: null, 
          error: new Error('Number of seats must be greater than zero'), 
          smsSent: false 
        };
      }
      
      // Store whether to send SMS, then remove from database object
      const shouldSendNotification = bookingData.send_notification !== false;
      
      // Create database object without send_notification field
      const { send_notification, ...updateData } = bookingData;
      
      console.log(`Updating booking ${id} with data:`, updateData);

      // Perform the database update
      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error(`Database error updating booking ${id}:`, error);
        throw error;
      }
      
      // Fetch related data
      const [customerResult, eventResult] = await Promise.all([
        customerService.getCustomerById(data.customer_id),
        eventService.getEventById(data.event_id)
      ]);

      const updatedBooking = {
        ...data,
        customer: customerResult.data,
        event: eventResult.data
      };
      
      // Initialize SMS sent flag
      let smsSent = false;
      
      // If SMS is enabled and we should send notification, send a booking confirmation
      if (process.env.SMS_ENABLED === 'true' && shouldSendNotification && updatedBooking) {
        try {
          if (updatedBooking.customer && updatedBooking.event) {
            // Send SMS and wait for the result
            const smsResult = await this.sendConfirmationSMS(
              updatedBooking,
              updatedBooking.customer,
              updatedBooking.event
            );
            smsSent = smsResult.success;
            
            if (!smsResult.success) {
              console.error('Error sending booking update SMS:', smsResult.error);
            }
          }
        } catch (smsError) {
          console.error('Error processing SMS for booking update:', smsError);
          // Continue with booking update even if SMS fails
        }
      }
      
      return { data: updatedBooking, error: null, smsSent };
    } catch (error) {
      console.error(`Error updating booking ${id}:`, error);
      return { data: null, error: error as Error, smsSent: false };
    }
  },

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<ApiResponse<null>> {
    try {
      console.log(`Attempting to delete booking with ID: ${id}`);
      
      // First check if the booking exists
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.error(`Booking with ID ${id} not found for deletion`);
          return { 
            data: null, 
            error: new Error(`Booking with ID ${id} not found`) 
          };
        }
        throw checkError;
      }
      
      // Perform the actual deletion
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error(`Error during booking deletion for ID ${id}:`, deleteError);
        throw deleteError;
      }
      
      // Delete any related SMS messages (optional clean-up)
      try {
        await supabase
          .from('sms_messages')
          .update({ archived: true })
          .eq('booking_id', id);
      } catch (smsError) {
        // Non-critical error, just log it but continue
        console.warn(`Could not archive SMS messages for booking ${id}:`, smsError);
      }
      
      console.log(`Successfully deleted booking with ID: ${id}`);
      return { data: null, error: null };
    } catch (error) {
      console.error(`Error deleting booking with ID ${id}:`, error);
      return { 
        data: null, 
        error: error instanceof Error 
          ? error 
          : new Error(`Failed to delete booking: ${String(error)}`) 
      };
    }
  }
};

export default bookingService; 