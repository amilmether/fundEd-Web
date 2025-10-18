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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { events } from '@/lib/data';

export default function EventsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Manage your class events and fund collections.
          </CardDescription>
        </div>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="whitespace-nowrap">Create Event</span>
        </Button>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Payments</DropdownMenuItem>
                      <DropdownMenuItem>Generate Invoice</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Payments</DropdownMenuItem>
                      <DropdownMenuItem>Generate Invoice</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
