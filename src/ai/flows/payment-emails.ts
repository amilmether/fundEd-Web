'use server';
/**
 * @fileOverview Genkit flows for sending payment-related emails.
 */

import { ai } from '@/ai/genkit';
import { sendEmail } from '@/lib/email';
import { 
    PaymentConfirmationEmailInputSchema, 
    PaymentApprovedEmailInputSchema, 
    SendEmailOutputSchema,
    type PaymentConfirmationEmailInput, 
    type PaymentApprovedEmailInput,
    type SendEmailOutput
} from '@/lib/types';


// Wrapper action for the payment confirmation flow
export async function sendPaymentConfirmationEmail(input: PaymentConfirmationEmailInput): Promise<SendEmailOutput> {
  return await sendPaymentConfirmationEmailFlow(input);
}

// Wrapper action for the payment approved flow
export async function sendPaymentApprovedEmail(input: PaymentApprovedEmailInput): Promise<SendEmailOutput> {
  return await sendPaymentApprovedEmailFlow(input);
}


// Prompt for initial payment submission
const paymentConfirmationPrompt = ai.definePrompt({
    name: 'paymentConfirmationPrompt',
    input: { schema: PaymentConfirmationEmailInputSchema },
    prompt: `
      You are an assistant for the FundEd platform.
      Generate a friendly email body to confirm that a student's payment has been submitted for verification.

      Student's name: {{{studentName}}}.
      Event: {{{eventName}}}.
      Amount: {{{amount}}}.
      Payment Method: {{{paymentMethod}}}.

      The email should:
      1. Greet the student by name.
      2. Confirm that their payment for the specified event and amount has been submitted.
      3. Mention that it is now pending verification by their class representative.
      4. Be concise and polite.
      5. End with "Sincerely, The FundEd Team".

      Do not include a subject line.
    `,
});

// Prompt for when payment is approved by a rep
const paymentApprovedPrompt = ai.definePrompt({
    name: 'paymentApprovedPrompt',
    input: { schema: PaymentApprovedEmailInputSchema },
    prompt: `
      You are an assistant for the FundEd platform.
      Generate a friendly email body to notify a student that their payment has been approved.

      Student's name: {{{studentName}}}.
      Event: {{{eventName}}}.
      Amount: {{{amount}}}.

      The email should:
      1. Greet the student by name.
      2. Joyfully inform them that their payment for the specified event has been approved by their class representative.
      3. Mention the event name and amount.
      4. Be concise and polite.
      5. End with "Sincerely, The FundEd Team".

      Do not include a subject line.
    `,
});

// Flow for sending payment confirmation email
const sendPaymentConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'sendPaymentConfirmationEmailFlow',
    inputSchema: PaymentConfirmationEmailInputSchema,
    outputSchema: SendEmailOutputSchema,
  },
  async (input) => {
    const { text: emailBody } = await paymentConfirmationPrompt(input);

    if (!emailBody) {
        return { success: false, message: 'Failed to generate email content.' };
    }

    const subject = `Your payment for "${input.eventName}" has been submitted`;
    
    const result = await sendEmail({
        to: input.studentEmail,
        subject: subject,
        html: emailBody.replace(/\n/g, '<br>'),
    });

    return result.success 
        ? { success: true, message: `Email successfully sent to ${input.studentEmail}.` }
        : { success: false, message: result.message || 'Failed to send email.' };
  }
);


// Flow for sending payment approved email
const sendPaymentApprovedEmailFlow = ai.defineFlow(
  {
    name: 'sendPaymentApprovedEmailFlow',
    inputSchema: PaymentApprovedEmailInputSchema,
    outputSchema: SendEmailOutputSchema,
  },
  async (input) => {
    const { text: emailBody } = await paymentApprovedPrompt(input);

    if (!emailBody) {
        return { success: false, message: 'Failed to generate email content.' };
    }

    const subject = `Your payment for "${input.eventName}" has been approved!`;
    
    const result = await sendEmail({
        to: input.studentEmail,
        subject: subject,
        html: emailBody.replace(/\n/g, '<br>'),
    });

    return result.success 
        ? { success: true, message: `Email successfully sent to ${input.studentEmail}.` }
        : { success: false, message: result.message || 'Failed to send email.' };
  }
);
