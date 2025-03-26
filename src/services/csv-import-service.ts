/**
 * CSV Import Service for Customer Data
 * Handles parsing, validation, and batch insertion of customer data from CSV files
 */

import { Customer, CustomerFormData } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatUKMobileNumber, isValidUKMobileNumber } from '@/lib/phone-utils';

// Expected column headers in the CSV file
export const EXPECTED_HEADERS = ['first_name', 'last_name', 'mobile_number', 'notes'];

// Custom type to represent validation results
export interface CustomerImportValidation {
  isValid: boolean;
  customer: CustomerFormData;
  errors: {
    [key: string]: string;
  };
  rowNumber: number;
}

export interface ImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: CustomerImportValidation[];
}

export const csvImportService = {
  /**
   * Parse a CSV file into customer data
   */
  async parseCSV(file: File): Promise<{ data: string[][], headers: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            throw new Error('Could not read file content');
          }
          
          // Split into rows
          const rows = content.split(/\r?\n/).filter(row => row.trim());
          
          // Parse CSV rows into arrays
          const parsedRows = rows.map(row => {
            // Handle quoted values with commas inside
            const rowData: string[] = [];
            let inQuotes = false;
            let currentValue = '';
            
            for (let i = 0; i < row.length; i++) {
              const char = row[i];
              
              if (char === '"' && (i === 0 || row[i-1] !== '\\')) {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                rowData.push(currentValue.trim());
                currentValue = '';
              } else {
                currentValue += char;
              }
            }
            
            // Add the last value
            rowData.push(currentValue.trim());
            
            return rowData;
          });
          
          // Extract headers (first row)
          const headers = parsedRows[0].map(header => 
            header.toLowerCase().replace(/[^a-z0-9_]/g, '_')
          );
          
          // Return parsed data and headers
          resolve({ 
            data: parsedRows.slice(1), // Remove header row
            headers 
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading the file'));
      };
      
      reader.readAsText(file);
    });
  },
  
  /**
   * Validate customer data from CSV
   */
  validateCustomerData(rowData: string[], headers: string[], rowNumber: number): CustomerImportValidation {
    const customerData: CustomerFormData = {
      first_name: '',
      last_name: '',
      mobile_number: '',
      notes: ''
    };
    
    const errors: { [key: string]: string } = {};
    
    // Map CSV data to customer fields based on headers
    headers.forEach((header, index) => {
      if (EXPECTED_HEADERS.includes(header) && index < rowData.length) {
        customerData[header as keyof CustomerFormData] = rowData[index].replace(/^"(.*)"$/, '$1').trim();
      }
    });
    
    // Validate required fields
    if (!customerData.first_name) {
      errors.first_name = 'First name is required';
    }
    
    // Validate mobile number
    if (!customerData.mobile_number) {
      errors.mobile_number = 'Mobile number is required';
    } else {
      // Format the mobile number
      customerData.mobile_number = formatUKMobileNumber(customerData.mobile_number);
      
      // Check if it's valid
      if (!isValidUKMobileNumber(customerData.mobile_number)) {
        errors.mobile_number = 'Invalid UK mobile number format';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      customer: customerData,
      errors,
      rowNumber
    };
  },
  
  /**
   * Perform batch insertion of validated customer data
   */
  async batchInsertCustomers(validatedData: CustomerImportValidation[]): Promise<ImportResult> {
    const validCustomers = validatedData.filter(item => item.isValid).map(item => item.customer);
    const invalidCustomers = validatedData.filter(item => !item.isValid);
    
    const result: ImportResult = {
      totalRows: validatedData.length,
      successfulImports: 0,
      failedImports: invalidCustomers.length,
      errors: invalidCustomers
    };
    
    if (validCustomers.length === 0) {
      return result;
    }
    
    try {
      // Insert valid customers in batches of 50
      const batchSize = 50;
      let successCount = 0;
      
      for (let i = 0; i < validCustomers.length; i += batchSize) {
        const batch = validCustomers.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from('customers')
          .insert(batch)
          .select();
          
        if (!error) {
          successCount += (data?.length || 0);
        } else {
          console.error('Error inserting batch:', error);
          result.failedImports += batch.length;
        }
      }
      
      result.successfulImports = successCount;
      result.failedImports = validatedData.length - successCount;
      
      return result;
    } catch (error) {
      console.error('Error in batch insert:', error);
      return {
        ...result,
        successfulImports: 0,
        failedImports: validatedData.length
      };
    }
  },
  
  /**
   * Check if there are duplicate mobile numbers in the import data or existing database
   */
  async checkDuplicateMobileNumbers(customers: CustomerFormData[]): Promise<{ [key: string]: boolean }> {
    const mobileNumbers = customers.map(c => c.mobile_number);
    const uniqueMobileNumbers = Array.from(new Set(mobileNumbers));
    
    // Check for duplicates within the import data
    const duplicatesInImport: { [key: string]: boolean } = {};
    mobileNumbers.forEach(number => {
      if (mobileNumbers.filter(n => n === number).length > 1) {
        duplicatesInImport[number] = true;
      }
    });
    
    // Check for duplicates in the database
    const { data } = await supabase
      .from('customers')
      .select('mobile_number')
      .in('mobile_number', uniqueMobileNumbers);
    
    const existingNumbers = (data || []).map(c => c.mobile_number);
    
    // Combine duplicates
    const allDuplicates: { [key: string]: boolean } = {...duplicatesInImport};
    existingNumbers.forEach(number => {
      allDuplicates[number] = true;
    });
    
    return allDuplicates;
  },
  
  /**
   * Process a CSV file: parse, validate, and return preview data
   */
  async processCSVFile(file: File): Promise<{
    validatedData: CustomerImportValidation[];
    validCount: number;
    invalidCount: number;
    duplicateNumbers: { [key: string]: boolean };
  }> {
    try {
      // Parse the CSV file
      const { data, headers } = await this.parseCSV(file);
      
      // Check if required headers are present
      const missingHeaders = EXPECTED_HEADERS.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }
      
      // Validate each row
      const validatedData = data.map((row, index) => 
        this.validateCustomerData(row, headers, index + 1)
      );
      
      // Count valid and invalid entries
      const validEntries = validatedData.filter(item => item.isValid);
      const invalidCount = validatedData.length - validEntries.length;
      
      // Check for duplicate mobile numbers
      const duplicateNumbers = await this.checkDuplicateMobileNumbers(
        validatedData.map(item => item.customer)
      );
      
      // Mark duplicates as invalid
      validatedData.forEach(item => {
        if (duplicateNumbers[item.customer.mobile_number]) {
          item.isValid = false;
          item.errors.mobile_number = 'Duplicate mobile number';
        }
      });
      
      // Recount valid entries after checking duplicates
      const validCount = validatedData.filter(item => item.isValid).length;
      
      return {
        validatedData,
        validCount,
        invalidCount: validatedData.length - validCount,
        duplicateNumbers
      };
    } catch (error) {
      console.error('Error processing CSV file:', error);
      throw error;
    }
  }
};

export default csvImportService; 