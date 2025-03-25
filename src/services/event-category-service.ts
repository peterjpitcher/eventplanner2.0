import { supabase } from '@/lib/supabase';

export interface EventCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  default_price: number | null;
  default_capacity: number | null;
  default_duration: number | null;
  created_at: string;
  updated_at: string;
}

export interface EventCategoryFormData {
  name: string;
  description: string | null;
  color: string;
  default_price: number | null;
  default_capacity: number | null;
  default_duration: number | null;
}

export const eventCategoryService = {
  /**
   * Get all event categories
   */
  async getCategories(): Promise<{ data: EventCategory[] | null; error: any }> {
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .order('name');
    
    return { data, error };
  },

  /**
   * Get a single category by ID
   */
  async getCategoryById(id: string): Promise<{ data: EventCategory | null; error: any }> {
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  /**
   * Create a new category
   */
  async createCategory(category: EventCategoryFormData): Promise<{ data: EventCategory | null; error: any }> {
    const { data, error } = await supabase
      .from('event_categories')
      .insert([category])
      .select()
      .single();
    
    return { data, error };
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, category: EventCategoryFormData): Promise<{ data: EventCategory | null; error: any }> {
    const { data, error } = await supabase
      .from('event_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('event_categories')
      .delete()
      .eq('id', id);
    
    return { error };
  }
};

export default eventCategoryService; 