// Customer types
export interface Customer {
  id: string;
  first_name: string;
  last_name: string | null;
  mobile_number: string;
  notes: string | null;
  created_at: string;
}

export interface CustomerFormData {
  first_name: string;
  last_name: string;
  mobile_number: string;
  notes: string;
}

// Utility types
export type ApiResponse<T> = {
  data: T | null;
  error: Error | null;
}; 