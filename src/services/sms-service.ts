import { supabase } from '@/lib/supabase';
import { sendSMS, processTemplate, checkAndEnsureSmsConfig } from '@/lib/sms-utils';
import { Customer } from '@/types';
import { Booking } from './booking-service';
import { Event } from './event-service';

export type SMSMessageType = 
  | 'booking_confirmation' 
  | 'booking_cancellation' 
  | 'event_reminder' 
  | 'custom'
  | 'test';

class SMSService {
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
  }
  
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
  }
}

export const smsService = new SMSService(); 