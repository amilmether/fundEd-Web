
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { transactions } from '@/lib/data';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ReportsPage() {
  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>
            Download detailed financial reports for your records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select defaultValue="transaction">
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transaction">Transaction Summary</SelectItem>
                  <SelectItem value="event">Event-wise Report</SelectItem>
                  <SelectItem value="student">Student-wise Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date-from">Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-from"
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !Date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Pick a date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date-to">Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-to"
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !Date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Pick a date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History Preview</CardTitle>
          <CardDescription>A preview of all recorded transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="grid gap-4 md:hidden">
            {transactions.map(transaction => (
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
                         transaction.status === 'Paid' ? 'bg-green-500/20 text-green-700 border-green-500/20' : 
                         transaction.status === 'Pending' ? 'bg-orange-500/20 text-orange-700 border-orange-500/20' : ''
                       )}>
                       {transaction.status}
                     </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Event</span>
                    <span>{transaction.eventName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">₹{transaction.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
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
                <TableHead>Event</TableHead>
                <TableHead className="hidden sm:table-cell">Amount</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(transaction => (
                 <TableRow key={transaction.id}>
                   <TableCell className="font-code">{transaction.id}</TableCell>
                   <TableCell>
                     <div>{transaction.studentName}</div>
                     <div className="text-xs text-muted-foreground">{transaction.studentRoll}</div>
                   </TableCell>
                   <TableCell>{transaction.eventName}</TableCell>
                   <TableCell className="hidden sm:table-cell">₹{transaction.amount.toLocaleString()}</TableCell>
                   <TableCell className="hidden sm:table-cell">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                   <TableCell>
                     <Badge variant={transaction.status === 'Paid' ? 'default' : transaction.status === 'Pending' ? 'secondary' : 'destructive'}
                       className={transaction.status === 'Paid' ? 'bg-green-500/20 text-green-700 border-green-500/20' : transaction.status === 'Pending' ? 'bg-orange-500/20 text-orange-700 border-orange-500/20' : ''}>
                       {transaction.status}
                     </Badge>
                   </TableCell>
                 </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
