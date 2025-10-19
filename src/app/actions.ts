'use server';

import { sendPrintDistributionEmail as sendPrintDistributionEmailFlow } from '@/ai/flows/send-email';
import type { SendEmailInput, SendEmailOutput } from '@/lib/types';

/**
 * Server action to trigger the print distribution email flow.
 * @param input The data required to send the email.
 * @returns The result of the flow execution.
 */
export async function sendPrintDistributionEmail(input: SendEmailInput): Promise<SendEmailOutput> {
  return await sendPrintDistributionEmailFlow(input);
}
