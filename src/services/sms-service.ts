import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import { sendSMS, processTemplate, checkAndEnsureSmsConfig } from '@/lib/sms-utils';
import { Customer } from '@/types';
import { Booking } from './booking-service';
import { Event } from './event-service';

// Add diagnostic logging when this file is imported
console.log('SMS Service module loading');
console.log('Supabase client available:', !!supabase);

const logger = createLogger('sms-service');

// Verify Supabase connection on module load
(async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('sms_messages').select('count(*)', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection test successful, count:', data);
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }
})();

export type SMSMessageType = 
  | 'booking_confirmation' 
  | 'booking_cancellation' 
  | 'event_reminder' 
  | 'custom'
  | 'test';

export type SMSStatus = 
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'undelivered'
  | 'simulated';

export interface SMSMessage {
  id: string;
  booking_id: string;
  message_type: string;
  message: string;
  status: SMSStatus;
  sent_at: string;
  recipient?: string;
}

export interface SMSReply {
  id: string;
  customer_id: string;
  from_number: string;
  message_content: string;
  received_at: string;
  read: boolean;
  customer?: {
    first_name: string;
    last_name: string;
  };
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
            message: messageContent,
            recipient: phoneNumber,
            sent_at: new Date().toISOString(),
            status: result.success ? 'sent' : 'failed',
            message_sid: result.message?.sid || null,
            message_direction: 'outbound'
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
        .eq('message_direction', 'inbound')
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
      console.log('DEBUG: smsService.sendSMS called with:', JSON.stringify(request, null, 2));
      
      // Check if SMS sending is enabled in environment
      const SMS_ENABLED = process.env.NEXT_PUBLIC_SMS_ENABLED === 'true';
      console.log('DEBUG: NEXT_PUBLIC_SMS_ENABLED =', process.env.NEXT_PUBLIC_SMS_ENABLED);
      console.log('DEBUG: SMS_ENABLED =', SMS_ENABLED);
      
      if (!SMS_ENABLED) {
        logger.info('SMS sending is disabled in the environment');
        console.log('DEBUG: SMS sending is disabled in the environment');
        return { success: false, error: 'SMS sending is disabled' };
      }
      
      // Validate the request
      if (!request.to || !request.message || !request.booking_id) {
        const missingFields = [];
        if (!request.to) missingFields.push('to');
        if (!request.message) missingFields.push('message');
        if (!request.booking_id) missingFields.push('booking_id');
        
        const errorMessage = `Invalid SMS request. Missing fields: ${missingFields.join(', ')}`;
        logger.error(errorMessage, { request });
        console.log('DEBUG: ' + errorMessage, request);
        return { success: false, error: errorMessage };
      }
      
      // Format the phone number
      const formattedNumber = this.formatPhoneNumber(request.to);
      console.log('DEBUG: Formatted phone number:', formattedNumber);
      
      if (!formattedNumber) {
        const errorMessage = `Invalid phone number format: ${request.to}`;
        console.log('DEBUG: ' + errorMessage);
        return { success: false, error: errorMessage };
      }
      
      // In a real application, here you would call your SMS provider API
      // For now, we'll simulate the SMS sending
      logger.info(`[SIMULATED] Sending SMS to ${formattedNumber}`);
      logger.debug(`SMS Message: ${request.message}`);
      console.log(`DEBUG: [SIMULATED] Sending SMS to ${formattedNumber}`);
      console.log(`DEBUG: SMS Message: ${request.message}`);
      
      const now = new Date().toISOString();
      console.log('DEBUG: Current timestamp:', now);
      
      // Create insert data object
      const insertData = {
        booking_id: request.booking_id,
        message_type: request.message_type,
        message: request.message,
        recipient: formattedNumber,
        status: 'sent', // In a real app, this would be 'pending' until confirmed by the SMS provider
        sent_at: now,
        message_direction: 'outbound'
      };
      
      console.log('DEBUG: Inserting SMS record with data:', JSON.stringify(insertData, null, 2));
      console.log('DEBUG: Supabase client available:', !!supabase);
      
