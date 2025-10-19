'use server';

import { sendPrintDistributionEmail as sendPrintDistributionEmailFlow } from '@/ai/flows/send-email';
import { sendPaymentConfirmationEmail as sendPaymentConfirmationEmailFlow, sendPaymentApprovedEmail as sendPaymentApprovedEmailFlow } from '@/ai/flows/payment-emails';
import type { SendEmailInput, SendEmailOutput, PaymentConfirmationEmailInput, PaymentApprovedEmailInput } from '@/lib/types';


export async function sendPrintDistributionEmail(input: SendEmailInput): Promise<SendEmailOutput> {
  return await sendPrintDistributionEmailFlow(input);
}


export async function sendPaymentConfirmationEmail(input: PaymentConfirmationEmailInput): Promise<SendEmailOutput> {
    return await sendPaymentConfirmationEmailFlow(input);
}

export async function sendPaymentApprovedEmail(input: PaymentApprovedEmailInput): Promise<SendEmailOutput> {
    return await sendPaymentApprovedEmailFlow(input);
}
