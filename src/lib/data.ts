// This file is no longer in use and can be deleted. All data is now fetched from Firebase.
import type { Transaction, Event, Student, QrCode, PrintDistribution } from './types';

export const transactions: Transaction[] = [];

export const events: Event[] = [];

export const students: Student[] = [];

export const qrCodes: QrCode[] = [];

export const chartData = [
  { month: 'January', collected: 18600, pending: 4000 },
  { month: 'February', collected: 30500, pending: 5000 },
  { month: 'March', collected: 23700, pending: 7500 },
  { month: 'April', collected: 7300, pending: 1200 },
  { month: 'May', collected: 20900, pending: 6000 },
  { month: 'June', collected: 21400, pending: 3000 },
];

export const printDistributions: PrintDistribution[] = [];
