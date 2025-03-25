import { supabase } from '@/lib/supabase';
import { Customer, CustomerFormData } from '@/types';

export const customerService = {
  /**
   * Get all customers
   */
  async getCustomers(): Promise<{ data: Customer[] | null; error: any }> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('first_name');
    
    return { data, error };
  },

  /**
   * Get a single customer by ID
   */
  async getCustomerById(id: string): Promise<{ data: Customer | null; error: any }> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error };
  },

  /**
   * Create a new customer
   */
  async createCustomer(customer: CustomerFormData): Promise<{ data: Customer | null; error: any }> {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    
    return { data, error };
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, customer: CustomerFormData): Promise<{ data: Customer | null; error: any }> {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  },

  /**
   * Delete a customer
   */
  async deleteCustomer(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  /**
   * Search customers by name or mobile number
   */
  async searchCustomers(query: string): Promise<{ data: Customer[] | null; error: any }> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,mobile_number.ilike.%${query}%`)
      .order('first_name')
      .limit(10);
    
    return { data, error };
  }
};

export default customerService; 