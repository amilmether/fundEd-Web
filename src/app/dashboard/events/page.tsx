'use client';

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
import { MoreHorizontal, PlusCircle, Copy, Pencil, Eye } from 'lucide-react';
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
import { events } from '@/lib/data';
import type { Event } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function EventsPage() {
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  const handleCopyLink = (eventId: string) => {
    const link = `${window.location.origin}/pay/${eventId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied',
      description: 'Payment link has been copied to your clipboard.',
    });
  };
  
  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setOpen(true);
  };
  
  const handleCreateNew = () => {
    setSelectedEvent(null);
    setOpen(true);
  }

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
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          View Payments
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopyLink(event.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Payment Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {selectedEvent ? 'Update the details for your event.' : 'Fill in the details below to create a new event for fund collection.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" defaultValue={selectedEvent?.name} placeholder="e.g., Annual Tech Fest" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea id="description" defaultValue={selectedEvent?.description} placeholder="A short description of the event" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">
                  Cost (₹)
                </Label>
                <Input id="cost" type="number" defaultValue={selectedEvent?.cost} placeholder="e.g., 500" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right">
                  Deadline
                </Label>
                <Input id="deadline" type="date" defaultValue={selectedEvent ? new Date(selectedEvent.deadline).toISOString().split('T')[0] : ''} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" onClick={() => setOpen(false)}>{selectedEvent ? 'Save Changes' : 'Create Event'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="grid gap-4 md:hidden">
          {events.map((event) => (
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
                  <span className="text-green-600 dark:text-green-400">₹{event.totalCollected.toLocaleString()}</span>
                </div>
                 <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="text-orange-600 dark:text-orange-400">₹{event.totalPending.toLocaleString()}</span>
                </div>
                 <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deadline</span>
                  <span>{new Date(event.deadline).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Desktop View */}
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead className="hidden sm:table-cell">Cost</TableHead>
              <TableHead className="hidden md:table-cell">Collected</TableHead>
              <TableHead className="hidden md:table-cell">Pending</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="font-bold">{event.name}</div>
                  <div className="text-sm text-muted-foreground hidden sm:inline">{event.description}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">₹{event.cost.toLocaleString()}</TableCell>
                <TableCell className="text-green-600 dark:text-green-400 hidden md:table-cell">
                  ₹{event.totalCollected.toLocaleString()}
                </TableCell>
                <TableCell className="text-orange-600 dark:text-orange-400 hidden md:table-cell">
                  ₹{event.totalPending.toLocaleString()}
                </TableCell>
                <TableCell>{new Date(event.deadline).toLocaleDateString()}</TableCell>
                <TableCell>
                  <EventActions event={event} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
