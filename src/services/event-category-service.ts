import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types';

export interface EventCategory {
  id: string;
  name: string;
  default_capacity: number;
  default_start_time: string;
  notes: string | null;
  created_at: string;
}

export interface EventCategoryFormData {
  name: string;
  default_capacity: number;
  default_start_time: string;
  notes: string | null;
}

export const eventCategoryService = {
  /**
   * Get all event categories
   */
  async getCategories(): Promise<ApiResponse<EventCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<ApiResponse<EventCategory>> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Create a new category
   */
  async createCategory(category: EventCategoryFormData): Promise<ApiResponse<EventCategory>> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .insert([category])
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating category:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, category: EventCategoryFormData): Promise<ApiResponse<EventCategory>> {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating category:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    try {
      console.log(`Starting deletion process for category ${id}`);
      
      // First check if the category exists
      const { data: existingCategory, error: checkError } = await supabase
        .from('event_categories')
        .select('id, name')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error(`Error checking if category ${id} exists:`, checkError);
        if (checkError.code === 'PGRST116') { // Record not found
          return { 
            data: null, 
            error: new Error(`Category with ID ${id} not found`) 
          };
        }
        throw checkError;
      }
      
      console.log(`Found category ${existingCategory.name} (${id})`);
      
      // Check for related events before deletion
      const { data: relatedEvents, error: eventsError } = await supabase
        .from('events')
        .select('id, title')
        .eq('category_id', id);
      
      if (eventsError) {
        console.error(`Error checking related events for category ${id}:`, eventsError);
        throw eventsError;
      } 
      
      if (relatedEvents && relatedEvents.length > 0) {
        console.warn(`Category ${id} has ${relatedEvents.length} related events. Deletion will be rejected.`);
        console.warn(`Related events:`, relatedEvents.map(e => e.title).join(', '));
        return {
          data: null,
          error: new Error(`Cannot delete category with ${relatedEvents.length} existing events. Please reassign or delete these events first.`)
        };
      }
      
      console.log(`No related events found, proceeding with deletion of category ${id}`);
      
      // Perform the actual deletion with a raw query to bypass any client-side issues
      const { error: deleteError } = await supabase.rpc('delete_category', { category_id: id });
      
      if (deleteError) {
        console.error(`Error during category deletion for ID ${id}:`, deleteError);
        return { 
          data: null, 
          error: new Error(`Failed to delete category: ${deleteError.message}`) 
        };
      }
      
      console.log(`Successfully deleted category with ID: ${id}`);
      return { data: null, error: null };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { data: null, error: error as Error };
    }
  }
};

export default eventCategoryService; 