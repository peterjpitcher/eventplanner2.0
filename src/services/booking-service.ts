import { supabase } from '@/lib/supabase';
import { Customer } from '@/types';
import { Event, eventService } from './event-service';
import { smsService } from './sms-service';
import { customerService } from './customer-service';
import { format } from 'date-fns';
import { ApiResponse } from '@/types';
import { checkAndEnsureSmsConfig } from '@/lib/sms-utils';
import { sendSMS } from '@/lib/sms-utils';
import { createLogger } from '@/lib/logger';

const logger = createLogger('booking-service');

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

export interface BookingWithCustomerAndEvent extends Booking {
  customer: Customer;
  event: Event;
}

// Response type for booking operations
export interface BookingResponse {
  data?: Booking;
  error?: any;
  smsSent?: boolean;
}

export interface SMSResult {
  success: boolean;
  error?: string;
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
      logger.error('Error fetching bookings:', error);
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
      logger.error(`Error fetching bookings for event ${eventId}:`, error);
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
      logger.error(`Error fetching bookings for customer ${customerId}:`, error);
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
      logger.error(`Error fetching booking with ID ${id}:`, error);
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
   * Send a booking confirmation SMS
   */
  async sendConfirmationSMS(booking: Booking, customer: Customer, event: Event): Promise<SMSResult> {
    try {
      // Check if customer has a mobile number
      if (!customer.mobile_number) {
        return { success: false, error: 'Customer has no mobile number' };
      }

      // Format the date for the message
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });

      // Create the message
      const message = `Hi ${customer.first_name}, your booking for ${event.title} on ${formattedDate} has been confirmed. You have reserved ${booking.seats_or_reminder} seat(s).`;

      // Send the SMS via the SMS service
      return await smsService.sendSMS({
        to: customer.mobile_number,
        message,
        booking_id: booking.id,
        message_type: 'booking_confirmation'
      });
    } catch (error: any) {
      logger.error('Error sending confirmation SMS:', error);
      return { success: false, error: error.message || 'Failed to send SMS' };
    }
  },

  /**
   * Create a new booking
   */
  async createBooking(booking: BookingFormData): Promise<ApiResponse<Booking> & { smsSent?: boolean }> {
    try {
      logger.info('Creating booking with data:', booking);
      
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
      
      if (!booking.seats_or_reminder) {
        return { 
          data: null, 
          error: new Error('Seats/Reminder value is required'), 
          smsSent: false 
        };
      }
      
      // Determine if we should send SMS notification (default to true if undefined)
      const send_notification = booking.send_notification !== false;
      
      // Create the booking in the database
      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert({
          customer_id: booking.customer_id,
          event_id: booking.event_id,
          seats_or_reminder: booking.seats_or_reminder.toString(),
          notes: booking.notes || null,
          send_notification
        })
        .select()
        .single();
      
      if (error) throw error;
      
      logger.info('Booking created successfully:', newBooking);
      
      // Default SMS sending status
      let smsSent = false;
      
      // Check if SMS is enabled and notification is requested
      if (send_notification) {
        try {
          logger.info('Checking SMS configuration...');
          const smsConfig = await checkAndEnsureSmsConfig();
          
          if (smsConfig.smsEnabled) {
            logger.info('SMS is enabled, proceeding with notification');
            
            // Fetch customer and event details for the SMS
            const [customerResult, eventResult] = await Promise.all([
              customerService.getCustomerById(booking.customer_id),
              eventService.getEventById(booking.event_id)
            ]);
            
            if (customerResult.data && eventResult.data) {
              // Check if customer has a mobile number
              if (customerResult.data.mobile_number) {
                logger.info(`Customer has mobile number: ${customerResult.data.mobile_number}`);
                
                // Send the confirmation SMS
                const smsResult = await this.sendConfirmationSMS(
                  newBooking as Booking,
                  customerResult.data,
                  eventResult.data
                );
                
                smsSent = smsResult.success;
                logger.info(`SMS sending ${smsSent ? 'successful' : 'failed'}`);
              } else {
                logger.info('Customer does not have a mobile number, skipping SMS');
              }
            } else {
              logger.info('Failed to fetch customer or event details, skipping SMS');
            }
          } else {
            logger.info(`SMS is disabled: ${smsConfig.message}`);
          }
        } catch (smsError) {
          logger.error('Error sending SMS notification:', smsError);
          // We don't want the booking creation to fail if SMS fails
        }
      } else {
        logger.info('SMS notification not requested, skipping');
      }
      
      return {
        data: newBooking as Booking,
        error: null,
        smsSent
      };
    } catch (error) {
      logger.error('Error creating booking:', error);
      return { 
        data: null, 
        error: error as Error,
        smsSent: false 
      };
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
      
      logger.info(`Updating booking ${id} with data:`, updateData);

      // Perform the database update
      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        logger.error(`Database error updating booking ${id}:`, error);
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
              logger.error('Error sending booking update SMS:', smsResult.error);
            }
          }
        } catch (smsError) {
          logger.error('Error processing SMS for booking update:', smsError);
          // Continue with booking update even if SMS fails
        }
      }
      
      return { data: updatedBooking, error: null, smsSent };
    } catch (error) {
      logger.error(`Error updating booking ${id}:`, error);
      return { data: null, error: error as Error, smsSent: false };
    }
  },

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<ApiResponse<null>> {
    try {
      logger.info(`Attempting to delete booking with ID: ${id}`);
      
      // First check if the booking exists
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          logger.error(`Booking with ID ${id} not found for deletion`);
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
        logger.error(`Error during booking deletion for ID ${id}:`, deleteError);
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
        logger.warn(`Could not archive SMS messages for booking ${id}:`, smsError);
      }
      
      logger.info(`Successfully deleted booking with ID: ${id}`);
      return { data: null, error: null };
    } catch (error) {
      logger.error(`Error deleting booking with ID ${id}:`, error);
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