import { supabase } from '@/lib/supabase';
import { EventCategory } from './event-category-service';
import { smsService } from './sms-service';
import { format } from 'date-fns';

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
  async getEvents(): Promise<{ data: Event[] | null; error: any }> {
    const { data, error } = await supabase
      .from('events_view')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
   
    return { data, error };
  },

  /**
   * Get upcoming events (events that haven't started yet)
   */
  async getUpcomingEvents(limit: number = 10): Promise<{ data: Event[] | null; error: any }> {
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
    
    return { data, error };
  },

  /**
   * Get a single event by ID
   */
  async getEventById(id: string): Promise<{ data: Event | null; error: any }> {
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
    
    return { data, error };
  },

  /**
   * Create a new event
   */
  async createEvent(event: EventFormData): Promise<{ data: Event | null; error: any }> {
    // Get the current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: userError };
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

    if (error) {
      return { data: null, error };
    }

    // Fetch the created event with the view format
    return this.getEventById(data[0].id);
  },

  /**
   * Update an existing event
   */
  async updateEvent(id: string, event: EventFormData): Promise<{ data: Event | null; error: any }> {
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

    if (error) {
      return { data: null, error };
    }

    // Fetch the updated event
    return this.getEventById(id);
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  /**
   * Cancel an event (mark as canceled rather than deleting)
   */
  async cancelEvent(id: string, sendSMS: boolean = false, customMessage: string = ''): Promise<{ 
    data: Event | null; 
    error: any;
    smsResults?: {
      success: boolean;
      messagesSent: number;
      messagesFailed: number;
      totalBookings: number;
    } 
  }> {
    // First update the event in the database
    const { data, error } = await supabase
      .from('events')
      .update({ is_canceled: true })
      .eq('id', id)
      .select();
    
    if (error || !data) {
      return { data: null, error };
    }
    
    // Fetch the updated event details
    const { data: event, error: eventError } = await this.getEventById(id);
    
    if (eventError || !event) {
      return { data: null, error: eventError };
    }
    
    // Send SMS notifications if requested
    let smsResults = undefined;
    
    if (sendSMS && process.env.SMS_ENABLED === 'true') {
      try {
        // Format dates
        const eventDate = format(new Date(event.start_time), 'dd/MM/yyyy');
        const eventTime = format(new Date(event.start_time), 'HH:mm');
        
        // Send SMS notifications to all affected bookings
        smsResults = await smsService.sendEventCancellationToAllBookings({
          eventId: id,
          eventName: event.title,
          eventDate,
          eventTime,
          customMessage
        });
      } catch (smsError) {
        console.error('Error sending SMS notifications for event cancellation:', smsError);
      }
    }
    
    return { 
      data: event, 
      error: null,
      smsResults
    };
  },

  /**
   * Get events by category ID
   */
  async getEventsByCategory(categoryId: string): Promise<{ data: Event[] | null; error: any }> {
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
      .eq('category_id', categoryId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    return { data, error };
  }
};

export default eventService; 