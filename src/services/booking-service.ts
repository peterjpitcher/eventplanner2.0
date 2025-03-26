import { supabase } from '@/lib/supabase';
import { Customer } from '@/types';
import { Event } from './event-service';
import { smsService } from './sms-service';
import { customerService } from './customer-service';
import { eventService } from './event-service';
import { format } from 'date-fns';

export interface Booking {
  id: string;
  customer_id: string;
  event_id: string;
  seats_or_reminder: string;
  notes: string | null;
  created_at: string;
  // Join data
  customer?: Customer;
  event?: Event;
}

export interface BookingFormData {
  customer_id: string;
  event_id: string;
  seats_or_reminder: string;
  notes?: string | null;
}

export const bookingService = {
  /**
   * Get all bookings with customer and event information
   */
  async getBookings(): Promise<{ data: Booking[] | null; error: any }> {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: null, error };
    }

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
  },

  /**
   * Get bookings for a specific event
   */
  async getBookingsByEvent(eventId: string): Promise<{ data: Booking[] | null; error: any }> {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: null, error };
    }

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
  },

  /**
   * Get bookings for a specific customer
   */
  async getBookingsByCustomer(customerId: string): Promise<{ data: Booking[] | null; error: any }> {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: null, error };
    }

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
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<{ data: Booking | null; error: any }> {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return { data: null, error };
    }

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
  async createBooking(booking: BookingFormData): Promise<{ data: Booking | null; error: any; smsSent?: boolean }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select('*')
        .single();
      
      if (error) {
        return { data: null, error, smsSent: false };
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

      // If SMS is enabled, send a booking confirmation
      if (process.env.SMS_ENABLED === 'true' && bookingWithRelations) {
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
    } catch (err) {
      console.error('Unexpected error creating booking:', err);
      return { data: null, error: err, smsSent: false };
    }
  },

  /**
   * Update an existing booking
   */
  async updateBooking(id: string, booking: BookingFormData): Promise<{ data: Booking | null; error: any }> {
    const { data, error } = await supabase
      .from('bookings')
      .update(booking)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      return { data: null, error };
    }

    // Fetch related data
    const [customerResult, eventResult] = await Promise.all([
      customerService.getCustomerById(data.customer_id),
      eventService.getEventById(data.event_id)
    ]);

    return {
      data: {
        ...data,
        customer: customerResult.data,
        event: eventResult.data
      },
      error: null
    };
  },

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    return { error };
  }
};

export default bookingService; 