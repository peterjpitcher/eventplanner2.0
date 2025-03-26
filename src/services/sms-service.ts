import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { sendSMS, processTemplate, checkAndEnsureSmsConfig } from '@/lib/sms-utils';
import { Customer } from '@/types';
import { Booking } from './booking-service';
import { Event } from './event-service';

const logger = createLogger('sms-service');

export type SMSMessageType = 
  | 'booking_confirmation' 
  | 'booking_cancellation' 
  | 'event_reminder' 
  | 'custom'
  | 'test';

export interface SMSMessage {
  id: string;
  booking_id: string;
  message_type: string;
  message: string;
  status: string;
  sent_at: string;
  recipient?: string;
}

export interface SMSRequest {
  to: string;
  message: string;
  booking_id: string;
  message_type: string;
}

export interface SMSResult {
  success: boolean;
  error?: string;
  message_id?: string;
}

export const smsService = {
  /**
   * Send a test message to a phone number without requiring a booking or customer record
   */
  async sendTestMessage(phoneNumber: string, messageContent: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log(`Preparing to send test SMS to ${phoneNumber}`);
      
      // Check if SMS is enabled using our utility function
      const { smsEnabled, message: configMessage } = await checkAndEnsureSmsConfig();
      
      if (!smsEnabled) {
        console.log(`SMS is disabled: ${configMessage}. Test message not sent.`);
        return { 
          success: false, 
          error: `SMS is disabled: ${configMessage}`
        };
      }
      
      console.log(`SMS is enabled: ${configMessage}. Sending test message.`);
      
      // Send the actual SMS via Twilio
      const result = await sendSMS(phoneNumber, messageContent);
      
      if (result.success) {
        console.log('Test SMS sent successfully');
        
        // Log the test message to the database
        try {
          await supabase.from('sms_messages').insert({
            customer_id: null, // No customer for test messages
            booking_id: null, // No booking for test messages
            message_type: 'test',
            content: messageContent,
            phone_number: phoneNumber,
            sent_at: new Date().toISOString(),
            status: result.success ? 'sent' : 'failed',
            message_sid: result.message?.sid || null
          });
          console.log('Test message logged to database');
        } catch (logError) {
          console.error('Error logging test message to database:', logError);
          // Don't fail the overall operation just because logging failed
        }
      } else {
        console.error('Failed to send test SMS:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error sending test SMS:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Count unread SMS replies
   */
  async countUnreadReplies(): Promise<{ count: number }> {
    try {
      const { count, error } = await supabase
        .from('sms_messages')
        .select('*', { count: 'exact', head: true })
        .eq('direction', 'inbound')
        .eq('is_read', false);
      
      if (error) throw error;
      
      return { count: count || 0 };
    } catch (error) {
      console.error('Error counting unread replies:', error);
      return { count: 0 };
    }
  },

  /**
   * Send an SMS message
   * @param request SMS request containing recipient, message, booking ID, and message type
   * @returns Result of the SMS sending operation
   */
  async sendSMS(request: SMSRequest): Promise<SMSResult> {
    try {
      // Check if SMS sending is enabled in environment
      const SMS_ENABLED = process.env.NEXT_PUBLIC_SMS_ENABLED === 'true';
      
      if (!SMS_ENABLED) {
        logger.info('SMS sending is disabled in the environment');
        return { success: false, error: 'SMS sending is disabled' };
      }
      
      // Validate the request
      if (!request.to || !request.message || !request.booking_id) {
        logger.error('Invalid SMS request', { request });
        return { success: false, error: 'Invalid SMS request. Missing to, message, or booking_id' };
      }
      
      // Format the phone number
      const formattedNumber = this.formatPhoneNumber(request.to);
      if (!formattedNumber) {
        return { success: false, error: 'Invalid phone number format' };
      }
      
      // In a real application, here you would call your SMS provider API
      // For now, we'll simulate the SMS sending
      logger.info(`[SIMULATED] Sending SMS to ${formattedNumber}`);
      logger.debug(`SMS Message: ${request.message}`);
      
      // Log the SMS to the database
      const { data: smsLog, error: logError } = await supabase
        .from('sms_messages')
        .insert({
          booking_id: request.booking_id,
          message_type: request.message_type,
          message: request.message,
          recipient: formattedNumber,
          status: 'sent', // In a real app, this would be 'pending' until confirmed by the SMS provider
          sent_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (logError) {
        logger.error('Error logging SMS to database:', logError);
        return { success: false, error: 'Error logging SMS' };
      }
      
      logger.info(`SMS sent successfully and logged with ID: ${smsLog.id}`);
      return { 
        success: true, 
        message_id: smsLog.id 
      };
    } catch (error: any) {
      logger.error('Error sending SMS:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error sending SMS' 
      };
    }
  },
  
  /**
   * Format a phone number to E.164 format for SMS sending
   * @param phoneNumber The phone number to format
   * @returns Formatted phone number or null if invalid
   */
  formatPhoneNumber(phoneNumber: string): string | null {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if the number starts with a country code
    if (!cleaned.startsWith('44') && !cleaned.startsWith('1')) {
      // If it's a UK number without the country code, add it
      if (cleaned.startsWith('0')) {
        cleaned = `44${cleaned.substring(1)}`;
      } else {
        // Default to UK code
        cleaned = `44${cleaned}`;
      }
    }
    
    // Validate length (rough check)
    if (cleaned.length < 10 || cleaned.length > 15) {
      logger.warn(`Invalid phone number length: ${cleaned}`);
      return null;
    }
    
    return `+${cleaned}`;
  },
  
  /**
   * Get all SMS messages for a specific booking
   * @param bookingId The booking ID to get messages for
   * @returns Array of SMS messages
   */
  async getSMSMessagesByBookingId(bookingId: string): Promise<{ data: SMSMessage[], error?: any }> {
    try {
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('sent_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return { data: data as SMSMessage[] };
    } catch (error) {
      logger.error(`Error fetching SMS messages for booking ${bookingId}:`, error);
      return { data: [], error };
    }
  },
  
  /**
   * Get SMS statistics (count by status and type)
   * @returns SMS statistics
   */
  async getSMSStatistics(): Promise<{ data: any, error?: any }> {
    try {
      // Get count by status
      const { data: statusCountsRaw, error: statusError } = await supabase
        .rpc('get_sms_counts_by_status');
      
      if (statusError) {
        throw statusError;
      }
      
      // Get count by message type
      const { data: typeCountsRaw, error: typeError } = await supabase
        .rpc('get_sms_counts_by_type');
      
      if (typeError) {
        throw typeError;
      }
      
      // Get total count
      const { count, error: countError } = await supabase
        .from('sms_messages')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw countError;
      }
      
      // Get latest message
      const { data: latestData, error: latestError } = await supabase
        .from('sms_messages')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(1);
      
      if (latestError) {
        throw latestError;
      }
      
      return {
        data: {
          total: count,
          byStatus: statusCountsRaw || [],
          byType: typeCountsRaw || [],
          latest: latestData && latestData.length > 0 ? latestData[0] : null
        }
      };
    } catch (error) {
      logger.error('Error fetching SMS statistics:', error);
      return { data: null, error };
    }
  },
  
  /**
   * Send a confirmation SMS for a booking
   * @param bookingId The booking ID to send confirmation for
   * @returns Result of the SMS sending operation
   */
  async sendBookingConfirmation(bookingId: string): Promise<SMSResult> {
    try {
      // Find booking with customer and event details
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customers:customer_id (id, first_name, last_name, mobile),
          events:event_id (id, name, date, time)
        `)
        .eq('id', bookingId)
        .single();
      
      if (error || !booking) {
        return { success: false, error: error?.message || 'Booking not found' };
      }
      
      const customer = booking.customers;
      const event = booking.events;
      
      if (!customer.mobile) {
        return { success: false, error: 'Customer has no mobile number' };
      }
      
      // Format the date and time
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      
      // Create the message
      const message = `Hi ${customer.first_name}, your booking for ${event.name} on ${formattedDate} at ${event.time} has been confirmed. You have reserved ${booking.seats_or_reminder} seat(s).`;
      
      // Send the SMS
      return await this.sendSMS({
        to: customer.mobile,
        message,
        booking_id: bookingId,
        message_type: 'booking_confirmation'
      });
    } catch (error: any) {
      logger.error('Error sending booking confirmation SMS:', error);
      return { success: false, error: error.message || 'Failed to send confirmation SMS' };
    }
  }
}; 