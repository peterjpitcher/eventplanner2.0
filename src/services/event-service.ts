import { supabase } from '@/lib/supabase';
import { EventCategory } from './event-category-service';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  date: string;
  start_time: string;
  capacity: number | null;
  is_published: boolean;
  is_canceled: boolean;
  created_at: string;
  updated_at: string;
  // Join data
  category?: EventCategory | null;
}

export interface EventFormData {
  title: string;
  description: string | null;
  category_id: string | null;
  date: string;
  start_time: string;
  capacity: number | null;
  is_published: boolean;
}

export const eventService = {
  /**
   * Get all events with optional category information
   */
  async getEvents(): Promise<{ data: Event[] | null; error: any }> {
    const { data, error } = await supabase
      .from('events_view')
      .select(`
        *,
        category:category_id (
          id,
          name,
          description,
          color
        )
      `)
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
          description,
          color
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
          description,
          color,
          default_price,
          default_capacity,
          default_duration
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
    // Convert from the form data format to the database format
    const dbEvent = {
      name: event.title,
      description: event.description,
      category_id: event.category_id,
      start_time: new Date(`${event.date}T${event.start_time}`).toISOString(),
      capacity: event.capacity,
      is_published: event.is_published
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
      name: event.title,
      description: event.description,
      category_id: event.category_id,
      start_time: new Date(`${event.date}T${event.start_time}`).toISOString(),
      capacity: event.capacity,
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
  async cancelEvent(id: string): Promise<{ data: Event | null; error: any }> {
    const { data, error } = await supabase
      .from('events')
      .update({ is_canceled: true })
      .eq('id', id)
      .select();
    
    if (error || !data) {
      return { data: null, error };
    }
    
    // Fetch the updated event in the view format
    return this.getEventById(id);
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
          description,
          color
        )
      `)
      .eq('category_id', categoryId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    return { data, error };
  }
};

export default eventService; 