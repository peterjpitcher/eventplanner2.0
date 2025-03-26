import { supabase } from '@/lib/supabase';
import { bookingService } from './booking-service';
import { smsService, SMSMessageType } from './sms-service';
import { addDays, format, isBefore, isAfter, startOfDay } from 'date-fns';
import { createLogger } from '@/lib/logger';
import { isSameDay, parseISO } from 'date-fns';

const logger = createLogger('reminder-service');

interface ReminderJob {
  id: string;
  booking_id: string;
  event_id: string;
  customer_id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  type: 'seven_day' | 'twenty_four_hour';
  status: 'pending' | 'processed' | 'failed' | 'skipped';
  created_at: string;
  processed_at?: string;
  notes?: string;
}

// Configure reminder settings
const REMINDER_TYPES = {
  reminder_7day: {
    daysBeforeEvent: 7,
    messageType: 'reminder_7day',
    description: '7-day reminder'
  },
  reminder_24hr: {
    daysBeforeEvent: 1,
    messageType: 'reminder_24hr',
    description: '24-hour reminder'
  }
};

export interface ReminderResult {
  type: string;
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export const reminderService = {
  /**
   * Process reminders for all bookings with upcoming events
   * @returns Results for each reminder type
   */
  async processReminders(): Promise<{
    results: ReminderResult[];
    success: boolean;
    error?: any;
  }> {
    logger.info('Starting automated reminder processing');
    
    const results: ReminderResult[] = [];
    const errors: string[] = [];
    
    try {
      // Process each reminder type
      for (const [type, config] of Object.entries(REMINDER_TYPES)) {
        logger.info(`Processing ${config.description}...`);
        
        const result = await this.processReminderType(
          type,
          config.daysBeforeEvent,
          config.messageType
        );
        
        results.push(result);
        errors.push(...result.errors);
        
        logger.info(`${config.description} processing complete: ${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped`);
      }
      
      return {
        results,
        success: true
      };
    } catch (error) {
      logger.error('Error processing reminders:', error);
      return {
        results,
        success: false,
        error
      };
    }
  },
  
  /**
   * Process a specific type of reminder
   * @param type The reminder type identifier
   * @param daysBeforeEvent Days before the event to send the reminder
   * @param messageType The message type for the reminder
   * @returns Results of the reminder processing
   */
  async processReminderType(
    type: string,
    daysBeforeEvent: number,
    messageType: string
  ): Promise<ReminderResult> {
    const result: ReminderResult = {
      type,
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    
    try {
      // Calculate the target date for reminders
      const today = new Date();
      const targetDate = addDays(today, daysBeforeEvent);
      const formattedTargetDate = format(targetDate, 'yyyy-MM-dd');
      
      logger.info(`Identifying bookings for events on ${formattedTargetDate} (${daysBeforeEvent} days from now)`);
      
      // Find all bookings for events occurring on the target date
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customers:customer_id (id, first_name, last_name, mobile_number),
          events:event_id (id, title, date, start_time)
        `)
        .eq('events.is_canceled', false);
      
      if (error) {
        logger.error(`Error fetching bookings for reminder processing: ${error.message}`);
        result.errors.push(`Error fetching bookings: ${error.message}`);
        return result;
      }
      
      if (!bookings || bookings.length === 0) {
        logger.info('No bookings found for reminder processing');
        return result;
      }
      
      logger.info(`Found ${bookings.length} bookings to check for reminders`);
      
      // Filter bookings for events occurring on the target date
      const bookingsForTargetDate = bookings.filter(booking => {
        const eventDate = parseISO(booking.events.date);
        return isSameDay(eventDate, targetDate);
      });
      
      logger.info(`${bookingsForTargetDate.length} bookings match the target date ${formattedTargetDate}`);
      
      // Process each booking
      for (const booking of bookingsForTargetDate) {
        result.processed++;
        
        // Skip if the customer has no mobile number
        if (!booking.customers?.mobile_number) {
          logger.info(`Skipping reminder for booking ${booking.id} - no mobile number`);
          result.skipped++;
          continue;
        }
        
        // Check if this reminder has already been sent
        const { data: existingReminders } = await supabase
          .from('sms_messages')
          .select('*')
          .eq('booking_id', booking.id)
          .eq('message_type', messageType);
          
        if (existingReminders && existingReminders.length > 0) {
          logger.info(`Skipping reminder for booking ${booking.id} - already sent`);
          result.skipped++;
          continue;
        }
        
        // Format the date and time for the message
        const eventDate = parseISO(booking.events.date);
        const formattedDate = format(eventDate, 'EEEE, do MMMM yyyy');
        const timeInfo = booking.events.start_time || '';
        
        // Create the message based on the reminder type
        let message = '';
        if (messageType === 'reminder_7day') {
          message = `Hi ${booking.customers.first_name}, this is a reminder about your booking for ${booking.events.title} on ${formattedDate}`;
          if (timeInfo) message += ` at ${timeInfo}`;
          message += `. You have reserved ${booking.seats_or_reminder} seat(s). We look forward to seeing you!`;
        } else if (messageType === 'reminder_24hr') {
          message = `Hi ${booking.customers.first_name}, just a reminder that you're booked for ${booking.events.title} tomorrow`;
          if (timeInfo) message += ` at ${timeInfo}`;
          message += `. You have reserved ${booking.seats_or_reminder} seat(s). We look forward to seeing you!`;
        }
        
        try {
          // Send the reminder SMS
          const smsResult = await smsService.sendSMS({
            to: booking.customers.mobile_number,
            message,
            booking_id: booking.id,
            message_type: messageType
          });
          
          if (smsResult.success) {
            logger.info(`Successfully sent ${type} for booking ${booking.id}`);
            result.sent++;
            
            // Update the booking to indicate the reminder was sent
            await supabase
              .from('bookings')
              .update({ [`${type}_sent`]: true })
              .eq('id', booking.id);
          } else {
            logger.error(`Failed to send ${type} for booking ${booking.id}: ${smsResult.error}`);
            result.failed++;
            result.errors.push(`Failed to send reminder for booking ${booking.id}: ${smsResult.error}`);
          }
        } catch (error: any) {
          logger.error(`Error sending ${type} for booking ${booking.id}: ${error.message}`);
          result.failed++;
          result.errors.push(`Error sending reminder for booking ${booking.id}: ${error.message}`);
        }
      }
      
      return result;
    } catch (error: any) {
      logger.error(`Error processing ${type}: ${error.message}`);
      result.errors.push(`Error processing ${type}: ${error.message}`);
      return result;
    }
  },
  
