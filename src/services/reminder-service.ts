import { supabase } from '@/lib/supabase';
import { bookingService } from './booking-service';
import { smsService, SMSMessageType } from './sms-service';
import { addDays, format, isBefore, isAfter, startOfDay } from 'date-fns';

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

export const reminderService = {
  /**
   * Processes pending reminders - both 7-day and 24-hour
   */
  async processReminders(): Promise<{ 
    success: boolean; 
    processed: number; 
    skipped: number; 
    failed: number; 
    error?: any 
  }> {
    try {
      const today = new Date();
      
      // Get all upcoming events in the next 8 days
      const { data: upcomingEvents, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          name,
          start_time,
          bookings (
            id,
            customer_id,
            seats_or_reminder,
            customers (
              id,
              first_name,
              mobile_number
            )
          )
        `)
        .gte('start_time', today.toISOString())
        .lte('start_time', addDays(today, 8).toISOString())
        .eq('is_canceled', false)
        .order('start_time', { ascending: true });

      if (eventsError) {
        console.error('Error fetching upcoming events:', eventsError);
        return { success: false, processed: 0, skipped: 0, failed: 0, error: eventsError };
      }

      if (!upcomingEvents || upcomingEvents.length === 0) {
        return { success: true, processed: 0, skipped: 0, failed: 0 };
      }

      let processed = 0;
      let skipped = 0;
      let failed = 0;

      // Process each event
      for (const event of upcomingEvents) {
        const eventDate = new Date(event.start_time);
        const sevenDayReminderDate = addDays(today, 7);
        const twentyFourHourReminderDate = addDays(today, 1);
        
        // Check if we need to send a 7-day reminder
        const needsSevenDayReminder = 
          startOfDay(eventDate).getTime() === startOfDay(sevenDayReminderDate).getTime();
        
        // Check if we need to send a 24-hour reminder
        const needsTwentyFourHourReminder = 
          startOfDay(eventDate).getTime() === startOfDay(twentyFourHourReminderDate).getTime();

        if (!needsSevenDayReminder && !needsTwentyFourHourReminder) {
          continue; // Skip this event if neither reminder is needed
        }

        // Process bookings for this event
        if (event.bookings && event.bookings.length > 0) {
          for (const booking of event.bookings) {
            if (!booking.customers) continue;

            // Extract the customer from the nested customers array
            const customer = Array.isArray(booking.customers) 
              ? booking.customers[0] 
              : booking.customers;

            if (!customer || !customer.id || !customer.first_name) {
              continue; // Skip if customer data is invalid
            }
            
            // Format event data for the reminder
            const reminderData = {
              event_name: event.name,
              event_date: format(eventDate, 'dd/MM/yyyy'),
              event_time: format(eventDate, 'HH:mm'),
              event_day_name: format(eventDate, 'EEEE'),
              customer_name: customer.first_name,
              seats: booking.seats_or_reminder
            };

            // Send 7-day reminder if needed
            if (needsSevenDayReminder) {
              try {
                // Check if we've already sent a 7-day reminder for this booking
                const { data: existingReminders } = await supabase
                  .from('sms_messages')
                  .select('id')
                  .eq('booking_id', booking.id)
                  .eq('message_type', 'reminder_7day')
                  .limit(1);

                if (existingReminders && existingReminders.length > 0) {
                  skipped++;
                  continue; // Skip if we've already sent a reminder
                }

                // Send the 7-day reminder
                const result = await smsService.sendBookingReminder({
                  customerId: customer.id,
                  bookingId: booking.id,
                  reminderType: '7day',
                  reminderData
                });

                if (result.success) {
                  processed++;
                } else {
                  failed++;
                }
              } catch (error) {
                console.error('Error processing 7-day reminder:', error);
                failed++;
              }
            }

            // Send 24-hour reminder if needed
            if (needsTwentyFourHourReminder) {
              try {
                // Check if we've already sent a 24-hour reminder for this booking
                const { data: existingReminders } = await supabase
                  .from('sms_messages')
                  .select('id')
                  .eq('booking_id', booking.id)
                  .eq('message_type', 'reminder_24hr')
                  .limit(1);

                if (existingReminders && existingReminders.length > 0) {
                  skipped++;
                  continue; // Skip if we've already sent a reminder
                }

                // Send the 24-hour reminder
                const result = await smsService.sendBookingReminder({
                  customerId: customer.id,
                  bookingId: booking.id,
                  reminderType: '24hr',
                  reminderData
                });

                if (result.success) {
                  processed++;
                } else {
                  failed++;
                }
              } catch (error) {
                console.error('Error processing 24-hour reminder:', error);
                failed++;
              }
            }
          }
        }
      }

      return { 
        success: true, 
        processed, 
        skipped, 
        failed 
      };
    } catch (error) {
      console.error('Error processing reminders:', error);
      return { 
        success: false, 
        processed: 0, 
        skipped: 0, 
        failed: 0, 
        error 
      };
    }
  },

  /**
   * Check if a booking needs a 7-day reminder
   */
  needsSevenDayReminder(eventDate: Date): boolean {
    const today = new Date();
    const sevenDayReminderDate = addDays(today, 7);
    return startOfDay(eventDate).getTime() === startOfDay(sevenDayReminderDate).getTime();
  },

  /**
   * Check if a booking needs a 24-hour reminder
   */
  needsTwentyFourHourReminder(eventDate: Date): boolean {
    const today = new Date();
    const twentyFourHourReminderDate = addDays(today, 1);
    return startOfDay(eventDate).getTime() === startOfDay(twentyFourHourReminderDate).getTime();
  },

  /**
   * Send a reminder for a specific booking
   */
  async sendBookingReminder(bookingId: string, reminderType: '7day' | '24hr'): Promise<{ 
    success: boolean; 
    error?: any 
  }> {
    try {
      // Get the booking details with event and customer
      const { data: booking, error: bookingError } = await bookingService.getBookingById(bookingId);
      
      if (bookingError || !booking) {
        return { success: false, error: bookingError || 'Booking not found' };
      }

      if (!booking.event || !booking.customer) {
        return { success: false, error: 'Booking has no event or customer' };
      }

      const eventDate = new Date(booking.event.start_time);
      
      // Check if the event date is in the past
      if (isBefore(eventDate, new Date())) {
        return { success: false, error: 'Cannot send reminder for past event' };
      }

      // Format event data for the reminder
      const reminderData = {
        event_name: booking.event.title,
        event_date: format(eventDate, 'dd/MM/yyyy'),
        event_time: format(eventDate, 'HH:mm'),
        event_day_name: format(eventDate, 'EEEE'),
        customer_name: booking.customer.first_name,
        seats: booking.seats_or_reminder
      };

      // Send the reminder
      const result = await smsService.sendBookingReminder({
        customerId: booking.customer.id,
        bookingId: booking.id,
        reminderType,
        reminderData
      });

      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Error sending booking reminder:', error);
      return { success: false, error };
    }
  }
};

export default reminderService; 