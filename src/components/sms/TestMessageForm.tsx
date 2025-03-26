'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { SMSService } from '@/services/sms-service';
import { processTemplate } from '@/lib/templates';
import { formatPhoneNumber } from '@/lib/phone-utils';

interface TestMessageFormProps {
  templateId: string;
  templateName: string;
}

export default function TestMessageForm({ templateId, templateName }: TestMessageFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const smsService = new SMSService();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: 'Phone Number Required',
        description: 'Please enter a valid phone number to send a test message.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format the phone number
      const formattedNumber = formatPhoneNumber(phoneNumber);
      
      // Generate test data based on template type
      let testData = generateTestData(templateName);
      
      // Process the template with test data
      const messageContent = await processTemplate(templateId, testData);
      
      // Send the test message
      await smsService.sendTestMessage(formattedNumber, messageContent);
      
      toast({
        title: 'Test Message Sent',
        description: `A test message has been sent to ${formattedNumber}.`,
      });
      
      // Reset form
      setPhoneNumber('');
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: 'Error Sending Message',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate test data based on the template type
  const generateTestData = (templateName: string) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };
    
    // Basic test data that works with most templates
    const testData = {
      customer_name: 'John Smith',
      event_name: 'Test Event',
      event_date: formatDate(tomorrow),
      event_time: formatTime(tomorrow),
      seats: '2',
      venue: 'Test Venue',
      cancellation_reason: 'Schedule change',
      booking_reference: 'TEST123'
    };
    
    return testData;
  };
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-4">
        Send a test message using this template with sample data to verify how it will appear.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Recipient Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+44 7700 900000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Enter a valid phone number including country code, e.g. +447700900000
          </p>
        </div>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current rounded-full border-t-transparent"></div>
              Sending...
            </>
          ) : (
            'Send Test Message'
          )}
        </Button>
      </form>
    </div>
  );
} 