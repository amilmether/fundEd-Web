export type Transaction = {
  id: string;
  studentName: string;
  studentRoll: string;
  eventName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed' | 'Verification Pending';
  paymentMethod: 'Razorpay' | 'QR Scan' | 'Cash' | 'N/A';
};

export type Event = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  cost: number;
  totalCollected: number;
  totalPending: number;
  paymentOptions: ('Razorpay' | 'QR' | 'Cash')[];
  qrCodeUrl?: string;
};

export type Student = {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  class: string;
};
