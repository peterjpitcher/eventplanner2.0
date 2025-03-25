import { supabase } from '@/lib/supabase';
import { sendSMS, processTemplate } from '@/lib/sms-utils';
import { Customer } from '@/types';
import { Booking } from './booking-service';
import { Event } from './event-service';

export type SMSMessageType = 
  'booking_confirmation' | 
  'reminder_7day' | 
  'reminder_24hr' | 
  'booking_cancellation' | 
  'event_cancellation' | 
  'test';

export type SMSStatus = 
  'queued' | 
  'sent' | 
  'delivered' | 
  'failed' | 
  'undelivered';

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
  }
};

export default smsService; 