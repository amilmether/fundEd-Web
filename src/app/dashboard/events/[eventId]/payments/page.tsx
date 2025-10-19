
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
import { events, transactions } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default function EventPaymentsPage() {
  const { eventId } = useParams();
  const event = events.find((e) => e.id === eventId);
  const eventTransactions = transactions.filter(
    (t) => t.eventName === event?.name
  );

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
            {eventTransactions.map(transaction => (
              <Card key={transaction.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-code">{transaction.id}</CardTitle>
                      <CardDescription>{transaction.studentName} ({transaction.studentRoll})</CardDescription>
                    </div>
                     <Badge variant={transaction.status === 'Paid' ? 'default' : transaction.status === 'Pending' ? 'secondary' : 'destructive'}
                       className={cn(
                         'whitespace-nowrap',
                         transaction.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                         transaction.status === 'Pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' : 
                         'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                       )}>
                       {transaction.status}
                     </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">₹{transaction.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
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
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-code">{transaction.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{transaction.studentName}</div>
                  <div className="text-xs text-muted-foreground">
                    {transaction.studentRoll}
                  </div>
                </TableCell>
                <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.paymentMethod}</TableCell>
                <TableCell>
                   <Badge variant={transaction.status === 'Paid' ? 'default' : transaction.status === 'Pending' ? 'secondary' : 'destructive'}
                       className={cn(
                        'whitespace-nowrap border',
                        transaction.status === 'Paid' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800' : 
                        transaction.status === 'Pending' ? 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800' : 
                        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800'
                       )}>
                       {transaction.status}
                     </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {eventTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No payments found for this event.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
