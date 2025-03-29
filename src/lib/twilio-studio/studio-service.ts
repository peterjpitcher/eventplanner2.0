import { createLogger } from '@/lib/logger';
import { format } from 'date-fns';

const logger = createLogger('twilio-studio-service');

interface StudioExecutionPayload {
  customer_name: string;
  event_name: string;
  event_date: string;
  event_time: string;
  seats: string;
}

interface StudioExecutionResponse {
  success: boolean;
  error?: string;
  execution_sid?: string;
}

export class TwilioStudioService {
  private flowSid: string;
  private accountSid: string;
  private authToken: string;
  private baseUrl: string;

  constructor() {
    this.flowSid = process.env.TWILIO_FLOW_SID || '';
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.baseUrl = `https://studio.twilio.com/v2/Flows/${this.flowSid}/Executions`;

    if (!this.flowSid || !this.accountSid || !this.authToken) {
      logger.warn('Twilio Studio credentials not fully configured');
    }
  }

  /**
   * Trigger a Twilio Studio flow execution
   */
  async triggerFlow(
    to: string,
    payload: StudioExecutionPayload
  ): Promise<StudioExecutionResponse> {
    try {
      if (!this.flowSid || !this.accountSid || !this.authToken) {
        throw new Error('Twilio Studio credentials not configured');
      }

      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: 'The Anchor',
          Parameters: JSON.stringify(payload)
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to trigger Studio flow: ${error}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        execution_sid: result.sid
      };
    } catch (error) {
      logger.error('Error triggering Studio flow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send a booking confirmation via Twilio Studio
   */
  async sendBookingConfirmation(
    to: string,
    customerName: string,
    eventName: string,
    eventDate: Date,
    seats: number
  ): Promise<StudioExecutionResponse> {
    const payload: StudioExecutionPayload = {
      customer_name: customerName,
      event_name: eventName,
      event_date: format(eventDate, 'dd/MM/yyyy'),
      event_time: format(eventDate, 'HH:mm'),
      seats: seats.toString()
    };

    return this.triggerFlow(to, payload);
  }
}

// Export a singleton instance
export const studioService = new TwilioStudioService(); 