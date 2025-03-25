import { supabase } from '@/lib/supabase';
import { sendSMS, processTemplate } from '@/lib/sms-utils';
import { Customer } from '@/types';
import { Booking } from './booking-service';
import { Event } from './event-service';

export interface SMSMessage {
  id: string;
  customer_id: string;
  booking_id: string | null;
  message_type: SMSMessageType;
  message_content: string;
  sent_at: string;
  status: SMSStatus;
  // Join data
  customer?: Customer;
  booking?: Booking;
}

export type SMSMessageType = 
  | 'booking_confirmation' 
  | 'booking_reminder_7days' 
  | 'booking_reminder_24hrs' 
  | 'booking_cancellation' 
  | 'event_cancellation' 
  | 'manual';

export type SMSStatus = 
  | 'queued' 
  | 'sent' 
  | 'delivered' 
  | 'failed' 
  | 'undelivered' 
  | 'simulated';

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

export interface SMSTemplateVariables {
  customer_name: string;
  event_name: string;
  event_date: string;
  event_time: string;
  event_day_name?: string;
  seats?: string;
  [key: string]: string | undefined;
}

/**
 * SMS Templates for different message types
 * These would typically be stored in the database or in a CMS,
 * but for simplicity, we're hardcoding them here
 */
export const SMS_TEMPLATES: Record<string, string> = {
  booking_confirmation: 
    "Hi {{customer_name}}, your booking for {{event_name}} on {{event_date}} at {{event_time}} is confirmed. We've reserved {{seats}} for you. Reply to this message if you need to make any changes. The Anchor.",
  
  booking_reminder_7days:
    "Hi {{customer_name}}, this is a reminder about your booking for {{event_name}} next {{event_day_name}} at {{event_time}}. We look forward to seeing you here! Reply to this message if you need to make any changes. The Anchor.",
  
  booking_reminder_24hrs:
    "Hi {{customer_name}}, just a reminder that you're booked for {{event_name}} tomorrow at {{event_time}}. We look forward to seeing you! Reply to this message if you need to make any changes. The Anchor.",
  
  booking_cancellation:
    "Hi {{customer_name}}, your booking for {{event_name}} on {{event_date}} at {{event_time}} has been cancelled. If this was not requested by you or if you have any questions, please contact us. The Anchor.",
  
  event_cancellation:
    "Hi {{customer_name}}, we regret to inform you that {{event_name}} scheduled for {{event_date}} at {{event_time}} has been cancelled. We apologize for any inconvenience. Please contact us if you have any questions. The Anchor."
};

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
  async markReplyAsRead(replyId: string): Promise<{ data: SMSReply | null; error: any }> {
    const { data, error } = await supabase
      .from('sms_replies')
      .update({ read: true })
      .eq('id', replyId)
      .select()
      .single();
    
    return { data, error };
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
        sent_at: new Date().toISOString()
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
  async sendBookingConfirmation(
    booking: Booking, 
    customer: Customer, 
    event: Event
  ): Promise<{ success: boolean; messageSid?: string; error?: any }> {
    // Create template variables
    const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long'
    });
    
    const eventTime = event.start_time.substring(0, 5); // Format HH:MM
    
    const seats = booking.seats_or_reminder.includes('seat') 
      ? booking.seats_or_reminder 
      : 'a reminder';

    const templateVars: SMSTemplateVariables = {
      customer_name: customer.first_name,
      event_name: event.title,
      event_date: eventDate,
      event_time: eventTime,
      seats: seats
    };

    // Process the template
    const messageContent = processTemplate(
      SMS_TEMPLATES.booking_confirmation, 
      templateVars
    );

    // Send the message
    return this.sendSMSToCustomer({
      customer,
      messageType: 'booking_confirmation',
      messageContent,
      bookingId: booking.id
    });
  },

  /**
   * Receive an SMS reply (for webhook endpoint)
   */
  async receiveReply({
    fromNumber,
    messageContent
  }: {
    fromNumber: string;
    messageContent: string;
  }): Promise<{ success: boolean; error?: any }> {
    try {
      // Find customer by phone number
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('mobile_number', fromNumber)
        .limit(1);

      if (customerError) {
        console.error('Error finding customer:', customerError);
        return { success: false, error: customerError };
      }

      // If no customer found, create a record anyway with null customer_id
      const customerId = customers && customers.length > 0 
        ? customers[0].id 
        : null;

      // Record the reply
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
        console.error('Error recording SMS reply:', replyError);
        return { success: false, error: replyError };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error receiving SMS reply:', error);
      return { success: false, error };
    }
  }
};

export default smsService; 