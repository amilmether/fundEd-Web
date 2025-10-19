'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import type { Transaction, Student } from '@/lib/types';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, Timestamp } from 'firebase/firestore';
import { BrandedLoader } from '@/components/ui/branded-loader';


const getStatusBadgeVariant = (status: Transaction['status']) => {
  switch (status) {
    case 'Paid':
      return 'paid';
    case 'Pending':
      return 'pending';
    case 'Failed':
      return 'failed';
    case 'Verification Pending':
      return 'verification';
    default:
      return 'default';
  }
};


export default function StudentPaymentsPage() {
  const { studentId } = useParams();
  const firestore = useFirestore();
  // TODO: Replace with dynamic classId from user profile
  const classId = 'class-1';
  const studentIdStr = studentId as string;

  const studentRef = useMemoFirebase(() => firestore && studentIdStr ? doc(firestore, `classes/${classId}/students`, studentIdStr) : null, [firestore, studentIdStr, classId]);
  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentRef);
  
  const paymentsQuery = useMemoFirebase(() => firestore && studentIdStr ? query(collection(firestore, `classes/${classId}/payments`), where('studentId', '==', studentIdStr)) : null, [firestore, studentIdStr, classId]);
  const { data: transactions, isLoading: areTransactionsLoading } = useCollection<Transaction>(paymentsQuery);

  const formatDate = (date: Date | Timestamp | string) => {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  if (isStudentLoading || areTransactionsLoading) {
    return (
        <Card className="flex items-center justify-center py-12">
            <BrandedLoader />
        </Card>
    )
  }

  if (!student) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The student you are looking for does not exist.</p>
           <Button asChild variant="link" className="mt-4 px-0">
            <Link href="/dashboard/students">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const StatusBadge = ({ status }: { status: Transaction['status'] }) => {
    const variant = getStatusBadgeVariant(status);
    return (
      <Badge variant={variant as any}>
        {status}
      </Badge>
    );
  };
  

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/dashboard/students">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
            <div>
                <CardTitle>Payments for {student.name}</CardTitle>
                <CardDescription>
                A list of all transactions made by this student.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
         {/* Mobile View */}
        <div className="grid gap-4 md:hidden">
            {transactions?.map(transaction => (
              <Card key={transaction.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-code">{transaction.id}</CardTitle>
                      <CardDescription>{transaction.eventName}</CardDescription>
                    </div>
                     <StatusBadge status={transaction.status} />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">₹{transaction.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{formatDate(transaction.paymentDate)}</span>
                  </div>
                   <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span>{transaction.paymentMethod}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions?.map((transaction) => (
                <TableRow key={transaction.id}>
                    <TableCell className="font-code">{transaction.id}</TableCell>
                    <TableCell>
                    <div className="font-medium">{transaction.eventName}</div>
                    </TableCell>
                    <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                    <TableCell>{formatDate(transaction.paymentDate)}</TableCell>
                    <TableCell>{transaction.paymentMethod}</TableCell>
                    <TableCell>
                    <StatusBadge status={transaction.status} />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
        {transactions?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No payments found for this student.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
