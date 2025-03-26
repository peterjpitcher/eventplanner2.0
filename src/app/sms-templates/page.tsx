'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Modal } from '@/components/ui/modal';
import { smsService } from '@/services/sms-service';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  placeholders: string[];
}

interface PlaceholderGroup {
  title: string;
  placeholders: { name: string; description: string }[];
}

const PLACEHOLDER_GROUPS: PlaceholderGroup[] = [
  {
    title: 'Customer',
    placeholders: [
      { name: '{customer_name}', description: 'Customer\'s full name' },
      { name: '{customer_first_name}', description: 'Customer\'s first name' },
      { name: '{customer_mobile}', description: 'Customer\'s mobile number' }
    ]
  },
  {
    title: 'Event',
    placeholders: [
      { name: '{event_name}', description: 'Event title' },
      { name: '{event_date}', description: 'Event date (e.g., "January 1")' },
      { name: '{event_time}', description: 'Event time (e.g., "7 PM")' },
      { name: '{event_day_name}', description: 'Name of the day (e.g., "Monday")' },
      { name: '{venue_name}', description: 'Venue name' }
    ]
  },
  {
    title: 'Booking',
    placeholders: [
      { name: '{seats}', description: 'Number of seats booked' },
      { name: '{booking_id}', description: 'Unique booking reference' }
    ]
  }
];

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    description: 'Sent when a booking is created',
    content: 'Hi {customer_name}, your booking for {event_name} on {event_date} at {event_time} is confirmed. You have reserved {seats} seat(s). We look forward to seeing you!',
    placeholders: ['{customer_name}', '{event_name}', '{event_date}', '{event_time}', '{seats}']
  },
  {
    id: 'reminder_7day',
    name: '7-Day Reminder',
    description: 'Sent 7 days before an event',
    content: 'Hi {customer_name}, this is a reminder about {event_name} on {event_date} at {event_time}. You have {seats} seat(s) reserved. See you then!',
    placeholders: ['{customer_name}', '{event_name}', '{event_date}', '{event_time}', '{seats}']
  },
  {
    id: 'reminder_24hr',
    name: '24-Hour Reminder',
    description: 'Sent 24 hours before an event',
    content: 'Hi {customer_name}, just a reminder that {event_name} is tomorrow at {event_time}. You have {seats} seat(s) reserved. Looking forward to seeing you!',
    placeholders: ['{customer_name}', '{event_name}', '{event_time}', '{seats}']
  },
  {
    id: 'booking_cancellation',
    name: 'Booking Cancellation',
    description: 'Sent when a booking is cancelled',
    content: 'Hi {customer_name}, your booking for {event_name} on {event_date} at {event_time} has been cancelled. Please contact us if you have any questions.',
    placeholders: ['{customer_name}', '{event_name}', '{event_date}', '{event_time}']
  },
  {
    id: 'event_cancellation',
    name: 'Event Cancellation',
    description: 'Sent when an event is cancelled',
    content: 'Hi {customer_name}, we regret to inform you that {event_name} on {event_date} at {event_time} has been cancelled. We apologize for any inconvenience.',
    placeholders: ['{customer_name}', '{event_name}', '{event_date}', '{event_time}']
  }
];

