import { studioService } from './studio-service';
import { createLogger } from '@/lib/logger';

const logger = createLogger('test-studio-flow');

async function testStudioFlow() {
  try {
    // Test phone number (replace with your test number)
    const testNumber = process.env.TEST_PHONE_NUMBER;
    
    if (!testNumber) {
      throw new Error('TEST_PHONE_NUMBER environment variable not set');
    }

    // Test data
    const testData = {
      customerName: 'Test Customer',
      eventName: 'Quiz Night',
      eventDate: new Date('2024-04-02T19:00:00'),
      seats: 2
    };

    logger.info('Testing Twilio Studio flow with data:', testData);

    // Trigger the flow
    const result = await studioService.sendBookingConfirmation(
      testNumber,
      testData.customerName,
      testData.eventName,
      testData.eventDate,
      testData.seats
    );

    if (result.success) {
      logger.info('Successfully triggered Studio flow:', {
        execution_sid: result.execution_sid
      });
    } else {
      logger.error('Failed to trigger Studio flow:', result.error);
    }
  } catch (error) {
    logger.error('Error running test:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  testStudioFlow();
} 