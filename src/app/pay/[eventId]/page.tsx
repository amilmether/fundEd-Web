
'use client';

import { useParams } from 'next/navigation';
import { events } from '@/lib/data';
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
import { Upload } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';

export default function PaymentPage() {
  const { eventId } = useParams();
  const event = events.find((e) => e.id === eventId);
  const [selectedMethod, setSelectedMethod] = useState('');

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

  return (
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
                    <Label htmlFor="rollNo">Roll Number</Label>
                    <Input id="rollNo" placeholder="Enter your roll number" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your full name" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select onValueChange={setSelectedMethod}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                        <SelectContent>
                            {event.paymentOptions.map(option => (
                                <SelectItem key={option} value={option.toLowerCase()}>{option}</SelectItem>
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
                        {selectedMethod === 'qr' ? 'Please upload a screenshot of your QR payment.' : 'Please ask the rep to confirm your cash payment.'}
                      </p>
                  </div>
                 )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg">Pay ₹{event.cost.toLocaleString()}</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
