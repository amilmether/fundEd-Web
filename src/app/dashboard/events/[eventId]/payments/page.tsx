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
import { ArrowLeft, Check, X } from 'lucide-react';
import type { Transaction, Event } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, Timestamp } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


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


export default function EventPaymentsPage() {
  const { eventId } = useParams();
  const firestore = useFirestore();
  const { toast } = useToast();
  // TODO: Replace with dynamic classId from user profile
  const classId = 'class-1';

  const eventRef = useMemoFirebase(() => firestore && eventId ? doc(firestore, `classes/${classId}/events`, eventId as string) : null, [firestore, eventId]);
  const { data: event, isLoading: isEventLoading } = useDoc<Event>(eventRef);
  
  const paymentsQuery = useMemoFirebase(() => firestore && eventId ? query(collection(firestore, `classes/${classId}/payments`), where('eventId', '==', eventId)) : null, [firestore, eventId]);
  const { data: transactions, isLoading: areTransactionsLoading } = useCollection<Transaction>(paymentsQuery);
  
  const handlePaymentAction = (transactionId: string, newStatus: 'Paid' | 'Failed') => {
    if (!firestore) return;
    const paymentRef = doc(firestore, `classes/${classId}/payments`, transactionId);
    updateDocumentNonBlocking(paymentRef, { status: newStatus });

    toast({
        title: "Payment Status Updated",
        description: `Transaction ${transactionId} has been marked as ${newStatus}.`
    })
  };

  if (isEventLoading || areTransactionsLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loading...</CardTitle>
            </CardHeader>
        </Card>
    )
  }

  if (!event) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The event you are looking for does not exist.</p>
           <Button asChild variant="link" className="mt-4 px-0">
            <Link href="/dashboard/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
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
  
  const PaymentActions = ({ transaction }: { transaction: Transaction }) => {
    if (transaction.status !== 'Verification Pending') return null;

    return (
      <div className="flex items-center gap-2">
        <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            onClick={() => handlePaymentAction(transaction.id, 'Paid')}>
          <Check className="h-4 w-4" />
          <span className="sr-only">Confirm</span>
        </Button>
        <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            onClick={() => handlePaymentAction(transaction.id, 'Failed')}>
          <X className="h-4 w-4" />
          <span className="sr-only">Reject</span>
        </Button>
      </div>
    );
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/dashboard/events">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
            <div>
                <CardTitle>Payments for {event.name}</CardTitle>
                <CardDescription>
                A list of all transactions for this event.
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
                      <CardDescription>{transaction.studentName} ({transaction.studentRoll})</CardDescription>
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
                    <span>{new Date(transaction.paymentDate instanceof Timestamp ? transaction.paymentDate.toDate() : transaction.paymentDate).toLocaleDateString()}</span>
                  </div>
                   <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span>{transaction.paymentMethod}</span>
                  </div>
                </CardContent>
                {transaction.status === 'Verification Pending' && (
                  <CardContent>
                    <div className="flex justify-end gap-2">
                       <PaymentActions transaction={transaction}/>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
        </div>

        {/* Desktop View */}
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-code">{transaction.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{transaction.studentName}</div>
                  <div className="text-xs text-muted-foreground">
                    {transaction.studentRoll}
                  </div>
                </TableCell>
                <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                <TableCell>{new Date(transaction.paymentDate instanceof Timestamp ? transaction.paymentDate.toDate() : transaction.paymentDate).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.paymentMethod}</TableCell>
                <TableCell>
                   <StatusBadge status={transaction.status} />
                </TableCell>
                <TableCell className="text-right">
                    <PaymentActions transaction={transaction} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {transactions?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No payments found for this event.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