  /**
   * Send a manual reminder for a specific booking
   * @param bookingId The booking ID to send the reminder for
   * @param reminderType The type of reminder to send
   * @returns Result of the reminder sending
   */
  async sendManualReminder(
    bookingId: string,
    reminderType: string
  ): Promise<{
    success: boolean;
    error?: any;
  }> {
    try {
      logger.info(`Sending manual ${reminderType} for booking ${bookingId}`);
      
      // Get the booking with customer and event details
      const { data: bookingWithDetails, error: bookingError } = await bookingService.getBookingWithDetails(bookingId);
      
      if (bookingError || !bookingWithDetails) {
        return {
          success: false,
          error: bookingError || new Error('Booking not found')
        };
      }
      
      const booking = bookingWithDetails;
      
      // Check if customer has a mobile number
      if (!booking.customer?.mobile_number) {
        return {
          success: false,
          error: new Error('Customer has no mobile number')
        };
      }
      
      // Format the date and time for the message
      const eventDate = parseISO(booking.event.date);
      const formattedDate = format(eventDate, 'EEEE, do MMMM yyyy');
      const timeInfo = booking.event.start_time || '';
      
      // Create the message based on the reminder type
      let message = '';
      if (reminderType === 'reminder_7day') {
        message = `Hi ${booking.customer.first_name}, this is a reminder about your booking for ${booking.event.title} on ${formattedDate}`;
        if (timeInfo) message += ` at ${timeInfo}`;
        message += `. You have reserved ${booking.seats_or_reminder} seat(s). We look forward to seeing you!`;
      } else if (reminderType === 'reminder_24hr') {
        message = `Hi ${booking.customer.first_name}, just a reminder that you're booked for ${booking.event.title} tomorrow`;
        if (timeInfo) message += ` at ${timeInfo}`;
        message += `. You have reserved ${booking.seats_or_reminder} seat(s). We look forward to seeing you!`;
      } else {
        return {
          success: false,
          error: new Error(`Invalid reminder type: ${reminderType}`)
        };
      }
      
      // Send the reminder SMS
      const smsResult = await smsService.sendSMS({
        to: booking.customer.mobile_number,
        message,
        booking_id: booking.id,
        message_type: reminderType
      });
      
      if (smsResult.success) {
        logger.info(`Successfully sent manual ${reminderType} for booking ${bookingId}`);
        
        // Update the booking to indicate the reminder was sent
        await supabase
          .from('bookings')
          .update({ [`${reminderType}_sent`]: true })
          .eq('id', bookingId);
          
        return {
          success: true
        };
      } else {
        logger.error(`Failed to send manual ${reminderType} for booking ${bookingId}: ${smsResult.error}`);
        return {
          success: false,
          error: new Error(`Failed to send reminder: ${smsResult.error}`)
        };
      }
    } catch (error: any) {
      logger.error(`Error sending manual reminder for booking ${bookingId}: ${error.message}`);
      return {
        success: false,
        error
      };
    }
  },
  
  /**
   * Get reminder status for a specific booking
   * @param bookingId The booking ID to check
   * @returns Reminder status for the booking
   */
  async getReminderStatus(bookingId: string): Promise<{
    reminder_7day: {
      sent: boolean;
      sentAt?: string;
    };
    reminder_24hr: {
      sent: boolean;
      sentAt?: string;
    };
  }> {
    try {
      // Get reminders from the sms_messages table
      const { data: reminders } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('booking_id', bookingId)
        .in('message_type', ['reminder_7day', 'reminder_24hr'])
        .order('sent_at', { ascending: false });
      
      // Initialize the result with proper types
      const result = {
        reminder_7day: { 
          sent: false,
          sentAt: undefined as string | undefined 
        },
        reminder_24hr: { 
          sent: false,
          sentAt: undefined as string | undefined
        }
      };
      
      // Update the result based on the reminders
      if (reminders && reminders.length > 0) {
        for (const reminder of reminders) {
          if (reminder.message_type === 'reminder_7day' && reminder.status === 'sent') {
            result.reminder_7day.sent = true;
            result.reminder_7day.sentAt = reminder.sent_at;
          } else if (reminder.message_type === 'reminder_24hr' && reminder.status === 'sent') {
            result.reminder_24hr.sent = true;
            result.reminder_24hr.sentAt = reminder.sent_at;
          }
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Error getting reminder status for booking ${bookingId}:`, error);
      return {
        reminder_7day: { sent: false, sentAt: undefined },
        reminder_24hr: { sent: false, sentAt: undefined }
      };
    }
  }
};

export default reminderService; 