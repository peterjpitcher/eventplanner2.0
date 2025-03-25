import { CustomerFormData } from '@/types';

/**
 * Parse CSV data into customer objects
 */
export function parseCSV(csvData: string): {
  data: CustomerFormData[];
  errors: { row: number; error: string }[];
} {
  const lines = csvData.split('\n');
  
  // Check if there's content
  if (lines.length <= 1) {
    return { data: [], errors: [{ row: 0, error: 'No data found in CSV' }] };
  }
  
  // Parse header row
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Validate headers - we need at least first_name and mobile_number
  const requiredHeaders = ['first_name', 'mobile_number'];
  const missingHeaders = requiredHeaders.filter(h => !header.includes(h));
  
  if (missingHeaders.length > 0) {
    return { 
      data: [], 
      errors: [{ 
        row: 0, 
        error: `Missing required headers: ${missingHeaders.join(', ')}. Expected headers: first_name, last_name, mobile_number, notes` 
      }]
    };
  }
  
  // Get column indices
  const firstNameIndex = header.indexOf('first_name');
  const lastNameIndex = header.indexOf('last_name');
  const mobileNumberIndex = header.indexOf('mobile_number');
  const notesIndex = header.indexOf('notes');
  
  const customers: CustomerFormData[] = [];
  const errors: { row: number; error: string }[] = [];
  
  // Skip header, process each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Split the CSV row into values
    const values = line.split(',').map(v => v.trim());
    
    // Check if we have enough values
    if (values.length < Math.max(firstNameIndex, mobileNumberIndex) + 1) {
      errors.push({ row: i, error: 'Row has missing values' });
      continue;
    }
    
    // Create customer object
    const customer: CustomerFormData = {
      first_name: values[firstNameIndex] || '',
      last_name: lastNameIndex >= 0 ? (values[lastNameIndex] || '') : '',
      mobile_number: values[mobileNumberIndex] || '',
      notes: notesIndex >= 0 ? (values[notesIndex] || '') : ''
    };
    
    // Validate required fields
    if (!customer.first_name) {
      errors.push({ row: i, error: 'First name is required' });
      continue;
    }
    
    if (!customer.mobile_number) {
      errors.push({ row: i, error: 'Mobile number is required' });
      continue;
    }
    
    customers.push(customer);
  }
  
  return { data: customers, errors };
}

/**
 * Generate a sample CSV template for customer import
 */
export function getCSVTemplate(): string {
  return 'first_name,last_name,mobile_number,notes\nJohn,Doe,07123456789,Regular customer\nJane,Smith,07987654321,"New customer, prefers SMS"';
}

/**
 * Convert a CSV file to a string
 */
export async function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target?.result as string);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
} 