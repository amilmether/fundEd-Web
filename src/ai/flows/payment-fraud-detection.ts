'use server';

/**
 * @fileOverview Payment fraud detection flow.
 *
 * - paymentFraudDetection - A function that analyzes payment data and flags potentially fraudulent activities.
 * - PaymentFraudDetectionInput - The input type for the paymentFraudDetection function.
 * - PaymentFraudDetectionOutput - The return type for the paymentFraudDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PaymentFraudDetectionInputSchema = z.object({
  paymentData: z.string().describe('Payment data including transaction ID, amount, timestamp.'),
  screenshotDataUri: z
    .string()
    .optional()
    .describe(
      "A screenshot of the payment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  studentInfo: z.string().describe('Student information, including roll number, name and email'),
  eventDetails: z.string().describe('Event details including name, cost and deadline'),
});
export type PaymentFraudDetectionInput = z.infer<typeof PaymentFraudDetectionInputSchema>;

const PaymentFraudDetectionOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the payment is potentially fraudulent.'),
  fraudExplanation: z.string().describe('Explanation of why the payment is flagged as fraudulent.'),
});
export type PaymentFraudDetectionOutput = z.infer<typeof PaymentFraudDetectionOutputSchema>;

export async function paymentFraudDetection(
  input: PaymentFraudDetectionInput
): Promise<PaymentFraudDetectionOutput> {
  return paymentFraudDetectionFlow(input);
}

const paymentFraudDetectionPrompt = ai.definePrompt({
  name: 'paymentFraudDetectionPrompt',
  input: {schema: PaymentFraudDetectionInputSchema},
  output: {schema: PaymentFraudDetectionOutputSchema},
  prompt: `You are an AI assistant specializing in detecting fraudulent payment activities.

  Analyze the provided payment data, student information, and event details to determine if the payment is potentially fraudulent.
  Consider factors such as unusual payment amounts, discrepancies between the payment data and student information, and suspicious screenshot uploads.

  Provide a detailed explanation for your determination.

  Payment Data: {{{paymentData}}}
  Student Info: {{{studentInfo}}}
  Event Details: {{{eventDetails}}}
  Screenshot: {{#if screenshotDataUri}}{{media url=screenshotDataUri}}{{else}}No screenshot provided{{/if}}

  Based on this information, determine if the payment is fraudulent and provide a detailed explanation.
  Set the isFraudulent field to true if you detect fraud, otherwise, set it to false.
`,
});

const paymentFraudDetectionFlow = ai.defineFlow(
  {
    name: 'paymentFraudDetectionFlow',
    inputSchema: PaymentFraudDetectionInputSchema,
    outputSchema: PaymentFraudDetectionOutputSchema,
  },
  async input => {
    const {output} = await paymentFraudDetectionPrompt(input);
    return output!;
  }
);
