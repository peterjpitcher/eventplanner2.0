import { supabase } from '@/lib/supabase';
import { EventCategory } from './event-category-service';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  price: number | null;
  capacity: number | null;
  location: string | null;
  is_published: boolean;
  is_canceled: boolean;
  created_at: string;
  updated_at: string;
  // Join data
  category?: EventCategory | null;
}

export interface EventFormData {
  title: string;
  description: string;
  category_id: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  price: number | null;
  capacity: number | null;
  location: string | null;
  is_published: boolean;
}

export const eventService = {
  /**
   * Get all events with optional category information
   */
  async getEvents(): Promise<{ data: Event[] | null; error: any }> {
    const { data, error } = await supabase
      .from('events')
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
      .from('events')
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
      .from('events')
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
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select(`
        *,
        category:category_id (
          id,
          name
        )
      `)
      .single();
    
    return { data, error };
  },

  /**
   * Update an existing event
   */
  async updateEvent(id: string, event: EventFormData): Promise<{ data: Event | null; error: any }> {
    const { data, error } = await supabase
      .from('events')
      .update(event)
      .eq('id', id)
      .select(`
        *,
        category:category_id (
          id,
          name
        )
      `)
      .single();
    
    return { data, error };
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
      .select()
      .single();
    
    return { data, error };
  },

  /**
   * Get events by category ID
   */
  async getEventsByCategory(categoryId: string): Promise<{ data: Event[] | null; error: any }> {
    const { data, error } = await supabase
      .from('events')
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