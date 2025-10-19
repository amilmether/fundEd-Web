'use client';

import { useParams } from 'next/navigation';
import { events, students } from '@/lib/data';
import type { Student } from '@/lib/types';
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


export default function PaymentPage() {
  const { eventId } = useParams();
  const event = events.find((e) => e.id === eventId);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [showQrDialog, setShowQrDialog] = useState(false);

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The event you are looking for does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showScreenshotUpload = selectedMethod === 'qr' || selectedMethod === 'cash';

  const filteredStudents = useMemo(() => {
    if (!searchValue) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  const getButtonText = () => {
    if (!selectedMethod) return `Pay ₹${event.cost.toLocaleString()}`;
    switch (selectedMethod) {
      case 'razorpay':
        return `Pay ₹${event.cost.toLocaleString()} with Razorpay`;
      case 'qr':
        return 'Show QR Code';
      case 'cash':
        return 'Confirm Cash Payment';
      default:
        return `Pay ₹${event.cost.toLocaleString()}`;
    }
  }

  const handlePayClick = () => {
    if (selectedMethod === 'qr') {
      setShowQrDialog(true);
    } else {
      // Handle other payment logic (Razorpay, Cash)
      alert(`Processing ${selectedMethod} payment...`);
    }
  }

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
              {showScreenshotUpload && (
                <div className="grid gap-2">
                  <Label htmlFor="screenshot">Upload Screenshot/Proof</Label>
                  <div className="flex items-center gap-2">
                    <Input id="screenshot" type="file" className="flex-1" />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedMethod === 'qr'
                      ? 'Please upload a screenshot of your QR payment for verification.'
                      : 'Please get your payment confirmed by the class representative.'}
                  </p>
                </div>
              )}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              Scan to Pay
            </AlertDialogTitle>
            <AlertDialogDescription>
              Use any UPI app to scan the QR code below to complete your payment of ₹{event.cost.toLocaleString()} for {event.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center p-4">
            <Image 
              src="https://picsum.photos/seed/qr/300/300"
              alt="QR Code"
              width={250}
              height={250}
              className="rounded-lg border"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            After paying, please upload a screenshot on the previous page for verification.
          </p>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowQrDialog(false)}>
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
