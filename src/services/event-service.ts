import { supabase } from '@/lib/supabase';
import { EventCategory } from './event-category-service';
import { smsService } from './sms-service';
import { format } from 'date-fns';
import { ApiResponse } from '@/types';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  date: string;
  start_time: string;
  capacity: number | null;
  notes: string | null;
  is_published: boolean;
  is_canceled: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  category_name: string | null;
  creator_email: string | null;
}

export interface EventFormData {
  title: string;
  description: string | null;
  category_id: string | null;
  date: string;
  start_time: string;
  capacity: number | null;
  notes: string | null;
  is_published: boolean;
}

export const eventService = {
  /**
   * Get all events with optional category information
   */
  async getEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const { data, error } = await supabase
        .from('events_view')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
     
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching events:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get upcoming events (events that haven't started yet)
   */
  async getUpcomingEvents(limit: number = 10): Promise<ApiResponse<Event[]>> {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('events_view')
        .select(`
          *,
          category:category_id (
            id,
            name,
            default_capacity,
            default_start_time,
            notes,
            created_at
          )
        `)
        .gte('date', today) // Events today or in the future
        .eq('is_canceled', false) // Only non-canceled events
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get a single event by ID
   */
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    try {
      const { data, error } = await supabase
        .from('events_view')
        .select(`
          *,
          category:category_id (
            id,
            name,
            default_capacity,
            default_start_time,
            notes,
            created_at
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Create a new event
   */
  async createEvent(event: EventFormData): Promise<ApiResponse<Event>> {
    try {
      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw userError || new Error('User not authenticated');
      }

      // Convert from the form data format to the database format
      const dbEvent = {
        title: event.title,
        description: event.description,
        category_id: event.category_id,
        date: event.date,
        start_time: event.start_time,
        capacity: event.capacity,
        notes: event.notes,
        is_published: event.is_published,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('events')
        .insert([dbEvent])
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Failed to create event');
      }

      // Fetch the created event with the view format
      return this.getEventById(data[0].id);
    } catch (error) {
      console.error('Error creating event:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update an existing event
   */
  async updateEvent(id: string, event: EventFormData): Promise<ApiResponse<Event>> {
    try {
      // Convert from the form data format to the database format
      const dbEvent = {
        title: event.title,
        description: event.description,
        category_id: event.category_id,
        date: event.date,
        start_time: event.start_time,
        capacity: event.capacity,
        notes: event.notes,
        is_published: event.is_published
      };

      const { error } = await supabase
        .from('events')
        .update(dbEvent)
        .eq('id', id);

      if (error) throw error;

      // Fetch the updated event
      return this.getEventById(id);
    } catch (error) {
      console.error('Error updating event:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { data: null, error: null };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Cancel an event
   * @param id The event ID
   * @param sendCancellationSMS Whether to send cancellation SMS to all bookings
   * @returns Result with cancellation details
   */
  async cancelEvent(id: string, sendCancellationSMS: boolean = false): Promise<{ 
    success: boolean; 
    error?: any; 
    smsStats?: { 
      total: number; 
      sent: number; 
      failed: number; 
    } 
  }> {
    try {
      // First, get the event details
      const { data: event, error: eventError } = await this.getEventById(id);
      
      if (eventError || !event) {
        throw eventError || new Error('Event not found');
      }
      
      // Update the event to set it as cancelled
      const { error: updateError } = await supabase
        .from('events')
        .update({ is_canceled: true })
        .eq('id', id);
      
      if (updateError) {
        throw updateError;
      }
      
      // If SMS notifications are requested, send cancellation messages
      const smsStats = { total: 0, sent: 0, failed: 0 };
      
      if (sendCancellationSMS) {
        // Get all bookings for this event
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            *,
            customers:customer_id (
              id, 
              first_name, 
              last_name, 
              mobile_number
            )
          `)
          .eq('event_id', id);
        
        if (bookings && bookings.length > 0) {
          // Track SMS stats
          smsStats.total = bookings.length;
          
          // Process each booking
          const smsPromises = bookings.map(async (booking) => {
            const customer = booking.customers;
            
            // Skip if no mobile number
            if (!customer || !customer.mobile_number) {
              return { success: false };
            }
            
            try {
              // Format the date
              const eventDate = new Date(event.date);
              const formattedDate = eventDate.toLocaleDateString('en-GB', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric'
              });
              
              // Format time (if available)
              const timeInfo = event.start_time ? ` at ${event.start_time}` : '';
              
              // Create the message
              const message = `Hi ${customer.first_name}, we regret to inform you that ${event.title} scheduled for ${formattedDate}${timeInfo} has been cancelled. We apologize for any inconvenience.`;
              
              // Send the SMS
              return await smsService.sendSMS({
                to: customer.mobile_number,
                message,
                booking_id: booking.id,
                message_type: 'event_cancellation'
              });
            } catch (error) {
              console.error(`Error sending cancellation SMS for booking ${booking.id}:`, error);
              return { success: false };
            }
          });
          
          // Wait for all SMS to be sent
          const results = await Promise.all(smsPromises);
          
          // Count successes and failures
          results.forEach(result => {
            if (result.success) {
              smsStats.sent++;
            } else {
              smsStats.failed++;
            }
          });
        }
      }
      
      return { 
        success: true,
        smsStats: sendCancellationSMS ? smsStats : undefined
      };
    } catch (error) {
      console.error('Error cancelling event:', error);
      return { success: false, error };
    }
  },

  /**
   * Get events by category ID
   */
  async getEventsByCategory(categoryId: string): Promise<ApiResponse<Event[]>> {
    try {
      const { data, error } = await supabase
        .from('events_view')
        .select('*')
        .eq('category_id', categoryId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error fetching events for category ${categoryId}:`, error);
      return { data: null, error: error as Error };
    }
  }
};

export default eventService; 