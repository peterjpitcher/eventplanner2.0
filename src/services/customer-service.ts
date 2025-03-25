import { supabase } from '@/lib/supabase';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
}

export const customerService = {
  /**
   * Get all customers
   */
  async getCustomers(): Promise<{ data: Customer[] | null; error: any }> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    
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
   * Search customers by name or email
   */
  async searchCustomers(query: string): Promise<{ data: Customer[] | null; error: any }> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name')
      .limit(10);
    
    return { data, error };
  }
};

export default customerService; 