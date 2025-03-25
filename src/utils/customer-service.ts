import { supabase } from '@/lib/supabase';
import { Customer, CustomerFormData, ApiResponse } from '@/types';

export const CUSTOMERS_TABLE = 'customers';

// Function to format and validate UK mobile numbers
export function formatUKMobileNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle different UK phone number formats
  if (cleaned.startsWith('44') && cleaned.length >= 11) {
    // Convert +44 format to 0 format
    return '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // Already in correct format
    return cleaned;
  } else {
    // Return original if not matching expected patterns
    return phoneNumber;
  }
}

// Function to validate UK mobile number
export function isValidUKMobileNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // UK mobile numbers start with '07' and are 11 digits long
  if (cleaned.startsWith('07') && cleaned.length === 11) {
    return true;
  }
  
  // Alternative format: +44 7xxx xxxxxx (cleaned would be 447xxxxxxxxx)
  if (cleaned.startsWith('447') && cleaned.length === 12) {
    return true;
  }
  
  return false;
}

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