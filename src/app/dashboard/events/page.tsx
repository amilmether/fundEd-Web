'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import { MoreHorizontal, PlusCircle, Copy, Pencil, Eye, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Event, QrCode, Payment } from '@/lib/types';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Timestamp } from 'firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader } from '@/components/ui/loader';

export default function EventsPage() {
  const firestore = useFirestore();
  // TODO: Replace with dynamic classId from user profile
  const classId = 'class-1';

  const eventsCollection = useMemoFirebase(() => firestore ? collection(firestore, `classes/${classId}/events`) : null, [firestore, classId]);
  const { data: events, isLoading: areEventsLoading } = useCollection<Event>(eventsCollection);

  const qrCodesCollection = useMemoFirebase(() => firestore ? collection(firestore, `classes/${classId}/qrcodes`) : null, [firestore, classId]);
  const { data: qrCodes, isLoading: areQrCodesLoading } = useCollection<QrCode>(qrCodesCollection);

  const paymentsCollection = useMemoFirebase(() => firestore ? collection(firestore, `classes/${classId}/payments`) : null, [firestore, classId]);
  const { data: payments } = useCollection<Payment>(paymentsCollection);


  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();
  const [paymentOptions, setPaymentOptions] = useState<('Razorpay' | 'QR' | 'Cash')[]>([]);
  const [selectedQrCode, setSelectedQrCode] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<Event['category']>('Normal');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const getCollectedAmountForEvent = (eventId: string) => {
    if (!payments) return 0;
    return payments
      .filter(p => p.eventId === eventId && p.status === 'Paid')
      .reduce((acc, p) => acc + p.amount, 0);
  }

  const formatDate = (date: Date | Timestamp | string) => {
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };


  const handleCopyLink = (eventId: string) => {
    const link = `${window.location.origin}/pay/${eventId}?classId=${classId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied',
      description: 'Payment link has been copied to your clipboard.',
    });
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setPaymentOptions(event.paymentOptions);
    setSelectedQrCode(event.qrCodeUrl);
    setCategory(event.category);
    setOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedEvent(null);
    setPaymentOptions(['Razorpay']);
    setSelectedQrCode(undefined);
    setCategory('Normal');
    setOpen(true);
  };

  const handlePaymentOptionChange = (option: 'Razorpay' | 'QR' | 'Cash') => {
    setPaymentOptions(prev => 
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  }
  
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const cost = Number(formData.get('cost'));
    const deadline = formData.get('deadline') as string;

    const eventData: Omit<Event, 'id' | 'totalCollected' | 'totalPending'> = {
      name,
      description,
      cost,
      deadline: Timestamp.fromDate(new Date(deadline)),
      paymentOptions,
      qrCodeUrl: selectedQrCode || '',
      category,
    };

    if (selectedEvent) {
      // Update existing event
      const eventRef = doc(firestore, `classes/${classId}/events`, selectedEvent.id);
      const dataToUpdate = {
        ...eventData,
      };
      setDocumentNonBlocking(eventRef, dataToUpdate, { merge: true });
      toast({ title: 'Event Updated' });
    } else {
      // Create new event
      const dataToCreate = {
        ...eventData,
        totalCollected: 0,
        totalPending: 0,
      };
      addDocumentNonBlocking(collection(firestore, `classes/${classId}/events`), dataToCreate);
      toast({ title: 'Event Created' });
    }

    setOpen(false);
  }

  const openDeleteDialog = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  }

  const handleDeleteEvent = () => {
    if (!firestore || !eventToDelete) return;
    const eventRef = doc(firestore, `classes/${classId}/events`, eventToDelete.id);
    deleteDocumentNonBlocking(eventRef);
    toast({ title: 'Event Deleted', description: `${eventToDelete.name} has been removed.` });
    setDeleteDialogOpen(false);
    setEventToDelete(null);
    setDeleteConfirmation('');
  }

  const selectedQrCodeData = qrCodes?.find(qr => qr.url === selectedQrCode);

  const EventActions = ({ event }: { event: Event }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleEdit(event)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/events/${event.id}/payments`}>
            <Eye className="mr-2 h-4 w-4" />
            View Payments
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyLink(event.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Payment Link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(event)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Manage your class events and fund collections.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" onClick={handleCreateNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="whitespace-nowrap">Create Event</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveEvent}>
              <DialogHeader>
                <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                <DialogDescription>
                  {selectedEvent
                    ? 'Update the details for your event.'
                    : 'Fill in the details below to create a new event for fund collection.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedEvent?.name}
                    placeholder="e.g., Annual Tech Fest"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={selectedEvent?.description}
                    placeholder="A short description of the event"
                    className="col-span-3"
                    required
                  />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <div className="col-span-3">
                      <Select onValueChange={(value) => setCategory(value as Event['category'])} value={category}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Print">Print</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cost" className="text-right">
                    Cost (₹)
                  </Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    defaultValue={selectedEvent?.cost}
                    placeholder="e.g., 500"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deadline" className="text-right">
                    Deadline
                  </Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    defaultValue={
                      selectedEvent?.deadline ? new Date(selectedEvent.deadline instanceof Timestamp ? selectedEvent.deadline.toDate() : selectedEvent.deadline).toISOString().split('T')[0] : ''
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    Payment Options
                  </Label>
                  <div className="col-span-3 grid gap-2">
                      <div className="flex items-center space-x-2">
                          <Checkbox id="razorpay" checked={paymentOptions.includes('Razorpay')} onCheckedChange={() => handlePaymentOptionChange('Razorpay')} />
                          <label htmlFor="razorpay" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Razorpay</label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Checkbox id="qr" checked={paymentOptions.includes('QR')} onCheckedChange={() => handlePaymentOptionChange('QR')} />
                          <label htmlFor="qr" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">QR Code</label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <Checkbox id="cash" checked={paymentOptions.includes('Cash')} onCheckedChange={() => handlePaymentOptionChange('Cash')} />
                          <label htmlFor="cash" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cash</label>
                      </div>
                  </div>
                </div>
                {paymentOptions.includes('QR') && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="qr-code" className="text-right">
                      QR Code
                    </Label>
                    <div className="col-span-3">
                      <Select onValueChange={setSelectedQrCode} value={selectedQrCode}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a QR code" />
                        </SelectTrigger>
                        <SelectContent>
                          {areQrCodesLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : qrCodes?.map(qr => (
                            <SelectItem key={qr.id} value={qr.url}>{qr.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       {selectedQrCodeData && (
                        <div className="mt-2 flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                          <Image src={selectedQrCodeData.url} alt={selectedQrCodeData.name} width={40} height={40} className="rounded-sm" />
                          <p className="text-sm font-medium">{selectedQrCodeData.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {selectedEvent ? 'Save Changes' : 'Create Event'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {areEventsLoading ? <div className="flex justify-center items-center py-12"><Loader text="Loading events..." /></div> : (
            <>
            {/* Mobile View */}
            <div className="grid gap-4 md:hidden">
              {events?.map((event) => (
                <Card key={event.id} className="w-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{event.name}</CardTitle>
                        <CardDescription>{event.description}</CardDescription>
                      </div>
                      <EventActions event={event} />
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cost</span>
                      <span>₹{event.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Collected</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ₹{getCollectedAmountForEvent(event.id).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Deadline</span>
                      <span>{formatDate(event.deadline)}</span>
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
                    <TableHead>Event</TableHead>
                    <TableHead className="hidden sm:table-cell">Cost</TableHead>
                    <TableHead className="hidden md:table-cell">Collected</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events?.map((event) => (
                    <TableRow key={event.id}>
                        <TableCell>
                        <div className="font-bold">{event.name}</div>
                        <div className="text-sm text-muted-foreground hidden sm:inline">
                            {event.description}
                        </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">₹{event.cost.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 dark:text-green-400 hidden md:table-cell font-semibold">
                        ₹{getCollectedAmountForEvent(event.id).toLocaleString()}
                        </TableCell>
                        <TableCell>{formatDate(event.deadline)}</TableCell>
                        <TableCell className="text-right">
                          <EventActions event={event} />
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>

            {events?.length === 0 && !areEventsLoading && (
                <div className="text-center py-12 text-muted-foreground">
                    No events created yet.
                </div>
            )}
            </>
        )}
      </CardContent>
    </Card>
    
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            event <span className="font-semibold text-foreground">{eventToDelete?.name}</span> and all associated payments. 
            To confirm, please type <strong className="text-foreground">delete</strong> below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="delete"
            className="my-2"
          />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteEvent}
            disabled={deleteConfirmation !== 'delete'}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Event
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
