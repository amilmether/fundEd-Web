import { Timestamp } from "firebase/firestore";
import { z } from 'zod';

export type Payment = {
  id: string;
  studentId: string;
  studentName: string; // denormalized for easier display
  studentRoll: string; // denormalized
  eventId: string;
  eventName: string; // denormalized
  amount: number;
  paymentDate: Timestamp | Date | string;
  transactionId: string;
  status: 'Paid' | 'Pending' | 'Failed' | 'Verification Pending';
  paymentMethod: 'Razorpay' | 'QR Scan' | 'Cash' | 'N/A';
  screenshotUrl?: string;
};

// Re-exporting Payment as Transaction for backwards compatibility in some components
export type Transaction = Payment;

export type Event = {
  id: string;
  name: string;
  description: string;
  deadline: Timestamp | Date | string;
  cost: number;
  totalCollected: number;
  totalPending: number;
  paymentOptions: ('Razorpay' | 'QR' | 'Cash')[];
  qrCodeUrl?: string;
  category: 'Normal' | 'Print';
};

export type Student = {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  class: string;
};

export type QrCode = {
  id: string;
  name: string;
  url: string;
};

export type PrintDistribution = {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  eventId: string;
  distributedAt: Timestamp | Date | string;
};

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