export default function SMSTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testMessage, setTestMessage] = useState({
    templateId: '',
    phoneNumber: '',
    customerName: 'John Smith',
    eventName: 'Sample Event',
    eventDate: '01/01/2023',
    eventTime: '19:00',
    seats: '2'
  });
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch templates from the database
      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Convert from DB format to our format
        const loadedTemplates = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          content: item.content,
          placeholders: item.placeholders || []
        }));
        setTemplates(loadedTemplates);
      } else {
        // If no templates exist, use defaults
        setTemplates(DEFAULT_TEMPLATES);
        
        // Insert default templates if none exist
        for (const template of DEFAULT_TEMPLATES) {
          await supabase.from('sms_templates').insert({
            id: template.id,
            name: template.name,
            description: template.description,
            content: template.content,
            placeholders: template.placeholders
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message || 'Failed to load SMS templates');
      // Use defaults as fallback
      setTemplates(DEFAULT_TEMPLATES);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (template: Template) => {
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('sms_templates')
        .upsert({
          id: template.id,
          name: template.name,
          description: template.description,
          content: template.content,
          placeholders: template.placeholders
        });
      
      if (error) throw error;
      
      // Update local state
      setTemplates(prev => 
        prev.map(t => t.id === template.id ? template : t)
      );
      
      toast.success('Template saved successfully');
      setEditingTemplate(null);
    } catch (err: any) {
      console.error('Error saving template:', err);
      toast.error(err.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        content: e.target.value
      });
    }
  };

  const handleSendTestMessage = async () => {
    if (!testMessage.templateId || !testMessage.phoneNumber) {
      toast.error('Please select a template and enter a phone number');
      return;
    }

    setIsSendingTest(true);

    try {
      // Get the template content
      const template = templates.find(t => t.id === testMessage.templateId);
      
      if (!template) {
        toast.error('Selected template not found');
        return;
      }
      
      // Process the template with test data
      let content = template.content;
      content = content.replace(/{customer_name}/g, testMessage.customerName);
      content = content.replace(/{customer_first_name}/g, testMessage.customerName.split(' ')[0]);
      content = content.replace(/{event_name}/g, testMessage.eventName);
      content = content.replace(/{event_date}/g, testMessage.eventDate);
      content = content.replace(/{event_time}/g, testMessage.eventTime);
      content = content.replace(/{seats}/g, testMessage.seats);

      // Send the test message
      const result = await smsService.sendTestMessage(
        testMessage.phoneNumber,
        content
      );
      
      if (result.success) {
        toast.success('Test message sent successfully');
        setShowTestModal(false);
      } else {
        toast.error(`Failed to send test message: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Error sending test message:', err);
      toast.error(err.message || 'Failed to send test message');
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <Spinner />
          <span className="ml-2">Loading templates...</span>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert variant="error">
          {error}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={fetchTemplates}>
              Try Again
            </Button>
          </div>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold">SMS Templates</h1>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <Button onClick={() => setShowTestModal(true)} variant="outline">
              Test Message
            </Button>
            <Link href="/messages">
              <Button>View Messages</Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Template list */}
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Available Placeholders</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLACEHOLDER_GROUPS.map((group) => (
                  <div key={group.title} className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">{group.title}</h3>
                    <ul className="space-y-1">
                      {group.placeholders.map((placeholder) => (
                        <li key={placeholder.name} className="text-sm">
                          <code className="bg-gray-100 px-1 py-0.5 rounded">{placeholder.name}</code>
                          <span className="text-gray-600 ml-2">{placeholder.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            <h2 className="text-lg font-medium text-gray-900 mb-4">Templates</h2>
            <div className="space-y-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    
                    {editingTemplate?.id === template.id ? (
                      <div className="mt-2 sm:mt-0 space-x-2">
                        <Button
                          size="sm"
                          onClick={() => saveTemplate(editingTemplate)}
                          disabled={isSaving}
                        >
                          {isSaving ? <Spinner size="sm" /> : 'Save'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingTemplate(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTemplate(template)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {editingTemplate?.id === template.id ? (
                    <div className="mt-2">
                      <textarea
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={editingTemplate.content}
                        onChange={handleEditChange}
                      />
                      <div className="mt-1 text-sm text-gray-500">
                        <p>Used placeholders: {template.placeholders.join(', ')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-3 rounded border border-gray-200 mt-2">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{template.content}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Test Message Modal */}
        <Modal
          isOpen={showTestModal}
          onClose={() => setShowTestModal(false)}
          title="Send Test Message"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Template</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2"
                value={testMessage.templateId}
                onChange={(e) => setTestMessage({...testMessage, templateId: e.target.value})}
              >
                <option value="">Select a template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Enter UK mobile number"
                value={testMessage.phoneNumber}
                onChange={(e) => setTestMessage({...testMessage, phoneNumber: e.target.value})}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Test Data (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1">Customer Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={testMessage.customerName}
                    onChange={(e) => setTestMessage({...testMessage, customerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Event Name</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={testMessage.eventName}
                    onChange={(e) => setTestMessage({...testMessage, eventName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Event Date</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={testMessage.eventDate}
                    onChange={(e) => setTestMessage({...testMessage, eventDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Event Time</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={testMessage.eventTime}
                    onChange={(e) => setTestMessage({...testMessage, eventTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Seats</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={testMessage.seats}
                    onChange={(e) => setTestMessage({...testMessage, seats: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowTestModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendTestMessage} 
                disabled={isSendingTest || !testMessage.templateId || !testMessage.phoneNumber}
              >
                {isSendingTest ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Send Test
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
} 