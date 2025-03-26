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
      console.log(`Attempting to delete customer with ID: ${id}`);
      
      // First check if the customer exists to provide better error messages
      const { data: existingCustomer, error: checkError } = await supabase
        .from(CUSTOMERS_TABLE)
        .select('id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.error(`Customer with ID ${id} not found for deletion`);
          return { 
            data: null, 
            error: new Error(`Customer with ID ${id} not found`) 
          };
        }
        throw checkError;
      }
      
      // Check for related bookings before deletion
      const { data: relatedBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_id', id)
        .limit(1);
      
      if (bookingsError) {
        console.error(`Error checking related bookings for customer ${id}:`, bookingsError);
        // We won't proceed with deletion if we can't check for related bookings
        throw bookingsError;
      } 
      
      if (relatedBookings && relatedBookings.length > 0) {
        console.warn(`Customer ${id} has related bookings. Deletion will be rejected due to foreign key constraints.`);
        return {
          data: null,
          error: new Error('Cannot delete customer with existing bookings. Please delete all bookings for this customer first.')
        };
      }
      
      // Perform the actual deletion
      const { data: deletedData, error: deleteError } = await supabase
        .from(CUSTOMERS_TABLE)
        .delete()
        .eq('id', id)
        .select();
      
      if (deleteError) {
        console.error(`Error during customer deletion for ID ${id}:`, deleteError);
        
        // Check for foreign key violation
        if (deleteError.code === '23503') { // Foreign key violation
          return { 
            data: null, 
            error: new Error('Cannot delete customer with existing bookings. Remove bookings first.') 
          };
        }
        
        throw deleteError;
      }
      
      // In latest Supabase versions, delete with select() returns the deleted rows
      if (!deletedData || deletedData.length === 0) {
        console.warn(`No customer was deleted with ID ${id}`);
        return {
          data: null,
          error: new Error(`Customer with ID ${id} was not deleted. Verify the customer exists.`)
        };
      }
      
      console.log(`Successfully deleted customer with ID: ${id}`);
      return { data: null, error: null };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { 
        data: null, 
        error: error instanceof Error 
          ? error 
          : new Error('Failed to delete customer due to an unknown error') 
      };
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