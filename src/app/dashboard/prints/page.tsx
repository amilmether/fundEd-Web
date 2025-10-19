'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, PackageCheck } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Student, PrintDistribution, Event, Payment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { sendPrintDistributionEmail } from '@/app/actions';

export default function PrintsPage() {
  const firestore = useFirestore();
  // TODO: Replace with dynamic classId from user profile
  const classId = 'class-1';
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const printEventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, `classes/${classId}/events`), where('category', '==', 'Print')) : null, [firestore, classId]);
  const { data: printEvents } = useCollection<Event>(printEventsQuery);

  const studentsQuery = useMemoFirebase(() => firestore ? collection(firestore, `classes/${classId}/students`) : null, [firestore, classId]);
  const { data: allStudents } = useCollection<Student>(studentsQuery);
  
  const distributionsQuery = useMemoFirebase(() => (firestore && selectedEventId) ? query(collection(firestore, `classes/${classId}/print_distributions`), where('eventId', '==', selectedEventId)) : null, [firestore, selectedEventId, classId]);
  const { data: distributions } = useCollection<PrintDistribution>(distributionsQuery);
  

  const studentsWhoPaidQuery = useMemoFirebase(() => {
    if (!selectedEventId || !firestore) return null;
    return query(collection(firestore, `classes/${classId}/payments`), where('eventId', '==', selectedEventId), where('status', '==', 'Paid'));
  }, [firestore, selectedEventId, classId]);

  const { data: paidPayments } = useCollection<Payment>(studentsWhoPaidQuery);

  const studentsWhoPaid = useMemo(() => {
    if (!allStudents || !paidPayments || !distributions) return [];
    
    const paidStudentIds = paidPayments.map(p => p.studentId);
    const distributedStudentIds = distributions.map(d => d.studentId);

    return allStudents.filter(s => paidStudentIds.includes(s.id) && !distributedStudentIds.includes(s.id));
  }, [allStudents, paidPayments, distributions]);


  const filteredStudents = useMemo(() => {
    if (!searchValue) return studentsWhoPaid;
    return studentsWhoPaid.filter(
      (student) =>
        student.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, studentsWhoPaid]);
  
  const eventDistributions = distributions;
  const selectedEvent = printEvents?.find(e => e.id === selectedEventId);

  const handleDistribute = async () => {
    if (selectedStudent && selectedEventId && firestore && selectedEvent) {
        const newDistribution: Omit<PrintDistribution, 'id' | 'distributedAt'> = {
            studentId: selectedStudent.id,
            studentName: selectedStudent.name,
            studentRoll: selectedStudent.rollNo,
            eventId: selectedEventId,
        };
        
        await addDocumentNonBlocking(collection(firestore, `classes/${classId}/print_distributions`), {
            ...newDistribution,
            distributedAt: Timestamp.now(),
        });
        
        await sendPrintDistributionEmail({
            studentName: selectedStudent.name,
            studentEmail: selectedStudent.email,
            eventName: selectedEvent.name,
        });

        toast({
            title: 'Print Distributed',
            description: `${selectedStudent.name} has received their prints and has been notified.`,
        });
        setSelectedStudent(null);
        setSearchValue('');
    }
  };

  const formatDate = (date: Date | Timestamp | string) => {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };


  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Print Distribution</CardTitle>
          <CardDescription>
            Manage the distribution of prints to students who have paid.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Select Print Event</Label>
              <Select onValueChange={setSelectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {printEvents?.map(event => (
                    <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          <div className="grid gap-2">
            <Label htmlFor="student">Search Student (Name or Roll No.)</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={!selectedEventId || studentsWhoPaid.length === 0}
                >
                  {selectedStudent
                    ? `${selectedStudent.name} (${selectedStudent.rollNo})`
                    : studentsWhoPaid.length > 0 ? 'Select student...' : 'All prints distributed'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search by name or roll no..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                   <CommandList>
                    <CommandEmpty>No student found.</CommandEmpty>
                    <CommandGroup>
                      {filteredStudents.map((student) => (
                        <CommandItem
                          key={student.id}
                          value={`${student.name} ${student.rollNo}`}
                          onSelect={() => {
                            setSelectedStudent(student);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedStudent?.id === student.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                           <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.rollNo}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter>
            <Button disabled={!selectedStudent} onClick={handleDistribute}>
                <PackageCheck className="mr-2 h-4 w-4" />
                Mark as Distributed
            </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution History</CardTitle>
          <CardDescription>
            A log of all students who have received their prints for the selected event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="grid gap-4 md:hidden">
              {eventDistributions?.map(dist => (
                  <Card key={dist.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium">{dist.studentName}</p>
                            <p className="text-sm text-muted-foreground">{dist.studentRoll}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            <p>{formatDate(dist.distributedAt)}</p>
                            <p>{new Date(dist.distributedAt instanceof Timestamp ? dist.distributedAt.toDate() : dist.distributedAt).toLocaleTimeString()}</p>
                        </div>
                    </CardContent>
                  </Card>
              ))}
          </div>
          {/* Desktop View */}
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Date Distributed</TableHead>
                <TableHead>Time Distributed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventDistributions?.map(dist => (
                <TableRow key={dist.id}>
                  <TableCell className="font-medium">{dist.studentName}</TableCell>
                  <TableCell>{dist.studentRoll}</TableCell>
                  <TableCell>{formatDate(dist.distributedAt)}</TableCell>
                  <TableCell>{new Date(dist.distributedAt instanceof Timestamp ? dist.distributedAt.toDate() : dist.distributedAt).toLocaleTimeString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {eventDistributions?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                No distribution history for this event yet.
            </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
