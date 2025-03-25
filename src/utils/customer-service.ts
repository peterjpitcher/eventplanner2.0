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

// Bulk import customers from CSV data
export interface CustomerImportResult {
  successful: number;
  failed: number;
  errors: { row: number; error: string }[];
  validationErrors: { row: number; error: string }[];
}

export async function importCustomers(customers: CustomerFormData[]): Promise<ApiResponse<CustomerImportResult>> {
  try {
    if (!customers.length) {
      return { 
        data: { successful: 0, failed: 0, errors: [], validationErrors: [] }, 
        error: null 
      };
    }

    // Format mobile numbers for all customers
    const formattedCustomers = customers.map(customer => ({
      ...customer,
      mobile_number: formatUKMobileNumber(customer.mobile_number)
    }));

    // Validate all customers before insertion
    const validationErrors: { row: number; error: string }[] = [];
    formattedCustomers.forEach((customer, index) => {
      if (!customer.first_name) {
        validationErrors.push({ row: index, error: 'First name is required' });
      }
      if (!isValidUKMobileNumber(customer.mobile_number)) {
        validationErrors.push({ row: index, error: 'Invalid UK mobile number' });
      }
    });

    if (validationErrors.length > 0) {
      return { 
        data: { 
          successful: 0, 
          failed: customers.length, 
          errors: [], 
          validationErrors 
        }, 
        error: null 
      };
    }

    // Insert all customers
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .insert(formattedCustomers)
      .select();
    
    if (error) throw error;
    
    return { 
      data: { 
        successful: data.length, 
        failed: customers.length - data.length, 
        errors: [],
        validationErrors: [] 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error bulk importing customers:', error);
    return { 
      data: { successful: 0, failed: customers.length, errors: [{ row: -1, error: (error as Error).message }], validationErrors: [] }, 
      error: error as Error 
    };
  }
}

// Check if a customer with the given mobile number already exists
export async function checkDuplicateCustomer(mobileNumber: string): Promise<ApiResponse<boolean>> {
  try {
    const formattedNumber = formatUKMobileNumber(mobileNumber);
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('id')
      .eq('mobile_number', formattedNumber)
      .limit(1);
    
    if (error) throw error;
    
    return { data: data.length > 0, error: null };
  } catch (error) {
    console.error('Error checking for duplicate customer:', error);
    return { data: false, error: error as Error };
  }
} 