      // Log the SMS to the database
      try {
        // Make sure Supabase is available
        if (!supabase) {
          throw new Error('Supabase client is not available');
        }

        // Check if table exists
        console.log('DEBUG: Verifying sms_messages table...');
        const { data: tableInfo, error: tableError } = await supabase
          .from('sms_messages')
          .select('id', { count: 'exact', head: true })
          .limit(1);
          
        if (tableError) {
          console.error('DEBUG: Error checking sms_messages table:', tableError);
          throw new Error(`Table check failed: ${tableError.message}`);
        }
        
        console.log('DEBUG: SMS messages table exists, proceeding with insert');

        // FIXED: Removed duplicate insert operation - only use one insert with select
        console.log('DEBUG: Beginning insert operation');
        
        // Insert with detailed error handling and return the inserted record
        const { data: smsLog, error: logError } = await supabase
          .from('sms_messages')
          .insert(insertData)
          .select()
          .single();
        
        if (logError) {
          const errorMessage = `Error logging SMS to database: ${logError.message}`;
          logger.error(errorMessage, logError);
          console.error('DEBUG: ' + errorMessage, logError);
          
          if (logError.details) {
            console.error('DEBUG: Error details:', logError.details);
          }
          
          if (logError.hint) {
            console.error('DEBUG: Error hint:', logError.hint);
          }
          
          if (logError.code) {
            console.error('DEBUG: Error code:', logError.code);
          }
          
          return { success: false, error: errorMessage };
        }
        
        if (!smsLog) {
          const errorMessage = 'No SMS log record was returned after insert';
          logger.error(errorMessage);
          console.error('DEBUG: ' + errorMessage);
          return { success: false, error: errorMessage };
        }
        
        logger.info(`SMS sent successfully and logged with ID: ${smsLog.id}`);
        console.log(`DEBUG: SMS sent successfully and logged with ID: ${smsLog.id}`);
        
        return { 
          success: true, 
          message_id: smsLog.id 
        };
      } catch (dbError) {
        // Catch any unexpected errors
        const errorMessage = `Unexpected error when logging SMS: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`;
        logger.error(errorMessage, dbError);
        console.error('DEBUG: ' + errorMessage, dbError);
        
        if (dbError instanceof Error) {
          console.error('DEBUG: Error name:', dbError.name);
          console.error('DEBUG: Error message:', dbError.message);
          if (dbError.stack) {
            console.error('DEBUG: Error stack:', dbError.stack);
          }
          if ((dbError as any).code) {
            console.error('DEBUG: Error code:', (dbError as any).code);
          }
          if ((dbError as any).details) {
            console.error('DEBUG: Error details:', (dbError as any).details);
          }
        }
        
        // Return success anyway since we might have sent the SMS but just failed to log it
        return { 
          success: true, 
          error: 'SMS possibly sent but failed to log to database'
        };
      }
    } catch (error: any) {
      const errorMessage = `Error sending SMS: ${error.message || 'Unknown error'}`;
      logger.error(errorMessage, error);
      console.error('DEBUG: ' + errorMessage, error);
      
      if (error.stack) {
        console.error('DEBUG: Error stack:', error.stack);
      }
      if (error.code) {
        console.error('DEBUG: Error code:', error.code);
      }
      if (error.details) {
        console.error('DEBUG: Error details:', error.details);
      }
      
      return { 
        success: false, 
        error: errorMessage
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
  },
  
  /**
   * Process an incoming SMS reply
   * @param params Object containing the sender's number and message content
   * @returns Result of the operation
   */
  async receiveReply(params: { fromNumber: string; messageContent: string }): Promise<{
    success: boolean;
    error?: any;
  }> {
    try {
      logger.info(`Received SMS reply from ${params.fromNumber}`);
      
      // Look up the customer by their mobile number
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .eq('mobile_number', params.fromNumber);
      
      if (customerError) {
        logger.error('Error looking up customer:', customerError);
        return { success: false, error: customerError };
      }
      
      // Store the reply in the database
      const { data, error } = await supabase
        .from('sms_messages')
        .insert({
          customer_id: customers && customers.length > 0 ? customers[0].id : null,
          phone_number: params.fromNumber,
          content: params.messageContent,
          message_type: 'reply',
          status: 'received',
          message_direction: 'inbound',
          is_read: false,
          sent_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error storing SMS reply:', error);
        return { success: false, error };
      }
      
      logger.info(`Successfully stored SMS reply with ID: ${data.id}`);
      return { success: true };
    } catch (error) {
      logger.error('Error processing SMS reply:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Get all SMS replies for display in the messages table
   * @returns List of SMS replies
   */
  async getReplies(): Promise<{ data: SMSReply[]; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('sms_messages')
        .select(`
          id,
          customer_id,
          phone_number as from_number,
          content as message_content,
          sent_at as received_at,
          is_read as read,
          customers:customer_id (
            first_name,
            last_name
          )
        `)
        .eq('message_direction', 'inbound')
        .order('sent_at', { ascending: false });
      
      if (error) {
        logger.error('Error fetching SMS replies:', error);
        return { data: [], error };
      }
      
      // Use a more explicit type assertion with unknown as intermediate step
      return { data: (data as unknown) as SMSReply[] };
    } catch (error) {
      logger.error('Error fetching SMS replies:', error);
      return { data: [], error };
    }
  },
  
  /**
   * Get SMS replies for a specific customer
   * @param customerId The customer ID to get replies for
   * @returns List of SMS replies from the customer
   */
  async getRepliesByCustomer(customerId: string): Promise<{ data: SMSReply[]; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('sms_messages')
        .select(`
          id,
          customer_id,
          phone_number as from_number,
          content as message_content,
          sent_at as received_at,
          is_read as read,
          customers:customer_id (
            first_name,
            last_name
          )
        `)
        .eq('message_direction', 'inbound')
        .eq('customer_id', customerId)
        .order('sent_at', { ascending: false });
      
      if (error) {
        logger.error(`Error fetching SMS replies for customer ${customerId}:`, error);
        return { data: [], error };
      }
      
      // Use a more explicit type assertion with unknown as intermediate step
      return { data: (data as unknown) as SMSReply[] };
    } catch (error) {
      logger.error(`Error fetching SMS replies for customer ${customerId}:`, error);
      return { data: [], error };
    }
  },
  
  /**
   * Mark a specific SMS reply as read
   * @param id Reply ID to mark as read
   * @returns Success status
   */
  async markReplyAsRead(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('sms_messages')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) {
        logger.error(`Error marking SMS reply ${id} as read:`, error);
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      logger.error(`Error marking SMS reply ${id} as read:`, error);
      return { success: false, error };
    }
  },
  
  /**
   * Mark all SMS replies as read
   */
  async markAllRepliesAsRead(): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('sms_messages')
        .update({ is_read: true })
        .eq('message_direction', 'inbound')
        .eq('is_read', false);
      
      if (error) {
        logger.error('Error marking all SMS replies as read:', error);
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Error in markAllRepliesAsRead:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Send an SMS to a specific customer
   * @param params Object containing customer, message content, and other details
   * @returns Result of the SMS sending operation
   */
  async sendSMSToCustomer(params: {
    customer: { id: string; mobile_number?: string };
    messageType: string;
    messageContent: string;
    bookingId?: string | null;
  }): Promise<{
    success: boolean;
    error?: any;
  }> {
    try {
      const { customer, messageType, messageContent, bookingId } = params;
      console.log('DEBUG: sendSMSToCustomer called with params:', JSON.stringify({
        customerId: customer.id,
        hasMobileNumber: !!customer.mobile_number,
        messageType,
        bookingId
      }, null, 2));
      
      // Check if customer has a mobile number
      if (!customer.mobile_number) {
        const errorMessage = 'Customer has no mobile number';
        console.log('DEBUG: ' + errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
      
      // Format the mobile number
      const formattedNumber = this.formatPhoneNumber(customer.mobile_number);
      console.log(`DEBUG: Formatted mobile number: ${formattedNumber} (from ${customer.mobile_number})`);
      
      if (!formattedNumber) {
        const errorMessage = `Invalid phone number format: ${customer.mobile_number}`;
        console.log('DEBUG: ' + errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
      
      console.log('DEBUG: About to send SMS with message content:', messageContent);
      
      // Send the SMS
      const smsResult = await this.sendSMS({
        to: formattedNumber,
        message: messageContent,
        booking_id: bookingId || customer.id, // Use booking ID or customer ID as a fallback
        message_type: messageType
      });
      
      console.log('DEBUG: sendSMS result:', JSON.stringify(smsResult, null, 2));
      
      return smsResult;
    } catch (error) {
      const errorMessage = `Error sending SMS to customer: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(errorMessage, error);
      console.error('DEBUG: ' + errorMessage);
      
      if (error instanceof Error && error.stack) {
        console.error('DEBUG: Error stack:', error.stack);
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },
  
  async processIncomingMessage(from: string, body: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Look up customer by phone number
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .eq('mobile_number', from)
        .maybeSingle();
      
      if (customerError) throw customerError;
      
      // Log the incoming message, linking to customer if found
      const { data: logData, error: logError } = await supabase
        .from('sms_messages')
        .insert({
          customer_id: customerData?.id || null,
          message: body,
          recipient: from, // Store sender's number in recipient field
          status: 'received',
          message_direction: 'inbound',
          is_read: false,
          sent_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (logError) throw logError;
      
      return { success: true };
    } catch (error) {
      console.error('Error processing incoming message:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Get all SMS replies
   */
  async getSMSReplies(): Promise<{ data: SMSReply[], error?: any }> {
    try {
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('message_direction', 'inbound')
        .order('sent_at', { ascending: false });
      
      if (error) {
        logger.error('Error fetching SMS replies:', error);
        return { data: [], error };
      }
      
      // Map to expected format
      const replies = data.map(item => ({
        id: item.id,
        customer_id: item.customer_id,
        from_number: item.recipient,
        message_content: item.message,
        received_at: item.sent_at,
        read: item.is_read,
        // We'll fetch customer details separately if needed
        customer: undefined
      }));
      
      return { data: replies };
    } catch (error) {
      logger.error('Error processing SMS replies data:', error);
      return { data: [], error };
    }
  },
  
  /**
   * Get SMS replies for a specific customer
   */
  async getCustomerReplies(customerId: string): Promise<{ data: SMSReply[], error?: any }> {
    try {
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('message_direction', 'inbound')
        .eq('customer_id', customerId)
        .order('sent_at', { ascending: false });
      
      if (error) {
        logger.error(`Error fetching SMS replies for customer ${customerId}:`, error);
        return { data: [], error };
      }
      
      // Map to expected format
      const replies = data.map(item => ({
        id: item.id,
        customer_id: item.customer_id,
        from_number: item.recipient,
        message_content: item.message,
        received_at: item.sent_at,
        read: item.is_read
      }));
      
      return { data: replies };
    } catch (error) {
      logger.error('Error processing customer SMS replies data:', error);
      return { data: [], error };
    }
  }
}; 

export default smsService; 