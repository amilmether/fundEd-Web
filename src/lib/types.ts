import { Timestamp } from "firebase/firestore";

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
