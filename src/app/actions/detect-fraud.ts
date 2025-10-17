'use server';

import { paymentFraudDetection, type PaymentFraudDetectionInput } from '@/ai/flows/payment-fraud-detection';

export async function detectFraud(input: PaymentFraudDetectionInput) {
  try {
    const result = await paymentFraudDetection(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in fraud detection flow:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
