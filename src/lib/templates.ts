import { supabase } from './supabase';

export type TemplateData = {
  [key: string]: string | number | Date | undefined;
};

/**
 * Loads an SMS template from the database
 */
export async function loadTemplate(templateId: string): Promise<{ content: string; placeholders: string[] } | null> {
  const { data, error } = await supabase
    .from('sms_templates')
    .select('content, placeholders')
    .eq('id', templateId)
    .single();
  
  if (error || !data) {
    console.error('Error loading template:', templateId, error);
    return null;
  }
  
  return {
    content: data.content,
    placeholders: data.placeholders
  };
}

/**
 * Processes a template by replacing placeholders with actual values
 * Placeholders are in the format {placeholder_name}
 */
export function processTemplate(template: string, data: TemplateData): string {
  // Replace all {variable} placeholders with their values
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    // Get the value for this key
    const value = data[key.trim()];
    
    // Handle undefined or null values
    if (value === undefined || value === null) {
      console.warn(`Template placeholder ${key} has no value`);
      return '';
    }
    
    // Format Date objects properly
    if (value instanceof Date) {
      return formatDate(value);
    }
    
    // Return the value as a string
    return String(value);
  });
}

/**
 * Format a date for templates
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Get a list of all template names and descriptions
 */
export async function getAllTemplates() {
  const { data, error } = await supabase
    .from('sms_templates')
    .select('id, name, description')
    .order('name');
  
  if (error) {
    console.error('Error getting templates:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get details for a specific template 
 */
export async function getTemplateDetails(templateId: string) {
  const { data, error } = await supabase
    .from('sms_templates')
    .select('*')
    .eq('id', templateId)
    .single();
  
  if (error) {
    console.error('Error getting template details:', error);
    return null;
  }
  
  return data;
}

/**
 * Update a template's content
 */
export async function updateTemplate(templateId: string, content: string, description?: string) {
  const updateData: {content: string, description?: string} = { content };
  
  if (description !== undefined) {
    updateData.description = description;
  }
  
  const { data, error } = await supabase
    .from('sms_templates')
    .update(updateData)
    .eq('id', templateId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating template:', error);
    return { success: false, error };
  }
  
  return { success: true, template: data };
}

/**
 * Generate a preview of the template with test data
 */
export function generateTemplatePreview(templateContent: string): string {
  const testData: TemplateData = {
    customer_name: 'John Smith',
    event_name: 'Wine Tasting Evening',
    event_date: 'Friday, 15th April 2025',
    event_time: '7:00 PM',
    seats: '2',
    venue: 'The Main Hall'
  };
  
  return processTemplate(templateContent, testData);
}

/**
 * Get all available placeholders with descriptions
 */
export function getAvailablePlaceholders(): {name: string, description: string}[] {
  return [
    { name: 'customer_name', description: 'Full name of the customer' },
    { name: 'event_name', description: 'Name of the event' },
    { name: 'event_date', description: 'Date of the event' },
    { name: 'event_time', description: 'Start time of the event' },
    { name: 'seats', description: 'Number of seats booked' },
    { name: 'venue', description: 'Venue or location of the event' }
  ];
} 