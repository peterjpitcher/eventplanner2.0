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
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customer_id (*),
        event:event_id (*)
      `)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  /**
   * Get bookings for a specific event
   */
  async getBookingsByEvent(eventId: string): Promise<{ data: Booking[] | null; error: any }> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customer_id (*)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  /**
   * Get bookings for a specific customer
   */
  async getBookingsByCustomer(customerId: string): Promise<{ data: Booking[] | null; error: any }> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        event:event_id (*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<{ data: Booking | null; error: any }> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customer_id (*),
        event:event_id (*)
      `)
      .eq('id', id)
      .single();
    
    return { data, error };
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
        .select(`
          *,
          customer:customer_id (*),
          event:event_id (*)
        `)
        .single();
      
      if (error) {
        return { data: null, error, smsSent: false };
      }

      // Initialize SMS sent flag
      let smsSent = false;

      // If SMS is enabled, send a booking confirmation
      if (process.env.SMS_ENABLED === 'true' && data) {
        try {
          // Verify we have all the data needed for the SMS
          const customer = data.customer || 
            (await customerService.getCustomerById(data.customer_id)).data;
          
          const event = data.event || 
            (await eventService.getEventById(data.event_id)).data;
          
          if (customer && event) {
            // Send SMS and wait for the result
            const smsResult = await this.sendConfirmationSMS(data, customer, event);
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

      return { data, error: null, smsSent };
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
      .select(`
        *,
        customer:customer_id (*),
        event:event_id (*)
      `)
      .single();
    
    return { data, error };
  },

  /**
   * Delete a booking
   */
  async deleteBooking(id: string, sendSMS: boolean = false): Promise<{ error: any; smsSent?: boolean }> {
    try {
      // First, get the booking details if we need to send an SMS
      let bookingDetails = null;
      let smsSent = false;
      
      if (sendSMS) {
        const { data, error: fetchError } = await this.getBookingById(id);
        if (fetchError) {
          console.error('Error fetching booking for SMS notification:', fetchError);
          return { error: fetchError };
        }
        bookingDetails = data;
      }
      
      // Delete the booking
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      
      if (error) {
        return { error };
      }
      
      // Send SMS notification if requested and booking details were found
      if (sendSMS && bookingDetails && bookingDetails.customer && bookingDetails.event) {
        try {
          const { customer, event } = bookingDetails;
          const { formattedDate, formattedTime } = this.formatSMSDateTime(event.start_time);
          
          const smsResult = await smsService.sendBookingCancellation({
            customerId: customer.id,
            bookingId: id,
            eventName: event.title,
            eventDate: formattedDate,
            eventTime: formattedTime,
            customerName: customer.first_name
          });
          
          smsSent = smsResult.success;
          if (!smsResult.success) {
            console.error('Error sending booking cancellation SMS:', smsResult.error);
          }
        } catch (smsError) {
          console.error('Error processing SMS for booking cancellation:', smsError);
          // Continue with booking deletion even if SMS fails
        }
      }
      
      return { error: null, smsSent };
    } catch (err) {
      console.error('Unexpected error deleting booking:', err);
      return { error: err };
    }
  }
};

export default bookingService; 