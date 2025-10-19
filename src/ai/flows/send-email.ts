'use server';
/**
 * @fileOverview A Genkit flow for sending print distribution emails.
 *
 * This file defines a Genkit flow that composes and sends an email
 * to a student when they receive a print distribution.
 */

import { ai } from '@/ai/genkit';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

export const SendEmailInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  studentEmail: z.string().email().describe('The email address of the student.'),
  eventName: z.string().describe('The name of the event for which the print was distributed.'),
});

export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export const SendEmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type SendEmailOutput = z.infer<typeof SendEmailOutputSchema>;

const emailPrompt = ai.definePrompt({
    name: 'emailPrompt',
    input: { schema: SendEmailInputSchema },
    prompt: `
      You are an assistant for the FundEd platform.
      Generate a friendly and professional email body to notify a student that their print material is ready and has been distributed.

      The student's name is: {{{studentName}}}.
      The event is: {{{eventName}}}.

      The email should:
      1. Greet the student by name.
      2. Clearly state that their print material for the specified event has been distributed.
      3. Be concise and polite.
      4. End with "Sincerely, The FundEd Team".

      Do not include a subject line.
    `,
});


export const sendPrintDistributionEmailFlow = ai.defineFlow(
  {
    name: 'sendPrintDistributionEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: SendEmailOutputSchema,
  },
  async (input) => {

    const { text: emailBody } = await emailPrompt(input);

    if (!emailBody) {
        return {
            success: false,
            message: 'Failed to generate email content.',
        };
    }

    const subject = `Your print for "${input.eventName}" has been distributed!`;
    
    // Use the new email service to send the email.
    const result = await sendEmail({
        to: input.studentEmail,
        subject: subject,
        html: emailBody.replace(/\n/g, '<br>'), // Convert newlines to breaks for HTML email
    });

    if (result.success) {
        return {
            success: true,
            message: `Email successfully sent to ${input.studentEmail}.`,
        };
    } else {
        return {
            success: false,
            message: result.message || 'Failed to send email via the email service.',
        };
    }
  }
);
