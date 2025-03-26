'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatUKMobileNumber } from '@/lib/phone-utils';
import { testTwilioConnection, checkAndEnsureSmsConfig } from '@/lib/sms-utils';

/**
 * Temporary SMS testing page
 * This page is for development and testing only and should be removed before production
 */
export default function TempSmsTestPage() {
  const [smsConfig, setSmsConfig] = useState<{
    smsEnabled: boolean;
    message: string;
    twilioAccountSid?: string;
    twilioAuthToken?: boolean;
    twilioPhoneNumber?: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageContent, setMessageContent] = useState('This is a test message from Event Planner app.');
  
  // Fetch SMS configuration on load
  useEffect(() => {
    fetchSmsConfig();
  }, []);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };
  
  const fetchSmsConfig = async () => {
    setIsLoading(true);
    try {
      addLog('Checking SMS configuration...');
      const result = await checkAndEnsureSmsConfig();
      
      const config = {
        smsEnabled: result.smsEnabled,
        message: result.message,
        twilioAccountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID?.substring(0, 10) + '...',
        twilioAuthToken: !!process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN,
        twilioPhoneNumber: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER,
      };
      
      setSmsConfig(config);
      addLog(`SMS configuration loaded: ${result.smsEnabled ? 'Enabled' : 'Disabled'}`);
      addLog(result.message);
    } catch (err: any) {
      console.error('Error checking SMS config:', err);
      addLog(`Error: ${err.message || 'Unknown error loading SMS config'}`);
      toast.error('Failed to check SMS configuration');
    } finally {
      setIsLoading(false);
    }
  };
  
  const testConnection = async () => {
    setIsTesting(true);
    
    try {
      addLog('Testing Twilio connection...');
      const result = await testTwilioConnection();
      
      if (result.success) {
        addLog(`✅ ${result.message}`);
        toast.success('Twilio connection successful');
      } else {
        addLog(`❌ ${result.error}`);
        toast.error(`Twilio connection failed: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Error testing Twilio connection:', err);
      addLog(`❌ Error: ${err.message || 'Unknown error'}`);
      toast.error('Error testing Twilio connection');
    } finally {
      setIsTesting(false);
    }
  };
  
  const sendTestMessage = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }
    
    const formattedNumber = formatUKMobileNumber(phoneNumber);
    if (!formattedNumber) {
      toast.error('Invalid phone number format');
      return;
    }
    
    setIsSending(true);
    addLog(`Attempting to send test message to ${formattedNumber}...`);
    
    try {
      const response = await fetch('/api/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          messageContent
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Test message sent successfully');
        addLog(`✅ Test message sent successfully to ${formattedNumber}`);
        addLog(`Message SID: ${result.message?.sid || 'N/A'}`);
        addLog(`Status: ${result.message?.status || 'N/A'}`);
      } else {
        toast.error(`Failed to send test message: ${result.error}`);
        addLog(`❌ Error: ${typeof result.error === 'string' ? result.error : JSON.stringify(result.error)}`);
      }
    } catch (err: any) {
      console.error('Error sending test message:', err);
      addLog(`❌ Exception: ${err.message || 'Unknown error'}`);
      toast.error('Error sending test message');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This is a temporary testing page for SMS functionality. Remove before deploying to production.
              </p>
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-6">SMS Testing Tools</h1>
        
        {/* SMS Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">SMS Configuration</h2>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : smsConfig ? (
            <div>
              <div className="flex items-center mb-4">
                <span className="font-medium mr-2">Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${smsConfig.smsEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {smsConfig.smsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <p className="mb-4">{smsConfig.message}</p>
              
              <div className="space-y-2 mb-4">
                <p><strong>Twilio Account SID:</strong> {smsConfig.twilioAccountSid || 'Not configured'}</p>
                <p><strong>Twilio Auth Token:</strong> {smsConfig.twilioAuthToken ? '••••••••' : 'Not configured'}</p>
                <p><strong>Twilio Phone Number:</strong> {smsConfig.twilioPhoneNumber || 'Not configured'}</p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={fetchSmsConfig} 
                  variant="outline"
                  disabled={isLoading}
                >
                  Refresh Config
                </Button>
                
                <Button 
                  onClick={testConnection}
                  disabled={isTesting || !smsConfig.smsEnabled}
                >
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </div>
          ) : (
            <p>Error loading configuration</p>
          )}
        </div>
        
        {/* Test Message Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Send Test Message</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                UK format (e.g., 07123456789) or international format (e.g., +447123456789)
              </p>
            </div>
            
            <div>
              <label htmlFor="messageContent" className="block text-sm font-medium text-gray-700 mb-1">
                Message Content
              </label>
              <textarea
                id="messageContent"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <Button
              onClick={sendTestMessage}
              disabled={isSending || !smsConfig?.smsEnabled || !phoneNumber}
              className="w-full"
            >
              {isSending ? 'Sending...' : 'Send Test Message'}
            </Button>
            
            {!smsConfig?.smsEnabled && (
              <p className="text-sm text-red-600">
                SMS is currently disabled. Enable it in configuration to send test messages.
              </p>
            )}
          </div>
        </div>
        
        {/* Logs */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Logs</h2>
            <Button 
              onClick={() => setLogs([])} 
              variant="outline"
              size="sm"
            >
              Clear Logs
            </Button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            ) : (
              <p className="text-gray-500">No logs yet</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 