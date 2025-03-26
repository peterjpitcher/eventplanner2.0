import { supabase } from '@/lib/supabase';
import { sendSMS, processTemplate, checkAndEnsureSmsConfig } from '@/lib/sms-utils';
import { Customer } from '@/types';
import { Booking } from './booking-service';
import { Event } from './event-service';

export type SMSMessageType = 
  'booking_confirmation' | 
  'reminder_7day' | 
  'reminder_24hr' | 
  'booking_cancellation' | 
  'event_cancellation' | 
  'manual' |
  'test';

export type SMSStatus = 
  'queued' | 
  'sent' | 
  'delivered' | 
  'failed' | 
  'undelivered' |
  'simulated';

export interface SMSMessage {
  id: string;
  customer_id: string;
  booking_id: string | null;
  message_type: SMSMessageType;
  message_content: string;
  sent_at: string;
  status: SMSStatus;
  message_sid?: string;
  // Join data
  customer?: Customer;
  booking?: Booking;
}

export interface SMSReply {
  id: string;
  customer_id: string;
  from_number: string;
  message_content: string;
  received_at: string;
  read: boolean;
  // Join data
  customer?: Customer;
}

interface BookingReminderData {
  event_name: string;
  event_date: string;
  event_time: string;
  event_day_name: string;
  customer_name: string;
  seats: string;
  [key: string]: string;
}

