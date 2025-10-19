'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Check, ChevronsUpDown, QrCode } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Event, Student, Payment } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export default function PaymentPage() {
  const { eventId } = useParams();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const firestore = useFirestore();

  const [selectedMethod, setSelectedMethod] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const { toast } = useToast();

  const eventRef = useMemoFirebase(() => firestore && eventId && classId ? doc(firestore, `classes/${classId}/events`, eventId as string) : null, [firestore, eventId, classId]);
  const { data: event, isLoading: isEventLoading } = useDoc<Event>(eventRef);

  const studentsRef = useMemoFirebase(() => firestore && classId ? collection(firestore, `classes/${classId}/students`) : null, [firestore, classId]);
  const { data: students, isLoading: areStudentsLoading } = useCollection<Student>(studentsRef);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!searchValue) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, students]);


  if (isEventLoading || areStudentsLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!event || !classId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The event you are looking for does not exist or the class is not specified.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getButtonText = () => {
    if (!selectedMethod) return `Pay ₹${event.cost.toLocaleString()}`;
    switch (selectedMethod) {
      case 'razorpay':
        return `Pay ₹${event.cost.toLocaleString()} with Razorpay`;
      case 'qr':
        return 'Show QR Code & Pay';
      case 'cash':
        return 'Submit for Verification';
      default:
        return `Pay ₹${event.cost.toLocaleString()}`;
    }
  };

  const handlePayClick = () => {
    if (selectedMethod === 'qr') {
      if (event.qrCodeUrl) {
        setShowQrDialog(true);
      } else {
        toast({
          variant: "destructive",
          title: "QR Code Not Available",
          description: "The class representative has not uploaded a QR code for this event."
        })
      }
    } else if (selectedMethod === 'razorpay') {
      // In a real app, this would redirect to Razorpay
      toast({ title: "Redirecting to Razorpay..."});
      if (!selectedStudent || !classId) return;
      
      const paymentData: Omit<Payment, 'id' | 'paymentDate'> = {
        studentId: selectedStudent.id,
        eventId: event.id,
        amount: event.cost,
        transactionId: `RAZORPAY_${Date.now()}`,
        status: 'Paid',
        eventName: event.name,
        studentName: selectedStudent.name,
        studentRoll: selectedStudent.rollNo,
        paymentMethod: 'Razorpay'
      };
      
      const newPayment = { ...paymentData, paymentDate: serverTimestamp() };
      addDocumentNonBlocking(collection(firestore, `classes/${classId}/payments`), newPayment);

      setShowSuccessDialog(true);
    } else if (selectedMethod === 'cash') {
      if (!selectedStudent || !classId) return;
       const paymentData: Omit<Payment, 'id' | 'paymentDate'> = {
        studentId: selectedStudent.id,
        eventId: event.id,
        amount: event.cost,
        transactionId: `CASH_${Date.now()}`,
        status: 'Verification Pending',
        eventName: event.name,
        studentName: selectedStudent.name,
        studentRoll: selectedStudent.rollNo,
        paymentMethod: 'Cash'
      };
      
      const newPayment = { ...paymentData, paymentDate: serverTimestamp() };
      addDocumentNonBlocking(collection(firestore, `classes/${classId}/payments`), newPayment);

       setShowSuccessDialog(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !firestore || !classId) return;
    // In a real app, upload screenshotFile to Firebase Storage
    
    const paymentData: Omit<Payment, 'id' | 'paymentDate'> = {
      studentId: selectedStudent.id,
      eventId: event.id,
      amount: event.cost,
      transactionId: `QR_${Date.now()}`,
      status: 'Verification Pending',
      screenshotUrl: screenshotFile ? 'placeholder_url' : undefined,
      eventName: event.name,
      studentName: selectedStudent.name,
      studentRoll: selectedStudent.rollNo,
      paymentMethod: 'QR Scan'
    };

    const newPayment = { ...paymentData, paymentDate: serverTimestamp() };
    await addDocumentNonBlocking(collection(firestore, `classes/${classId}/payments`), newPayment);
    
    setShowQrDialog(false);
    setShowSuccessDialog(true);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };


  return (
    <>
    <div className="flex min-h-screen flex-col items-center bg-muted/40">
      <header className="w-full px-4 py-6">
        <nav className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-foreground">FundEdHQ</span>
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <main className="flex-1 w-full container mx-auto py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">{event.name}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between text-lg">
              <span className="text-muted-foreground">Amount Due</span>
              <span className="font-bold text-2xl text-primary">₹{event.cost.toLocaleString()}</span>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="student">Select Student</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedStudent
                        ? `${selectedStudent.name} (${selectedStudent.rollNo})`
                        : 'Select student...'}
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
                                <p className="text-xs text-muted-foreground">{student.rollNo} • {student.email}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedStudent && (
                 <div className="grid gap-4 rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Full Name</span>
                        <span>{selectedStudent.name}</span>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Roll Number</span>
                        <span>{selectedStudent.rollNo}</span>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Email</span>
                        <span>{selectedStudent.email}</span>
                    </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select onValueChange={setSelectedMethod} disabled={!selectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {event.paymentOptions.map((option) => (
                      <SelectItem key={option} value={option.toLowerCase()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" disabled={!selectedStudent || !selectedMethod} onClick={handlePayClick}>
              {getButtonText()}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>

    <AlertDialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              Scan to Pay
            </AlertDialogTitle>
            <AlertDialogDescription>
              Use any UPI app to scan the QR code below to pay ₹{event.cost.toLocaleString()} for {event.name}.
              After paying, upload a screenshot for verification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center p-4">
            <Image 
              src={event.qrCodeUrl!}
              alt="QR Code"
              width={250}
              height={250}
              className="rounded-lg border"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="screenshot">Upload Screenshot</Label>
            <div className="flex items-center gap-2">
              <Input id="screenshot" type="file" className="flex-1" accept="image/*" onChange={handleFileChange} />
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowQrDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!screenshotFile}>Submit for Verification</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center">Payment Submitted!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your payment has been submitted for verification. You will receive an email confirmation shortly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <AlertDialogAction asChild>
                <Link href="/">Go to Homepage</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
