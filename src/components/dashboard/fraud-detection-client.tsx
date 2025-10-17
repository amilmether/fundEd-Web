'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { detectFraud } from '@/app/actions/detect-fraud';
import type { PaymentFraudDetectionOutput } from '@/ai/flows/payment-fraud-detection';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, ShieldCheck, Upload } from 'lucide-react';

const formSchema = z.object({
  paymentData: z.string().min(1, 'Payment data is required.'),
  studentInfo: z.string().min(1, 'Student info is required.'),
  eventDetails: z.string().min(1, 'Event details are required.'),
  screenshot: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FraudDetectionClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaymentFraudDetectionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentData: '',
      studentInfo: '',
      eventDetails: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    let screenshotDataUri: string | undefined = undefined;
    if (values.screenshot && values.screenshot.length > 0) {
      try {
        screenshotDataUri = await fileToDataUri(values.screenshot[0]);
      } catch (e) {
        setError('Failed to read screenshot file.');
        setIsLoading(false);
        return;
      }
    }
    
    const response = await detectFraud({
      paymentData: values.paymentData,
      studentInfo: values.studentInfo,
      eventDetails: values.eventDetails,
      screenshotDataUri: screenshotDataUri,
    });

    if (response.success) {
      setResult(response.data);
    } else {
      setError(response.error);
    }
    setIsLoading(false);
  };
  
  const screenshotRef = form.register("screenshot");

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Fraud Detection Tool</CardTitle>
          <CardDescription>
            Analyze payment details to identify potentially fraudulent activities.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="paymentData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Data</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., TXN12389, Amount: 500, Timestamp: ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Info</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Roll: A-15, Name: Amit Kumar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Details</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Event: Annual Tech Fest, Cost: 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="screenshot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Screenshot (Optional)</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" {...screenshotRef} />
                    </FormControl>
                    <FormDescription>
                      Upload a screenshot of the payment for analysis.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Payment'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <div className="space-y-4">
        <h3 className="font-headline text-2xl font-semibold">Analysis Result</h3>
        {isLoading && (
           <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
             <div className="flex flex-col items-center gap-2 text-muted-foreground">
               <Loader2 className="h-10 w-10 animate-spin text-primary" />
               <p className="font-semibold">AI is analyzing the transaction...</p>
               <p className="text-sm">This may take a few moments.</p>
             </div>
           </div>
        )}

        {error && (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        {!isLoading && !result && !error && (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <p className="text-muted-foreground">Analysis results will appear here.</p>
            </div>
        )}
        
        {result && (
          <Card className={result.isFraudulent ? "border-destructive" : "border-green-500"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.isFraudulent ? (
                  <>
                    <ShieldAlert className="h-6 w-6 text-destructive" />
                    <span>Potential Fraud Detected</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                    <span>No Fraud Detected</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{result.fraudExplanation}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
