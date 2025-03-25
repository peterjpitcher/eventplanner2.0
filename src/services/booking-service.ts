import { supabase } from '@/lib/supabase';
import { Customer } from '@/types';
import { Event } from './event-service';
import { smsService } from './sms-service';
import { customerService } from './customer-service';
import { eventService } from './event-service';

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
   * Create a new booking
   */
  async createBooking(booking: BookingFormData): Promise<{ data: Booking | null; error: any }> {
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
        return { data: null, error };
      }

      // If SMS is enabled, send a booking confirmation
      if (process.env.SMS_ENABLED === 'true' && data) {
        try {
          // Verify we have all the data needed for the SMS
          const customer = data.customer || 
            (await customerService.getCustomerById(data.customer_id)).data;
          
          const event = data.event || 
            (await eventService.getEventById(data.event_id)).data;
          
          if (customer && event) {
            // Send SMS in the background - don't wait for it to complete
            smsService.sendBookingConfirmation(data, customer, event)
              .then((smsResult) => {
                if (!smsResult.success) {
                  console.error('Error sending booking confirmation SMS:', smsResult.error);
                }
              })
              .catch((err) => {
                console.error('Unexpected error sending booking confirmation SMS:', err);
              });
          }
        } catch (smsError) {
          console.error('Error processing SMS for booking:', smsError);
          // Continue with booking creation even if SMS fails
        }
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error creating booking:', err);
      return { data: null, error: err };
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
  async deleteBooking(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    return { error };
  }
};

export default bookingService; 