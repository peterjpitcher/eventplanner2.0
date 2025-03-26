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
      const { error } = await supabase
        .from('event_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { data: null, error: null };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { data: null, error: error as Error };
    }
  }
};

export default eventCategoryService; 