import type { Transaction, Event, Student, QrCode, PrintDistribution } from './types';

export const transactions: Transaction[] = [
  {
    id: 'TXN55467',
    studentName: 'Sneha Patel',
    studentRoll: 'B-32',
    eventName: 'Industrial Visit',
    amount: 1200,
    date: '2023-10-24',
    status: 'Paid',
    paymentMethod: 'Razorpay',
  },
  {
    id: 'TXN33219',
    studentName: 'Vikram Rathod',
    studentRoll: 'C-11',
    eventName: 'Sports Day Kit',
    amount: 250,
    date: '2023-10-23',
    status: 'Failed',
    paymentMethod: 'Razorpay',
  },
    {
    id: 'TXN88765',
    studentName: 'Anjali Gupta',
    studentRoll: 'A-02',
    eventName: 'Annual Tech Fest',
    amount: 500,
    date: '2023-10-22',
    status: 'Verification Pending',
    paymentMethod: 'Cash',
  },
  {
    id: 'TXN94321',
    studentName: 'Priya Singh',
    studentRoll: 'C-05',
    eventName: 'Sports Day Kit',
    amount: 250,
    date: '2023-10-25',
    status: 'Verification Pending',
    paymentMethod: 'QR Scan',
  },
  {
    id: 'TXN11223',
    studentName: 'Rohan Sharma',
    studentRoll: 'B-21',
    eventName: 'Workshop Prints',
    amount: 150,
    date: '2023-11-01',
    status: 'Paid',
    paymentMethod: 'Razorpay',
  }
];

export const events: Event[] = [
  {
    id: 'EVT001',
    name: 'Annual Tech Fest',
    description: 'Contribution for the yearly technology festival.',
    deadline: '2023-11-15',
    cost: 500,
    totalCollected: 45000,
    totalPending: 5000,
    paymentOptions: ['Razorpay', 'QR', 'Cash'],
    qrCodeUrl: 'https://picsum.photos/seed/qr1/300/300',
  },
  {
    id: 'EVT002',
    name: 'Industrial Visit',
    description: 'Fee for the upcoming industrial visit to Pune.',
    deadline: '2023-11-10',
    cost: 1200,
    totalCollected: 60000,
    totalPending: 12000,
    paymentOptions: ['Razorpay'],
  },
  {
    id: 'EVT003',
    name: 'Sports Day Kit',
    description: 'Cost for the official sports day jersey and kit.',
    deadline: '2023-11-20',
    cost: 250,
    totalCollected: 12500,
    totalPending: 12500,
    paymentOptions: ['QR', 'Cash'],
    qrCodeUrl: 'https://picsum.photos/seed/qr2/300/300',
  },
  {
    id: 'EVT004',
    name: 'Workshop Prints',
    description: 'Prints for the upcoming AI/ML workshop.',
    deadline: '2023-10-30',
    cost: 150,
    totalCollected: 7500,
    totalPending: 0,
    paymentOptions: ['Razorpay'],
  },
];

export const students: Student[] = [
  {
    id: 'STU001',
    rollNo: 'B-21',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@example.com',
    class: 'TE-B',
  },
  {
    id: 'STU002',
    rollNo: 'C-05',
    name: 'Priya Singh',
    email: 'priya.singh@example.com',
    class: 'SE-C',
  },
  {
    id: 'STU003',
    rollNo: 'A-15',
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    class: 'TE-A',
  },
  {
    id: 'STU004',
    rollNo: 'B-32',
    name: 'Sneha Patel',
    email: 'sneha.patel@example.com',
    class: 'BE-B',
  },
  {
    id: 'STU005',
    rollNo: 'C-11',
    name: 'Vikram Rathod',
    email: 'vikram.rathod@example.com',
    class: 'TE-C',
  },
];

export const qrCodes: QrCode[] = [
    { id: 'qr1', name: 'GPay Business', url: 'https://picsum.photos/seed/qr1/300/300' },
    { id: 'qr2', name: 'PhonePe Personal', url: 'https://picsum.photos/seed/qr2/300/300' },
];

export const chartData = [
  { month: 'January', collected: 18600, pending: 4000 },
  { month: 'February', collected: 30500, pending: 5000 },
  { month: 'March', collected: 23700, pending: 7500 },
  { month: 'April', collected: 7300, pending: 1200 },
  { month: 'May', collected: 20900, pending: 6000 },
  { month: 'June', collected: 21400, pending: 3000 },
];

export const printDistributions: PrintDistribution[] = [
    {
        id: 'DIST-001',
        studentId: 'STU004',
        studentName: 'Sneha Patel',
        studentRoll: 'B-32',
        eventId: 'EVT004',
        distributedAt: '2023-11-02T10:30:00Z',
    },
];
