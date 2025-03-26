import { supabase } from '@/lib/supabase';
import { Customer, CustomerFormData, ApiResponse } from '@/types';
import { formatUKMobileNumber, isValidUKMobileNumber } from '@/lib/phone-utils';

// Export the phone utils for convenience
export { formatUKMobileNumber, isValidUKMobileNumber };

export const CUSTOMERS_TABLE = 'customers';

export const customerService = {
  /**
   * Format a UK mobile number
   */
  formatUKMobileNumber,
  
  /**
   * Validate a UK mobile number
   */
  isValidUKMobileNumber,

  /**
   * Get all customers
   */
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
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
  },

  /**
   * Get a single customer by ID
   */
  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
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
  },

  /**
   * Create a new customer
   */
  async createCustomer(customer: CustomerFormData): Promise<ApiResponse<Customer>> {
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
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, customer: CustomerFormData): Promise<ApiResponse<Customer>> {
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
      console.error('Error updating customer:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Delete a customer
   */
  async deleteCustomer(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from(CUSTOMERS_TABLE)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { data: null, error: null };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Search customers by name or mobile number
   */
  async searchCustomers(query: string): Promise<ApiResponse<Customer[]>> {
    try {
      if (!query) {
        return this.getCustomers();
      }

      // Check if we have a type-specific search
      const typeMatch = query.match(/^(name|mobile):(.*)/);
      let searchQuery = supabase.from(CUSTOMERS_TABLE).select('*');

      if (typeMatch) {
        const [, searchType, searchTerm] = typeMatch;
        
        // Search by specific field type
        if (searchType === 'name') {
          searchQuery = searchQuery.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
        } else if (searchType === 'mobile') {
          // For mobile search, standardize the format to match database format
          const formattedMobile = formatUKMobileNumber(searchTerm);
          searchQuery = searchQuery.ilike('mobile_number', `%${formattedMobile}%`);
        }
      } else {
        // General search across all fields
        searchQuery = searchQuery.or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%,mobile_number.ilike.%${query}%`
        );
      }
      
      // Apply ordering
      const { data, error } = await searchQuery.order('first_name', { ascending: true });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error searching customers:', error);
      return { data: null, error: error as Error };
    }
  }
};

export default customerService; 