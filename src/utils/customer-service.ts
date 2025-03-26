import { supabase } from '@/lib/supabase';
import { Customer, CustomerFormData, ApiResponse } from '@/types';
import { formatUKMobileNumber, isValidUKMobileNumber } from '@/lib/phone-utils';

export const CUSTOMERS_TABLE = 'customers';

// Export the phone utils for backward compatibility
export { formatUKMobileNumber, isValidUKMobileNumber };

// Fetch all customers
export async function getCustomers(): Promise<ApiResponse<Customer[]>> {
  try {
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .order('first_name', { ascending: true });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return { data: null, error: error as Error };
  }
}

// Fetch a single customer by ID
export async function getCustomerById(id: string): Promise<ApiResponse<Customer>> {
  try {
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching customer with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
}

// Create a new customer
export async function createCustomer(customer: CustomerFormData): Promise<ApiResponse<Customer>> {
  try {
    // Format the mobile number
    const formattedCustomer = {
      ...customer,
      mobile_number: formatUKMobileNumber(customer.mobile_number)
    };

    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .insert([formattedCustomer])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating customer:', error);
    return { data: null, error: error as Error };
  }
}

// Update an existing customer
export async function updateCustomer(id: string, customer: CustomerFormData): Promise<ApiResponse<Customer>> {
  try {
    // Format the mobile number
    const formattedCustomer = {
      ...customer,
      mobile_number: formatUKMobileNumber(customer.mobile_number)
    };

    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .update(formattedCustomer)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating customer with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
}

// Delete a customer
export async function deleteCustomer(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from(CUSTOMERS_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { data: null, error: null };
  } catch (error) {
    console.error(`Error deleting customer with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
}

// Search customers by name or mobile number
export async function searchCustomers(query: string): Promise<ApiResponse<Customer[]>> {
  try {
    // Create a search query that looks for the term in first_name, last_name, or mobile_number
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,mobile_number.ilike.%${query}%`)
      .order('first_name', { ascending: true });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error searching customers:', error);
    return { data: null, error: error as Error };
  }
} 