export const smsService = {
  /**
   * Get all SMS messages
   */
  async getMessages(): Promise<{ data: SMSMessage[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sms_messages')
      .select(`
        *,
        customer:customer_id (*),
        booking:booking_id (*)
      `)
      .order('sent_at', { ascending: false });
    
    return { data, error };
  },

  /**
   * Get SMS messages for a specific customer
   */
  async getMessagesByCustomer(customerId: string): Promise<{ data: SMSMessage[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sms_messages')
      .select(`
        *,
        booking:booking_id (*)
      `)
      .eq('customer_id', customerId)
      .order('sent_at', { ascending: false });
    
    return { data, error };
  },

  /**
   * Get SMS messages for a specific booking
   */
  async getMessagesByBooking(bookingId: string): Promise<{ data: SMSMessage[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sms_messages')
      .select(`
        *,
        customer:customer_id (*)
      `)
      .eq('booking_id', bookingId)
      .order('sent_at', { ascending: false });
    
    return { data, error };
  },

  /**
   * Determine if a customer has been sent a specific reminder type for a booking
   */
  async hasReceivedReminder(bookingId: string, reminderType: string): Promise<boolean> {
    const { data } = await supabase
      .from('sms_messages')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('message_type', `reminder_${reminderType}`)
      .limit(1);
    
    return data !== null && data.length > 0;
  },

  /**
   * Count unread SMS replies
   */
  async countUnreadReplies(): Promise<{ count: number; error: any }> {
    const { count, error } = await supabase
      .from('sms_replies')
      .select('id', { count: 'exact', head: true })
      .eq('read', false);
    
    return { count: count || 0, error };
  },

  /**
   * Get all SMS replies
   */
  async getReplies(): Promise<{ data: SMSReply[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sms_replies')
      .select(`
        *,
        customer:customer_id (*)
      `)
      .order('received_at', { ascending: false });
    
    return { data, error };
  },

  /**
   * Get SMS replies for a specific customer
   */
  async getRepliesByCustomer(customerId: string): Promise<{ data: SMSReply[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sms_replies')
      .select('*')
      .eq('customer_id', customerId)
      .order('received_at', { ascending: false });
    
    return { data, error };
  },

  /**
   * Mark an SMS reply as read
   */
  async markReplyAsRead(replyId: string): Promise<{ success: boolean; error: any }> {
    const { error } = await supabase
      .from('sms_replies')
      .update({ read: true })
      .eq('id', replyId);
    
    return { success: !error, error };
  },

  /**
   * Mark all SMS replies as read
   */
  async markAllRepliesAsRead(): Promise<{ success: boolean; error: any }> {
    const { error } = await supabase
      .from('sms_replies')
      .update({ read: true })
      .eq('read', false);
    
    return { success: !error, error };
  },

  /**
   * Receive and process an SMS reply from a customer
   */
  async receiveReply({ fromNumber, messageContent }: { fromNumber: string; messageContent: string }): Promise<{ success: boolean; error?: any }> {
    try {
      // Find customer by mobile number
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .eq('mobile_number', fromNumber)
        .limit(1);
      
      if (customerError) {
        return { success: false, error: customerError };
      }
      
      if (!customers || customers.length === 0) {
        return { success: false, error: 'Customer not found for this mobile number' };
      }
      
      const customerId = customers[0].id;
      
      // Store the reply
      const { error: replyError } = await supabase
        .from('sms_replies')
        .insert({
          customer_id: customerId,
          from_number: fromNumber,
          message_content: messageContent,
          received_at: new Date().toISOString(),
          read: false
        });
      
      if (replyError) {
        return { success: false, error: replyError };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error processing SMS reply:', error);
      return { success: false, error };
    }
  },

  /**
   * Send an SMS to a customer and record it in the database
   */
  async sendSMSToCustomer({
    customer,
    messageType,
    messageContent,
    bookingId = null
  }: {
    customer: Customer;
    messageType: SMSMessageType;
    messageContent: string;
    bookingId?: string | null;
  }): Promise<{ success: boolean; messageSid?: string; error?: any }> {
    try {
      // Send the SMS
      const response = await sendSMS(
        customer.mobile_number,
        messageContent
      );

      if (!response.success) {
        console.error('Failed to send SMS:', response.error);
        
        // Record the failure in the database
        await supabase.from('sms_messages').insert({
          customer_id: customer.id,
          booking_id: bookingId,
          message_type: messageType,
          message_content: messageContent,
          status: 'failed',
          sent_at: new Date().toISOString()
        });

        return { 
          success: false, 
          error: response.error 
        };
      }

      // Record the message in the database
      const { error: dbError } = await supabase.from('sms_messages').insert({
        customer_id: customer.id,
        booking_id: bookingId,
        message_type: messageType,
        message_content: messageContent,
        status: response.message?.status || 'sent',
        sent_at: new Date().toISOString(),
        message_sid: response.message?.sid
      });

      if (dbError) {
        console.error('Error recording SMS in database:', dbError);
      }

      return { 
        success: true, 
        messageSid: response.message?.sid 
      };
    } catch (error) {
      console.error('Unexpected error sending SMS:', error);
      return { 
        success: false, 
        error 
      };
    }
  },

  /**
   * Send a booking confirmation SMS
   */
  async sendBookingConfirmation({
    customerId,
    bookingId,
    eventName,
    eventDate,
    eventTime,
    seats,
    customerName
  }: {
    customerId: string;
    bookingId: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    seats: string;
    customerName: string;
  }): Promise<{ success: boolean; error?: any }> {
    try {
      // Get the customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customer) {
        return { success: false, error: customerError || 'Customer not found' };
      }

      // Load the template
      const templatePath = '/templates/booking_confirmation.txt';
      const response = await fetch(templatePath);
      if (!response.ok) {
        return { success: false, error: `Failed to load template: ${response.statusText}` };
      }
      
      const template = await response.text();
      
      // Process the template with variables
      const messageContent = processTemplate(template, {
        customer_name: customerName,
        event_name: eventName,
        event_date: eventDate,
        event_time: eventTime,
        seats
      });

      // Send the SMS
      return await this.sendSMSToCustomer({
        customer,
        messageType: 'booking_confirmation',
        messageContent,
        bookingId
      });
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Send a booking reminder SMS (7-day or 24-hour)
   */
  async sendBookingReminder({
    customerId,
    bookingId,
    reminderType,
    reminderData
  }: {
    customerId: string;
    bookingId: string;
    reminderType: '7day' | '24hr';
    reminderData: BookingReminderData;
  }): Promise<{ success: boolean; error?: any }> {
    try {
      // Get the customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customer) {
        return { success: false, error: customerError || 'Customer not found' };
      }
      
      // Determine which template to use based on reminderType
      const templateName = reminderType === '7day' ? 'reminder_7day' : 'reminder_24hr';
      const messageType: SMSMessageType = reminderType === '7day' ? 'reminder_7day' : 'reminder_24hr';
      
      // Load the template
      const templatePath = `/templates/${templateName}.txt`;
      const response = await fetch(templatePath);
      if (!response.ok) {
        return { success: false, error: `Failed to load template: ${response.statusText}` };
      }
      
      const template = await response.text();
      
      // Process the template with variables
      const messageContent = processTemplate(template, reminderData);

      // Send the SMS
      return await this.sendSMSToCustomer({
        customer,
        messageType,
        messageContent,
        bookingId
      });
    } catch (error) {
      console.error(`Error sending ${reminderType} reminder:`, error);
      return { success: false, error };
    }
  },

  /**
   * Send a booking cancellation SMS
   */
  async sendBookingCancellation({
    customerId,
    bookingId,
    eventName,
    eventDate,
    eventTime,
    customerName
  }: {
    customerId: string;
    bookingId: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    customerName: string;
  }): Promise<{ success: boolean; error?: any }> {
    try {
      // Get the customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customer) {
        return { success: false, error: customerError || 'Customer not found' };
      }

      // Load the template
      const templatePath = '/templates/booking_cancellation.txt';
      const response = await fetch(templatePath);
      if (!response.ok) {
        return { success: false, error: `Failed to load template: ${response.statusText}` };
      }
      
      const template = await response.text();
      
      // Process the template with variables
      const messageContent = processTemplate(template, {
        customer_name: customerName,
        event_name: eventName,
        event_date: eventDate,
        event_time: eventTime
      });

      // Send the SMS
      return await this.sendSMSToCustomer({
        customer,
        messageType: 'booking_cancellation',
        messageContent,
        bookingId
      });
    } catch (error) {
      console.error('Error sending booking cancellation:', error);
      return { success: false, error };
    }
  },

  /**
   * Send event cancellation SMS to a customer
   */
  async sendEventCancellation({
    customerId,
    bookingId,
    eventName,
    eventDate,
    eventTime,
    customerName,
    customMessage = ''
  }: {
    customerId: string;
    bookingId: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    customerName: string;
    customMessage?: string;
  }): Promise<{ success: boolean; error?: any }> {
    try {
      // Get the customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customer) {
        return { success: false, error: customerError || 'Customer not found' };
      }

      // Load the template
      const templatePath = '/templates/event_cancellation.txt';
      const response = await fetch(templatePath);
      if (!response.ok) {
        return { success: false, error: `Failed to load template: ${response.statusText}` };
      }
      
      const template = await response.text();
      
      // Process the template with variables
      const messageContent = processTemplate(template, {
        customer_name: customerName,
        event_name: eventName,
        event_date: eventDate,
        event_time: eventTime,
        custom_message: customMessage ? `${customMessage} ` : '' // Add space after custom message if it exists
      });

      // Send the SMS
      return await this.sendSMSToCustomer({
        customer,
        messageType: 'event_cancellation',
        messageContent,
        bookingId
      });
    } catch (error) {
      console.error('Error sending event cancellation SMS:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Send event cancellation notifications to all bookings of an event
   */
  async sendEventCancellationToAllBookings({
    eventId,
    eventName,
    eventDate,
    eventTime,
    customMessage = ''
  }: {
    eventId: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    customMessage?: string;
  }): Promise<{ 
    success: boolean; 
    messagesSent: number;
    messagesFailed: number;
    totalBookings: number;
    error?: any 
  }> {
    try {
      // Get all bookings for this event
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          customer:customer_id (*)
        `)
        .eq('event_id', eventId);
      
      if (bookingsError) {
        return { 
          success: false, 
          messagesSent: 0,
          messagesFailed: 0,
          totalBookings: 0,
          error: bookingsError 
        };
      }
      
      if (!bookings || bookings.length === 0) {
        return { 
          success: true, 
          messagesSent: 0,
          messagesFailed: 0,
          totalBookings: 0
        };
      }
      
      // Track success and failures
      let messagesSent = 0;
      let messagesFailed = 0;
      
      // Send SMS to each booking
      for (const booking of bookings) {
        try {
          // Cast to any to avoid type issues
          const bookingData = booking as any;
          const customerId = bookingData?.customer?.id;
          const customerName = bookingData?.customer?.first_name;
          
          if (bookingData?.id && customerId && customerName) {
            const result = await this.sendEventCancellation({
              customerId,
              bookingId: bookingData.id,
              eventName,
              eventDate,
              eventTime,
              customerName,
              customMessage
            });
            
            if (result.success) {
              messagesSent++;
            } else {
              messagesFailed++;
              console.error(`Failed to send cancellation SMS for booking ${bookingData.id}:`, result.error);
            }
          } else {
            messagesFailed++;
            console.error(`Booking ${bookingData?.id || 'unknown'} has invalid customer information`);
          }
        } catch (err) {
          messagesFailed++;
          console.error('Error processing booking for SMS:', err);
        }
      }
      
      return {
        success: messagesSent > 0,
        messagesSent,
        messagesFailed,
        totalBookings: bookings.length
      };
    } catch (error) {
      console.error('Error sending event cancellation to all bookings:', error);
      return { 
        success: false, 
        messagesSent: 0,
        messagesFailed: 0,
        totalBookings: 0,
        error 
      };
    }
  },

  /**
   * Send a reminder SMS for a booking
   * @param bookingId ID of the booking to send a reminder for
   * @param reminderType Type of reminder ('7day' or '24hr')
   */
  async sendReminder(bookingId: string, reminderType: '7day' | '24hr'): Promise<{ success: boolean; error?: any }> {
    try {
      // First check if a reminder of this type has already been sent
      const hasReminder = await this.hasReceivedReminder(bookingId, reminderType);
      
      if (hasReminder) {
        return { 
          success: false, 
          error: `A ${reminderType === '7day' ? '7-day' : '24-hour'} reminder has already been sent for this booking.` 
        };
      }

      // Get booking details with customer and event
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id (*),
          event:event_id (*)
        `)
        .eq('id', bookingId)
        .single();
      
      if (bookingError || !booking) {
        return { success: false, error: bookingError || 'Booking not found' };
      }

      if (!booking.customer) {
        return { success: false, error: 'Customer information not found' };
      }

      if (!booking.event) {
        return { success: false, error: 'Event information not found' };
      }

      // Format the date and time for the SMS
      const eventDate = new Date(booking.event.start_time);
      const formattedDate = eventDate.toLocaleDateString('en-GB');
      const formattedTime = eventDate.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      const dayName = eventDate.toLocaleDateString('en-GB', { weekday: 'long' });

      // Prepare the reminder data
      const reminderData: BookingReminderData = {
        event_name: booking.event.title,
        event_date: formattedDate,
        event_time: formattedTime,
        event_day_name: dayName,
        customer_name: booking.customer.first_name,
        seats: booking.seats_or_reminder
      };

      // Get the appropriate template
      const messageType = reminderType === '7day' ? 'reminder_7day' : 'reminder_24hr';
      
      // Process the template with the data
      const messageContent = processTemplate(messageType, reminderData);
      
      // Send the SMS
      const smsResult = await sendSMS(
        booking.customer.mobile_number,
        messageContent
      );

      if (!smsResult.success) {
        return { 
          success: false, 
          error: smsResult.error?.message || 'Failed to send SMS' 
        };
      }

      // Record the SMS in the database
      const { error: insertError } = await supabase
        .from('sms_messages')
        .insert({
          customer_id: booking.customer_id,
          booking_id: bookingId,
          message_type: messageType,
          message_content: messageContent,
          sent_at: new Date().toISOString(),
          status: smsResult.message?.status || 'sent',
          message_sid: smsResult.message?.sid
        });

      if (insertError) {
        console.error('Error recording SMS in database:', insertError);
        // We still consider this a success since the SMS was sent
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending reminder SMS:', error);
      return { success: false, error };
    }
  },

  /**
   * Send a test message to a phone number without requiring a booking or customer record
   */
  async sendTestMessage({ phoneNumber, messageContent }: { phoneNumber: string; messageContent: string }): Promise<{ success: boolean; error?: any }> {
    try {
      console.log(`Preparing to send test SMS to ${phoneNumber}`);
      
      // Check if SMS is enabled using our utility function
      const { smsEnabled, message: configMessage } = await checkAndEnsureSmsConfig();
      
      if (!smsEnabled) {
        console.log(`SMS is disabled: ${configMessage}. Test message not sent.`);
        return { 
          success: true, 
          error: 'SMS is disabled. This is a simulated success.'
        };
      }
      
      console.log(`SMS is enabled: ${configMessage}. Sending test message.`);
      
      // Send the actual SMS via Twilio
      const result = await sendSMS(
        phoneNumber,
        messageContent
      );
      
      if (result.success) {
        console.log('Test SMS sent successfully');
        
        // Log the test message to the database
        try {
          await supabase.from('sms_messages').insert({
            customer_id: null, // No customer for test messages
            booking_id: null, // No booking for test messages
            message_type: 'test',
            content: messageContent,
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
  }
};

export default smsService; 